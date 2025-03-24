
import { useState } from "react";
import { logVideoError } from "./utils";

export function usePlaybackControls(
  videoRef: React.RefObject<HTMLVideoElement>,
  {
    isPlaying,
    setIsPlaying,
    setIsBuffering
  }: {
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    setIsBuffering: (value: boolean) => void;
  }
) {
  const pendingPlayRef = useRef(false);

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
      
      // Try with smaller jumps to avoid decoding errors
      // Often decoding errors happen when seeking to a challenging position then playing
      const currentPosition = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;
      if (currentPosition > 0.1 && currentPosition < duration - 0.1) {
        // Small seek to help the browser with decoding
        try {
          const tinyOffset = 0.1;
          videoRef.current.currentTime = currentPosition - tinyOffset;
          await new Promise(resolve => setTimeout(resolve, 100));
          videoRef.current.currentTime = currentPosition;
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (e) {
          console.log("Error in pre-play adjustment, continuing anyway:", e);
        }
      }
      
      // Always return a Promise for consistency
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        return playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
            console.log("Video playing successfully");
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

  return {
    play,
    pause,
    togglePlay,
    pendingPlayRef
  };
}

import { useRef } from "react";
