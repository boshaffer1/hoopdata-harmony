
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getSupportedFormats } from "@/hooks/video-player/utils";

export const useVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);
  
  // Monitor video player readiness
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
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
      console.log("Browser supports these video formats:", getSupportedFormats());
      
      // Check if the browser likely supports this format
      const video = document.createElement('video');
      const supportLevel = video.canPlayType(fileType);
      console.log(`Browser support for ${fileType}: ${supportLevel}`);
      
      if (supportLevel === "") {
        toast.warning(`Your browser might not support ${fileType} files. If you experience playback issues, try converting to WebM format.`);
      }
      
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      toast.success(`Loaded video: ${file.name}`);
      console.log("Set new video URL:", url);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

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
    return videoPlayerRef.current.seekToTime(time)
      .catch((error: any) => {
        console.error("Error seeking to marker:", error);
        toast.error("Failed to seek to marker position");
        return Promise.reject(error);
      });
  };

  return {
    videoUrl,
    currentTime,
    videoPlayerRef,
    isPlayerReady,
    handleVideoFileChange,
    handleTimeUpdate,
    seekToMarker
  };
};
