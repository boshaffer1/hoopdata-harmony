
import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/video-player/use-video-player";
import PlayOverlay from "./PlayOverlay";
import BufferingIndicator from "./BufferingIndicator";
import VideoFrame from "./VideoFrame";
import VideoPlayerControls from "./VideoPlayerControls";
import { VideoPlayerProvider } from "./context/VideoPlayerContext";
import { toast } from "sonner";

interface VideoPlayerProps {
  src?: string;
  className?: string;
  onTimeUpdate?: (time: number) => void;
  markers?: { time: number; label: string; color?: string }[];
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(({
  src,
  className,
  onTimeUpdate,
  markers = []
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [lastSeekTime, setLastSeekTime] = useState(0);
  
  const [state, actions] = useVideoPlayer(videoRef, onTimeUpdate);
  const { isPlaying, isBuffering, hasError, errorMessage } = state;

  const enhancedPlay = async () => {
    console.log("Play method called on video player");
    if (!videoRef.current?.src) {
      console.warn("Attempted to play video but no source is set");
      toast.warning("No video source available");
      return Promise.reject(new Error("No video source"));
    }
    
    if (!isVideoReady) {
      console.log("Video not ready yet, setting pending play flag");
      setPendingPlay(true);
      return Promise.resolve();
    }
    
    try {
      if (videoRef.current) {
        console.log("Current time before play:", videoRef.current.currentTime);
      }
      
      // Directly use the video element for more reliable playback
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Native video.play() succeeded");
          return Promise.resolve();
        } else {
          // For older browsers that don't return a promise
          console.log("Browser didn't return a play promise, falling back");
        }
      } catch (err) {
        console.error("Native video.play() failed:", err);
      }
      
      // Fall back to our play implementation
      const playResult = actions.play();
      // Ensure we're always returning a Promise
      if (playResult instanceof Promise) {
        return playResult
          .then(() => {
            console.log("Play promise resolved successfully");
            setTimeout(() => {
              if (videoRef.current && !videoRef.current.paused && !isPlaying) {
                console.log("Video is playing but state doesn't reflect it - fixing");
              }
            }, 300);
          })
          .catch(error => {
            console.error("Error playing video:", error);
            if (error.name === "NotAllowedError") {
              toast.error("Playback was blocked by the browser. Try again or click directly on the video.");
            } else if (errorMessage) {
              toast.error(`Failed to play video: ${errorMessage}`);
            } else {
              toast.error("Failed to play video");
            }
            throw error;
          });
      } else {
        // If play() returned void, we need to return a resolved promise
        console.log("Play method did not return a Promise");
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Exception playing video:", error);
      return Promise.reject(error);
    }
  };
  
  const enhancedSeek = (time: number) => {
    console.log(`Seeking to time: ${time}s`);
    if (!videoRef.current) {
      console.warn("Video element not available for seeking");
      return Promise.reject(new Error("Video element not available"));
    }
    
    // To avoid repeated seeks to the same timestamp
    if (Math.abs(lastSeekTime - time) < 0.1) {
      console.log("Ignoring repeated seek to the same position");
      return Promise.resolve();
    }
    
    setLastSeekTime(time);
    
    if (!isVideoReady) {
      console.log("Video not ready yet, setting pending seek time:", time);
      setPendingSeek(time);
      return Promise.resolve();
    }
    
    try {
      // Directly update the video element currentTime for more reliable seeking
      videoRef.current.currentTime = time;
      console.log(`Set currentTime directly to ${time}s, now at:`, videoRef.current.currentTime);
      
      // Also update our internal state
      actions.seekToTime(time);
      return Promise.resolve();
    } catch (error) {
      console.error("Error seeking to time:", error);
      return Promise.reject(error);
    }
  };

  useImperativeHandle(ref, () => ({
    play: enhancedPlay,
    pause: actions.pause,
    seekToTime: enhancedSeek,
    getCurrentTime: actions.getCurrentTime,
    getDuration: actions.getDuration
  }));

  useEffect(() => {
    if (videoRef.current && src) {
      console.log("Video source changed, loading new source");
      setIsVideoReady(false);
      // Reset any pending operations
      setPendingSeek(null);
      setPendingPlay(false);
      videoRef.current.load();
    }
  }, [src]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCanPlay = () => {
      console.log("Video can play event fired");
      setIsVideoReady(true);
      
      if (pendingSeek !== null) {
        console.log(`Handling pending seek to ${pendingSeek}s`);
        video.currentTime = pendingSeek;
        actions.seekToTime(pendingSeek);
        setLastSeekTime(pendingSeek);
        setPendingSeek(null);
        
        if (pendingPlay) {
          setTimeout(() => {
            console.log("Handling pending play after seek");
            enhancedPlay().catch(err => console.error("Failed to play after seek:", err));
            setPendingPlay(false);
          }, 800);
        }
      } else if (pendingPlay) {
        console.log("Handling pending play");
        enhancedPlay().catch(err => console.error("Failed to handle pending play:", err));
        setPendingPlay(false);
      }
    };
    
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
    };
  }, [pendingSeek, pendingPlay, actions.seekToTime]);

  useEffect(() => {
    if (hasError && errorMessage) {
      toast.error(`Video error: ${errorMessage}`);
      console.error(`Video playback error: ${errorMessage}`);
    }
  }, [hasError, errorMessage]);

  const contextValue = {
    state,
    actions,
    isVideoReady,
    pendingPlay,
    setPendingPlay,
    pendingSeek,
    setPendingSeek,
    enhancedPlay,
    enhancedSeek
  };

  return (
    <VideoPlayerProvider {...contextValue}>
      <div 
        id="video-container"
        className={cn(
          "video-player-container rounded-xl overflow-hidden bg-black relative group",
          className
        )}
      >
        <VideoFrame ref={videoRef} src={src} />
        <BufferingIndicator 
          isBuffering={isBuffering} 
          hasError={hasError} 
          errorMessage={errorMessage} 
        />
        <VideoPlayerControls markers={markers} />
        <PlayOverlay isVisible={!isPlaying && !isBuffering && !hasError} onClick={actions.togglePlay} />
      </div>
    </VideoPlayerProvider>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
