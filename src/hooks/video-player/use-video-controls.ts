
import { useState } from "react";
import { usePlaybackControls } from "./use-playback-controls";
import { useTimeControls } from "./use-time-controls";
import { useVolumeControls } from "./use-volume-controls";
import { useFullscreenControl } from "./use-fullscreen-control";

export function useVideoControls(
  videoRef: React.RefObject<HTMLVideoElement>,
  {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration
  }: {
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    currentTime: number;
    setCurrentTime: (value: number) => void;
    duration: number;
  }
) {
  const [isBuffering, setIsBuffering] = useState(false);

  // Use our individual control hooks
  const { 
    volume, 
    isMuted, 
    handleVolumeChange, 
    toggleMute 
  } = useVolumeControls(videoRef);

  const { 
    play, 
    pause, 
    togglePlay, 
    pendingPlayRef 
  } = usePlaybackControls(videoRef, { 
    isPlaying, 
    setIsPlaying,
    setIsBuffering
  });

  const { 
    handleTimeChange, 
    seekToTime, 
    jumpTime, 
    getCurrentTime, 
    getDuration 
  } = useTimeControls(videoRef, { 
    currentTime, 
    setCurrentTime, 
    duration 
  });

  const { toggleFullscreen } = useFullscreenControl();

  return {
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
    getDuration,
    pendingPlayRef
  };
}
