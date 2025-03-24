import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/video-player/use-video-player";
import VideoControls from "./VideoControls";
import VideoTimeline from "./VideoTimeline";
import PlayOverlay from "./PlayOverlay";
import { toast } from "sonner";
import { isVideoReady } from "@/hooks/video-player/utils";

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
  
  const [
    { isPlaying, currentTime, duration, volume, isMuted, isBuffering, hasError, errorMessage },
    { play, pause, seekToTime, togglePlay, handleTimeChange, handleVolumeChange, toggleMute, toggleFullscreen, jumpTime, getCurrentTime, getDuration }
  ] = useVideoPlayer(videoRef, onTimeUpdate);

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
      const playPromise = play();
      if (playPromise instanceof Promise) {
        return playPromise
          .then(() => {
            console.log("Play promise resolved successfully");
            return Promise.resolve();
          })
          .catch(error => {
            console.error("Error playing video:", error);
            if (errorMessage) {
              toast.error(`Failed to play video: ${errorMessage}`);
            } else {
              toast.error("Failed to play video");
            }
            return Promise.reject(error);
          });
      } else {
        console.log("Play method did not return a promise");
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
    
    if (!isVideoReady) {
      console.log("Video not ready yet, setting pending seek time:", time);
      setPendingSeek(time);
      return Promise.resolve();
    }
    
    try {
      seekToTime(time);
      return Promise.resolve();
    } catch (error) {
      console.error("Error seeking to time:", error);
      return Promise.reject(error);
    }
  };

  useImperativeHandle(ref, () => ({
    play: enhancedPlay,
    pause,
    seekToTime: enhancedSeek,
    getCurrentTime,
    getDuration
  }));

  useEffect(() => {
    if (videoRef.current && src) {
      console.log("Video source changed, loading new source");
      setIsVideoReady(false);
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
        seekToTime(pendingSeek);
        setPendingSeek(null);
        
        if (pendingPlay) {
          setTimeout(() => {
            console.log("Handling pending play after seek");
            enhancedPlay().catch(err => console.error("Failed to play after seek:", err));
            setPendingPlay(false);
          }, 500);
        }
      } else if (pendingPlay) {
        console.log("Handling pending play");
        enhancedPlay().catch(err => console.error("Failed to handle pending play:", err));
        setPendingPlay(false);
      }
    };
    
    video.addEventListener("canplay", handleCanPlay);
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [pendingSeek, pendingPlay, seekToTime]);

  useEffect(() => {
    if (hasError && errorMessage) {
      toast.error(`Video error: ${errorMessage}`);
    }
  }, [hasError, errorMessage]);

  return (
    <div 
      id="video-container"
      className={cn(
        "video-player-container rounded-xl overflow-hidden bg-black relative group",
        className
      )}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        src={src}
        preload="auto"
        playsInline
      >
        Your browser doesn't support HTML5 video.
      </video>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity opacity-0 group-hover:opacity-100">
        <VideoTimeline 
          currentTime={currentTime}
          duration={duration}
          markers={markers}
          onTimeChange={handleTimeChange}
          onMarkerClick={enhancedSeek}
        />
        
        <VideoControls 
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={togglePlay}
          onTimeChange={handleTimeChange}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          onJumpTime={jumpTime}
        />
      </div>

      <PlayOverlay isVisible={!isPlaying && !isBuffering} onClick={togglePlay} />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
