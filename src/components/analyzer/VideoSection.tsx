
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Clock } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import RecentVideos from "@/components/video/RecentVideos";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VideoSectionProps {
  videoUrl?: string;
  currentTime: number;
  newMarkerLabel: string;
  markers: { time: number; label: string; color: string }[];
  videoPlayerRef: React.RefObject<any>;
  onTimeUpdate: (time: number) => void;
  onVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewMarkerLabelChange: (value: string) => void;
  onAddMarker: () => void;
  recentVideos?: {url: string, name: string, timestamp: number}[];
  onSelectVideo?: (url: string) => void;
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
  recentVideos = [],
  onSelectVideo,
}) => {
  const [showRecentVideos, setShowRecentVideos] = useState(false);
  
  const formattedTime = React.useMemo(() => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  }, [currentTime]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Video Analyzer</CardTitle>
            <CardDescription>Upload and analyze game footage</CardDescription>
          </div>
          <div className="flex gap-2">
            {recentVideos && recentVideos.length > 0 && (
              <Popover open={showRecentVideos} onOpenChange={setShowRecentVideos}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Recent Videos
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <RecentVideos 
                    videos={recentVideos} 
                    onSelectVideo={(url) => {
                      if (onSelectVideo) {
                        onSelectVideo(url);
                        setShowRecentVideos(false);
                      }
                    }} 
                  />
                </PopoverContent>
              </Popover>
            )}
            <div>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={onVideoFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("video-upload")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Video player */}
        <div className="space-y-4">
          <div className="video-container rounded overflow-hidden bg-black aspect-video">
            {videoUrl ? (
              <VideoPlayer
                ref={videoPlayerRef}
                src={videoUrl}
                className="w-full"
                onTimeUpdate={onTimeUpdate}
                markers={markers}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-6 text-center text-muted-foreground">
                <div>
                  <p>No video loaded</p>
                  <p className="text-sm mt-2">
                    Upload a video file to start analysis
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Time display and marker controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {formattedTime}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Marker label"
                value={newMarkerLabel}
                onChange={(e) => onNewMarkerLabelChange(e.target.value)}
                className="w-48 px-3 py-1 text-sm border rounded-md"
              />
              <Button
                size="sm"
                onClick={onAddMarker}
                disabled={!videoUrl}
              >
                Add Marker
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSection;
