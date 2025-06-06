
import { useState, useRef } from "react";
import { clampTime, safePlayVideo, logVideoError } from "./utils";

export function useVideoControls(
  videoRef: React.RefObject<HTMLVideoElement>,
  {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    isRecovering,
    setIsRecovering
  }: {
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    currentTime: number;
    setCurrentTime: (value: number) => void;
    duration: number;
    isRecovering?: boolean;
    setIsRecovering?: (value: boolean) => void;
  }
) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const pendingPlayRef = useRef(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Play/pause actions
  const play = async () => {
    if (!videoRef.current) {
      console.error("Video element not available");
      return Promise.reject(new Error("Video element not available"));
    }
    
    setIsBuffering(true);
    
    try {
      console.log("Attempting to play video");
      
      if (videoRef.current.readyState < 2) {
        // Video not ready to play yet, set flag to play when ready
        console.log("Video not ready, setting pending play flag");
        pendingPlayRef.current = true;
        return Promise.resolve(); // Resolve to prevent error handling issues
      }
      
      // Always return a Promise for consistency
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        return playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
            console.log("Video playing successfully");
            // Clear recovery state when play succeeds
            if (setIsRecovering) setIsRecovering(false);
            return Promise.resolve();
          })
          .catch((error) => {
            setIsPlaying(false);
            setIsBuffering(false);
            logVideoError(error, "play method");
            // Re-throw so caller can handle
            console.error("Error in video play:", error);
            return Promise.reject(error);
          });
      } else {
        // For browsers that don't return a promise
        setIsPlaying(true);
        setIsBuffering(false);
        if (setIsRecovering) setIsRecovering(false);
        return Promise.resolve();
      }
    } catch (error) {
      setIsPlaying(false);
      setIsBuffering(false);
      logVideoError(error, "play method");
      return Promise.reject(error);
    }
  };

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      pendingPlayRef.current = false;
      setIsBuffering(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Time control
  const handleTimeChange = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (videoRef.current) {
      // Ensure time is within valid range
      const clampedTime = clampTime(timeInSeconds, videoRef.current.duration || 0);
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
      console.log(`Sought to ${clampedTime}s`);
    }
  };

  const jumpTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = clampTime(currentTime + seconds, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Utility getter methods
  const getCurrentTime = () => currentTime;
  const getDuration = () => duration;

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
