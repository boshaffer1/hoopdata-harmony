
import { useState, useEffect } from "react";
import { logVideoError } from "./utils";

export function useVideoEvents(
  videoRef: React.RefObject<HTMLVideoElement>,
  onTimeUpdate?: (time: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
      // Reset error state on successful load
      setHasError(false);
      setErrorMessage(null);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleVideoEnd = () => {
      setIsPlaying(false);
    };
    
    const handlePlaying = () => {
      console.log("Video playing event fired");
      setIsPlaying(true);
      // Reset error state on successful playback
      setHasError(false);
      setErrorMessage(null);
    };
    
    const handlePause = () => {
      console.log("Video pause event fired");
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      const errorCode = videoElement.error?.code;
      const errorMessage = getVideoErrorMessage(errorCode);
      
      setHasError(true);
      setErrorMessage(errorMessage);
      setIsPlaying(false);
      
      logVideoError(videoElement.error, "video event listener");
    };
    
    const handleWaiting = () => {
      console.log("Video is waiting for data");
    };
    
    const handleCanPlayThrough = () => {
      console.log("Video can play through without buffering");
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onTimeUpdate, videoRef]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime, 
    setCurrentTime,
    duration,
    isFullscreen,
    hasError,
    errorMessage
  };
}

// Helper function to get human-readable error messages
function getVideoErrorMessage(errorCode?: number): string {
  switch (errorCode) {
    case 1: // MEDIA_ERR_ABORTED
      return "Playback aborted by the user";
    case 2: // MEDIA_ERR_NETWORK
      return "Network error while loading the video";
    case 3: // MEDIA_ERR_DECODE
      return "Error decoding the video";
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return "Video format not supported";
    default:
      return "An unknown error occurred";
  }
}
