
import { useRef } from "react";
import { VideoPlayerState, VideoPlayerActions } from "./types";
import { useVideoEvents } from "./use-video-events";
import { useVideoControls } from "./use-video-controls";

export const useVideoPlayer = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onTimeUpdate?: (time: number) => void
): [VideoPlayerState, VideoPlayerActions] => {
  // Get event-related state and setters
  const {
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
  } = useVideoEvents(videoRef, onTimeUpdate);
  
  // Get video control functions
  const {
    volume,
    isMuted,
    isBuffering,
    play,
    pause,
    togglePlay,
    handleTimeChange,
    seekToTime,
    jumpTime,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    getCurrentTime,
    getDuration
  } = useVideoControls(videoRef, {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime, 
    duration
  });

  const state: VideoPlayerState = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isBuffering,
    hasError,
    errorMessage,
    isRecovering
  };

  const actions: VideoPlayerActions = {
    play,
    pause,
    seekToTime,
    togglePlay,
    handleTimeChange,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    jumpTime,
    getCurrentTime,
    getDuration
  };

  return [state, actions];
};
