
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { toast } from "sonner";
import { Marker } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";

interface VideoSectionProps {
  videoUrl?: string;
  currentTime: number;
  newMarkerLabel: string;
  markers: Marker[];
  videoPlayerRef: React.RefObject<any>;
  onTimeUpdate: (time: number) => void;
  onVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewMarkerLabelChange: (value: string) => void;
  onAddMarker: () => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoUrl,
  currentTime,
  newMarkerLabel,
  markers,
  videoPlayerRef,
  onTimeUpdate,
  onVideoFileChange,
  onNewMarkerLabelChange,
  onAddMarker,
}) => {
  return (
    <>
      {/* Video Player */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {videoUrl ? (
            <VideoPlayer 
              ref={videoPlayerRef}
              src={videoUrl} 
              onTimeUpdate={onTimeUpdate}
              markers={markers}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-muted">
              <div className="text-center p-6">
                <FilePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No video selected</p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={onVideoFileChange}
                  className="max-w-sm mx-auto"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Current Time and Marker Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2">Current Time</h3>
            <div className="text-2xl font-mono">{formatVideoTime(currentTime)}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2">Add Marker</h3>
            <div className="flex space-x-2">
              <Input
                value={newMarkerLabel}
                onChange={(e) => onNewMarkerLabelChange(e.target.value)}
                placeholder="Marker label"
                className="flex-1"
              />
              <Button onClick={onAddMarker} disabled={!videoUrl}>
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Mark
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VideoSection;
