
import React from "react";
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";
import { formatReadableTime } from "@/components/video/utils";
import { GameData } from "@/types/analyzer";

interface ClipPlaybackControlProps {
  isPlayingClip: boolean;
  selectedClip: GameData | null;
  onStopClip: () => void;
}

const ClipPlaybackControl: React.FC<ClipPlaybackControlProps> = ({
  isPlayingClip,
  selectedClip,
  onStopClip
}) => {
  if (!isPlayingClip || !selectedClip) return null;
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">
          Now playing: {selectedClip["Play Name"]}
        </p>
        <p className="text-sm text-muted-foreground">
          Start: {selectedClip["Start time"]}s, Duration: {formatReadableTime(parseFloat(selectedClip["Duration"] || "0"))}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onStopClip} 
        className="bg-white dark:bg-background flex items-center gap-1"
      >
        <StopCircle className="h-4 w-4" />
        Stop Clip
      </Button>
    </div>
  );
};

export default ClipPlaybackControl;
