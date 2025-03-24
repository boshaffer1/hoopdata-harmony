
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronRight, ChevronLeft } from "lucide-react";
import { formatTime } from "@/hooks/video/utils";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onTimeChange: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onJumpTime: (seconds: number) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onTimeChange,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onJumpTime,
}) => {
  return (
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center space-x-4">
        {/* Play/Pause button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPlayPause}
          className="text-white hover:bg-white/20"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        {/* Skip backward/forward */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onJumpTime(-10)}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onJumpTime(10)}
          className="text-white hover:bg-white/20"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Time display */}
        <div className="text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Volume control */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          
          <div className="w-24 hidden sm:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={onVolumeChange}
            />
          </div>
        </div>

        {/* Fullscreen button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleFullscreen}
          className="text-white hover:bg-white/20"
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoControls;
