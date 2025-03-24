
import { useState, useRef, useEffect } from "react";

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

export interface VideoPlayerActions {
  play: () => void;
  pause: () => void;
  seekToTime: (timeInSeconds: number) => void;
  togglePlay: () => void;
  handleTimeChange: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  jumpTime: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export const useVideoPlayer = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onTimeUpdate?: (time: number) => void
): [VideoPlayerState, VideoPlayerActions] => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleVideoEnd = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleVideoEnd);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleVideoEnd);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onTimeUpdate, videoRef]);

  // Play/pause actions
  const play = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
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
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
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

  const state: VideoPlayerState = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen
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
