
import React from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';
import VideoTimeline from './VideoTimeline';
import VideoControls from './VideoControls';

interface VideoPlayerControlsProps {
  markers?: { time: number; label: string; color?: string }[];
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({ markers = [] }) => {
  const { state, actions, enhancedSeek } = useVideoPlayerContext();
  const { 
    isPlaying, currentTime, duration, volume, isMuted, 
  } = state;
  
  const { 
    togglePlay, handleTimeChange, handleVolumeChange, 
    toggleMute, toggleFullscreen, jumpTime,
  } = actions;

  return (
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
  );
};

export default VideoPlayerControls;
