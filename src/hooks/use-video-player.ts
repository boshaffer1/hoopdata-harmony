
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
  play: () => Promise<void> | void;
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
  
  // Track if play was called but video wasn't ready
  const pendingPlayRef = useRef(false);

  // Handle video events
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
      
      // If play was requested before video was ready
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        play();
      }
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
    };
    
    const handlePause = () => {
      console.log("Video pause event fired");
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      console.error("Video error:", e);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onTimeUpdate, videoRef]);

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
