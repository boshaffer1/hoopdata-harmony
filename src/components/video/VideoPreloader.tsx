import React, { useEffect, useRef, useState } from 'react';
import { getBestStorageUrl } from '@/utils/supabase-helpers';

interface VideoPath {
  bucket: string;
  path: string;
}

interface VideoPreloaderProps {
  /**
   * Array of video paths to preload
   */
  videoPaths?: VideoPath[];
  
  /**
   * Maximum number of videos to preload at once
   */
  maxPreload?: number;
  
  /**
   * Alternative API - direct video URLs to preload if videoPaths not provided
   */
  videoUrls?: string[];
  
  /**
   * Current active video URL (won't be preloaded)
   */
  currentVideoUrl?: string;
}

/**
 * Component that preloads upcoming video clips to improve playback experience
 * This invisibly loads videos in the background to improve performance
 */
const VideoPreloader: React.FC<VideoPreloaderProps> = ({
  videoPaths = [],
  videoUrls = [],
  maxPreload = 2,
  currentVideoUrl
}) => {
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  const activePreloadUrlsRef = useRef<Set<string>>(new Set()); // Track currently active preloads
  const fetchControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Clean up function to remove any in-progress fetches
  const cancelFetches = () => {
    // Abort all controllers
    fetchControllersRef.current.forEach((controller, url) => {
      try {
        controller.abort();
        console.log(`Cancelled preload for: ${url.substring(0, 30)}...`);
      } catch (e) {
        // Ignore abort errors
      }
    });
    
    // Clear the controller map and active preloads
    fetchControllersRef.current.clear();
    activePreloadUrlsRef.current.clear();
  };
  
  // Preload function that uses fetch instead of link preload
  // This avoids browser warnings and works better
  const preloadUrl = (url: string) => {
    // Skip if already preloaded or currently preloading
    if (!url || 
        preloadedUrlsRef.current.has(url) || 
        activePreloadUrlsRef.current.has(url)) {
      return;
    }
    
    // Skip if this URL contains the current video URL (more robust matching)
    if (currentVideoUrl && (url.includes(currentVideoUrl) || currentVideoUrl.includes(url))) {
      console.log(`Skipping preload for current video: ${url.substring(0, 30)}...`);
      return;
    }
    
    // Check for partial URLs (we consider them the same if the path portion matches)
    const urlPath = new URL(url).pathname;
    for (const activeUrl of activePreloadUrlsRef.current) {
      try {
        const activePath = new URL(activeUrl).pathname;
        if (activePath === urlPath) {
          console.log(`Skipping duplicate preload for path: ${urlPath}`);
          return;
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
    }
    
    try {
      console.log(`Preloading: ${url.substring(0, 60)}...`);
      
      // Mark this URL as being actively preloaded
      activePreloadUrlsRef.current.add(url);
      
      // Abort any existing controller for this URL first
      if (fetchControllersRef.current.has(url)) {
        try {
          fetchControllersRef.current.get(url)?.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
      
      // Create a new controller for this request
      const controller = new AbortController();
      fetchControllersRef.current.set(url, controller);
      
      // Add a timeout to automatically abort if it takes too long
      const timeoutId = setTimeout(() => {
        if (fetchControllersRef.current.has(url)) {
          console.log(`Preload timeout for ${url.substring(0, 30)}...`);
          controller.abort();
          fetchControllersRef.current.delete(url);
          activePreloadUrlsRef.current.delete(url);
        }
      }, 5000); // Reduced from 10s to 5s to fail faster when needed
      
      // Request a smaller amount of data (8KB instead of 32KB)
      // This is enough to establish the connection but won't compete
      // as much with an actual video that's playing
      fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-8191' // First 8KB
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'same-origin'
      })
      .then(response => {
        // Just getting the headers and first bytes is enough to warm connections
        console.log(`Preloaded initial chunk of ${url.substring(0, 30)}...`);
        
        // Mark as successfully preloaded
        preloadedUrlsRef.current.add(url);
        
        // Clean up
        clearTimeout(timeoutId);
        fetchControllersRef.current.delete(url);
        activePreloadUrlsRef.current.delete(url);
      })
      .catch(err => {
        // Clean up on error
        clearTimeout(timeoutId);
        fetchControllersRef.current.delete(url);
        activePreloadUrlsRef.current.delete(url);
        
        if (err.name !== 'AbortError') {
          console.warn(`Error preloading ${url}:`, err.message);
        }
      });
    } catch (e) {
      console.warn(`Error setting up preload for ${url}:`, e);
      activePreloadUrlsRef.current.delete(url);
    }
  };
  
  // Process direct video URLs
  useEffect(() => {
    if (!videoUrls || videoUrls.length === 0) return;
    
    // Filter URLs to exclude the current one
    const urlsToPreload = videoUrls
      .filter(url => {
        if (!url) return false;
        // More robust check for current video
        if (currentVideoUrl && (url.includes(currentVideoUrl) || currentVideoUrl.includes(url))) {
          return false;
        }
        return true;
      })
      .slice(0, maxPreload);
      
    // Start preloading each URL with longer delays to avoid network contention
    for (let i = 0; i < urlsToPreload.length; i++) {
      // Add a significant delay between preloads to avoid connection contention
      setTimeout(() => {
        preloadUrl(urlsToPreload[i]);
      }, i * 1000); // Increased delay to 1 second between preloads
    }
    
    return cancelFetches;
  }, [videoUrls, currentVideoUrl, maxPreload]);
  
  // Process video paths
  useEffect(() => {
    if (!videoPaths || videoPaths.length === 0) return;
    
    // Wait a bit before starting preloading to ensure the main video is stable
    const startPreloadDelay = setTimeout(() => {
      // Construct direct URLs 
      const urlsToPreload: string[] = [];
      
      videoPaths.slice(0, maxPreload).forEach(({ bucket, path }) => {
        if (!path) return;
        
        // Construct a direct public URL - faster than going through signed URLs
        const directUrl = `https://nnmtqoxrygesqiapdmkb.supabase.co/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
        
        // Don't preload current video - more robust check
        if (currentVideoUrl && (
            directUrl.includes(currentVideoUrl) || 
            currentVideoUrl.includes(directUrl) ||
            directUrl.includes(path) && currentVideoUrl.includes(path)
          )) {
          return;
        }
        
        urlsToPreload.push(directUrl);
      });
      
      // Start preloading each URL - one at a time with longer staggered delays
      for (let i = 0; i < urlsToPreload.length; i++) {
        setTimeout(() => {
          preloadUrl(urlsToPreload[i]);
        }, i * 1000); // Longer delay (1 second) between preloads
      }
    }, 2000); // Wait 2 seconds before beginning any preload
    
    return () => {
      clearTimeout(startPreloadDelay);
      cancelFetches();
    }
  }, [videoPaths, currentVideoUrl, maxPreload]);
  
  // This component doesn't render anything visible
  return null;
};

export default VideoPreloader; 