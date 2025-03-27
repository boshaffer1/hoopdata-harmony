import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getSupportedFormats } from "@/hooks/video-player/utils";

export const useVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);
  
  // Add storage for recent videos
  const [recentVideos, setRecentVideos] = useState<{url: string, name: string, timestamp: number}[]>([]);
  
  // Monitor video player readiness
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // Load recent videos from localStorage on component mount
  useEffect(() => {
    try {
      const storedVideos = localStorage.getItem('recentVideos');
      if (storedVideos) {
        setRecentVideos(JSON.parse(storedVideos));
      }
    } catch (error) {
      console.error("Failed to load recent videos from localStorage:", error);
    }
  }, []);
  
  // Save recent videos to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('recentVideos', JSON.stringify(recentVideos));
    } catch (error) {
      console.error("Failed to save recent videos to localStorage:", error);
    }
  }, [recentVideos]);
  
  useEffect(() => {
    // Check if video player is ready when the URL changes
    if (videoUrl && videoPlayerRef.current) {
      // Give the player some time to initialize
      const checkTimer = setTimeout(() => {
        setIsPlayerReady(true);
        console.log("Video player marked as ready");
      }, 1000);
      
      return () => clearTimeout(checkTimer);
    } else {
      setIsPlayerReady(false);
    }
  }, [videoUrl, videoPlayerRef.current]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset state when loading a new video
      setIsPlayerReady(false);
      
      // Check file type
      const fileType = file.type;
      console.log("Video file type:", fileType);
      
      // Log supported formats
      const supportedFormats = getSupportedFormats();
      console.log("Browser supports these video formats:", supportedFormats);
      
      // Check if the browser likely supports this format
      const video = document.createElement('video');
      const supportLevel = video.canPlayType(fileType);
      console.log(`Browser support for ${fileType}: ${supportLevel}`);
      
      // Recommend WebM for better compatibility
      if (supportLevel === "" || supportLevel === "maybe") {
        toast.info(`For best compatibility, WebM format is recommended. Your browser supports: ${supportedFormats.join(", ")}`, {
          duration: 5000,
        });
      }
      
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Add to recent videos
      const newVideo = {
        url,
        name: file.name,
        timestamp: Date.now()
      };
      
      setRecentVideos(prev => {
        // Keep only the 10 most recent videos
        const filtered = prev.filter(v => v.name !== file.name);
        return [newVideo, ...filtered].slice(0, 10);
      });
      
      toast.success(`Loaded video: ${file.name}`);
      console.log("Set new video URL:", url);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Modified to ensure more reliable seeking with proper validation and retries
  const seekToMarker = (time: number) => {
    if (!videoPlayerRef.current) {
      toast.error("Video player not initialized");
      return Promise.reject("Video player not initialized");
    }
    
    if (!isPlayerReady) {
      toast.warning("Video player is still initializing. Please try again in a moment.");
      return Promise.reject("Video player not ready");
    }
    
    console.log(`Seeking to marker at ${time}s`);
    
    // Important: Pause playback before seeking to avoid decoder errors
    try {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
    } catch (err) {
      console.warn("Error pausing before seek:", err);
    }
    
    // Add a small delay to ensure pause takes effect
    return new Promise((resolve) => {
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.seekToTime(time)
            .then(() => {
              console.log(`Successfully sought to ${time}s`);
              // Verify the seek worked by checking current time
              const currentPos = videoPlayerRef.current.getCurrentTime();
              console.log(`Current position after seek: ${currentPos}s`);
              
              // If seek didn't work properly (more than 2s difference), try once more
              if (Math.abs(currentPos - time) > 2) {
                console.warn(`Seek discrepancy detected (${currentPos} vs ${time}), trying again`);
                return videoPlayerRef.current.seekToTime(time);
              }
              return resolve(true);
            })
            .catch((error: any) => {
              console.error("Error seeking to marker:", error);
              toast.error("Failed to seek to marker position");
              return Promise.reject(error);
            });
        } else {
          resolve(false);
        }
      }, 200); // Small delay before seeking
    });
  };

  return {
    videoUrl,
    currentTime,
    videoPlayerRef,
    isPlayerReady,
    recentVideos,
    handleVideoFileChange,
    handleTimeUpdate,
    seekToMarker,
    setVideoUrl
  };
};
