
import React, { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/video-player/use-video-player";
import { useEnhancedPlayer } from "@/hooks/video-player/use-enhanced-player";
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
  const [state, actions] = useVideoPlayer(videoRef, onTimeUpdate);
  const { isPlaying, isBuffering, hasError, errorMessage, isRecovering } = state;

  // Use the enhanced player hook to manage video readiness and pending operations
  const {
    isVideoReady,
    pendingSeek,
    setPendingSeek,
    pendingPlay,
    setPendingPlay,
    enhancedPlay,
    enhancedSeek
  } = useEnhancedPlayer(videoRef, actions, errorMessage);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    play: enhancedPlay,
    pause: actions.pause,
    seekToTime: enhancedSeek,
    getCurrentTime: actions.getCurrentTime,
    getDuration: actions.getDuration,
    getVideoElement: () => videoRef.current // Add direct access to video element for troubleshooting
  }));

  useEffect(() => {
    if (videoRef.current && src) {
      console.log("Video source changed, loading new source");
      // Reset any pending operations
      setPendingSeek(null);
      setPendingPlay(false);
      videoRef.current.load();
    }
  }, [src, setPendingSeek, setPendingPlay]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCanPlay = () => {
      console.log("Video can play event fired");
      
      if (pendingSeek !== null) {
        console.log(`Handling pending seek to ${pendingSeek}s`);
        enhancedSeek(pendingSeek);
        
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
    
    // Important: Listen to both canplay and loadeddata
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    
    // Also listen to 'canplaythrough' which indicates the video can play without buffering
    video.addEventListener("canplaythrough", () => {
      console.log("Video can play through without buffering");
    });
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [pendingSeek, pendingPlay, enhancedSeek, enhancedPlay, setPendingPlay]);

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
          isRecovering={isRecovering}
        />
        <VideoPlayerControls markers={markers} />
        <PlayOverlay isVisible={!isPlaying && !isBuffering && !hasError && !isRecovering} onClick={actions.togglePlay} />
      </div>
    </VideoPlayerProvider>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
