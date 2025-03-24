
import { useState, useRef } from "react";

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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const pendingPlayRef = useRef(false);

  // Play/pause actions
  const play = async () => {
    if (videoRef.current) {
      try {
        console.log("Attempting to play video");
        
        if (videoRef.current.readyState < 2) {
          // Video not ready to play yet, set flag to play when ready
          console.log("Video not ready, setting pending play flag");
          pendingPlayRef.current = true;
          return;
        }
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          console.log("Video playing successfully");
        }
      } catch (error) {
        console.error("Error playing video:", error);
        setIsPlaying(false);
        throw error;
      }
    }
  };

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      pendingPlayRef.current = false;
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
      const clampedTime = Math.max(0, Math.min(timeInSeconds, videoRef.current.duration || 0));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
      console.log(`Sought to ${clampedTime}s`);
    }
  };

  const jumpTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
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
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
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
