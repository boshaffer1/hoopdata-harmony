
import React from "react";
import { Slider } from "@/components/ui/slider";

interface Marker {
  time: number;
  label: string;
  color?: string;
}

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  markers: Marker[];
  onTimeChange: (value: number[]) => void;
  onMarkerClick: (time: number) => void;
}

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  markers,
  onTimeChange,
  onMarkerClick,
}) => {
  return (
    <div className="relative mb-4">
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 100}
        step={0.1}
        onValueChange={onTimeChange}
        className="h-2"
      />
      
      {/* Markers on timeline */}
      {markers.map((marker, index) => (
        <div 
          key={index}
          className="absolute top-1/2 -translate-y-1/2 w-2 h-4 cursor-pointer"
          style={{ 
            left: `${(marker.time / (duration || 100)) * 100}%`,
            backgroundColor: marker.color || "#3b82f6"
          }}
          title={marker.label}
          onClick={() => onMarkerClick(marker.time)}
        />
      ))}
    </div>
  );
};

export default VideoTimeline;
