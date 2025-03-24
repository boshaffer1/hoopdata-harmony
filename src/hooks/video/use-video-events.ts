
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
  const [isRecovering, setIsRecovering] = useState(false);

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
      setIsRecovering(false);
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
      setIsRecovering(false);
    };
    
    const handlePause = () => {
      console.log("Video pause event fired");
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      const errorCode = videoElement.error?.code;
      const errorMessage = getVideoErrorMessage(errorCode);
      
      // Don't set hasError to true during recovery
      // to avoid showing error message too early
      if (!isRecovering) {
        setHasError(true);
        setErrorMessage(errorMessage);
        setIsPlaying(false);
      }
      
      logVideoError(videoElement.error, "video event listener");
    };
    
    const handleWaiting = () => {
      console.log("Video is waiting for data");
    };
    
    const handleCanPlayThrough = () => {
      console.log("Video can play through without buffering");
      setIsRecovering(false);
    };
    
    const handleLoadStart = () => {
      console.log("Video load started");
      // Consider the video in recovery mode when it starts loading
      setIsRecovering(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadstart", handleLoadStart);
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
      video.removeEventListener("loadstart", handleLoadStart);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onTimeUpdate, videoRef, isRecovering]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime, 
    setCurrentTime,
    duration,
    isFullscreen,
    hasError,
    errorMessage,
    isRecovering,
    setIsRecovering
  };
}

// Helper function to get human-readable error messages
function getVideoErrorMessage(errorCode?: number): string {
  switch (errorCode) {
    case 1: // MEDIA_ERR_ABORTED
      return "Playback interrupted";
    case 2: // MEDIA_ERR_NETWORK
      return "Network issue while loading video";
    case 3: // MEDIA_ERR_DECODE
      return "Video playback issue. The system is attempting to recover.";
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return "Video format or codec issue. Please try again.";
    default:
      return "An unexpected playback issue occurred";
  }
}
