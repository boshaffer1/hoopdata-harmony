
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/use-video-player";
import VideoControls from "./VideoControls";
import VideoTimeline from "./VideoTimeline";
import PlayOverlay from "./PlayOverlay";

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
  const [
    { isPlaying, currentTime, duration, volume, isMuted },
    { play, pause, seekToTime, togglePlay, handleTimeChange, handleVolumeChange, toggleMute, toggleFullscreen, jumpTime, getCurrentTime, getDuration }
  ] = useVideoPlayer(videoRef, onTimeUpdate);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    play,
    pause,
    seekToTime,
    getCurrentTime,
    getDuration
  }));

  return (
    <div 
      id="video-container"
      className={cn(
        "video-player-container rounded-xl overflow-hidden bg-black relative group",
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        src={src}
      >
        Your browser doesn't support HTML5 video.
      </video>

      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity opacity-0 group-hover:opacity-100">
        {/* Timeline with markers */}
        <VideoTimeline 
          currentTime={currentTime}
          duration={duration}
          markers={markers}
          onTimeChange={handleTimeChange}
          onMarkerClick={seekToTime}
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

      {/* Large play button overlay (visible when paused) */}
      <PlayOverlay isVisible={!isPlaying} onClick={togglePlay} />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
