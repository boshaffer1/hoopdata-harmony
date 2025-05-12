import React, { useEffect, useRef, useState } from 'react';

interface VideoPreloaderProps {
  /**
   * Array of video URLs to preload
   */
  videoUrls: string[];
  
  /**
   * Maximum number of videos to preload at once
   */
  maxPreload?: number;
  
  /**
   * Current active video URL (won't be preloaded)
   */
  currentVideoUrl?: string;
  
  /**
   * Whether to use a range request approach (better for large files)
   */
  useRangeRequests?: boolean;
  
  /**
   * Size of initial chunk to load in bytes (for range requests)
   */
  initialChunkSize?: number;
}

/**
 * Component that preloads upcoming video clips to improve playback experience
 * This invisibly loads videos in the background to improve performance
 */
const VideoPreloader: React.FC<VideoPreloaderProps> = ({
  videoUrls,
  maxPreload = 2,
  currentVideoUrl,
  useRangeRequests = true,
  initialChunkSize = 65536, // 64KB
}) => {
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  const [urlsToPreload, setUrlsToPreload] = useState<string[]>([]);
  
  // Cleanup function to remove preload links
  const cleanupPreloadLinks = () => {
    const videoPreloadLinks = document.head.querySelectorAll('link[rel="preload"][data-preloader="true"]');
    videoPreloadLinks.forEach(link => link.remove());
  };
  
  // Process the list of URLs to determine which ones to preload
  useEffect(() => {
    if (!videoUrls || videoUrls.length === 0) {
      setUrlsToPreload([]);
      return;
    }
    
    // Filter out the current video and already preloaded videos
    const filteredUrls = videoUrls
      .filter(url => url !== currentVideoUrl)
      .filter(url => !preloadedUrlsRef.current.has(url))
      .slice(0, maxPreload);
      
    setUrlsToPreload(filteredUrls);
    
  }, [videoUrls, currentVideoUrl, maxPreload]);
  
  // Perform the actual preloading
  useEffect(() => {
    if (!urlsToPreload.length) return;
    
    const abortControllers: AbortController[] = [];
    
    // Remove any existing preload links
    cleanupPreloadLinks();
    
    // Preload each URL
    urlsToPreload.forEach((url, index) => {
      console.log(`Preloading upcoming video ${index + 1}/${urlsToPreload.length}: ${url.substring(0, 60)}...`);
      
      // Add to preloaded set
      preloadedUrlsRef.current.add(url);
      
      if (useRangeRequests) {
        // Create an abort controller for this request
        const controller = new AbortController();
        abortControllers.push(controller);
        
        // Fetch the first chunk of the video to warm up connections
        fetch(url, {
          method: 'GET',
          headers: {
            'Range': `bytes=0-${initialChunkSize - 1}`
          },
          signal: controller.signal
        }).catch(err => {
          if (err.name !== 'AbortError') {
            console.warn(`Error preloading video ${url}:`, err.message);
          }
        });
      } else {
        // Add a preload link
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = 'fetch';
        link.setAttribute('crossorigin', 'anonymous');
        link.setAttribute('data-preloader', 'true');
        
        document.head.appendChild(link);
      }
    });
    
    // Cleanup function
    return () => {
      // Abort any in-progress fetches
      abortControllers.forEach(controller => controller.abort());
      
      // Clean up preload links
      if (!useRangeRequests) {
        cleanupPreloadLinks();
      }
    };
  }, [urlsToPreload, useRangeRequests, initialChunkSize]);
  
  // This component doesn't render anything visible
  return null;
};

export default VideoPreloader; 