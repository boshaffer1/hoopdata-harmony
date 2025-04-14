
import React from "react";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";
import { GameData } from "@/types/analyzer";

interface VideoAnalyzerPanelProps {
  videoUrl?: string;
  currentTime: number;
  data: GameData[];
  newMarkerLabel: string;
  markers: { time: number; label: string; color: string }[];
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  videoPlayerRef: React.RefObject<any>;
  recentVideos: {url: string, name: string, timestamp: number}[];
  onTimeUpdate: (time: number) => void;
  onVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewMarkerLabelChange: (value: string) => void;
  onAddMarker: () => void;
  onSelectVideo: (url: string) => void;
  onFileLoaded: (loadedData: any) => void;
  onPlayClip: (item: GameData) => void;
  onStopClip: () => void;
  onExportClip: (item: GameData) => void;
  onSaveClip: (clip: GameData, autoOrganize?: boolean) => void;
}

const VideoAnalyzerPanel: React.FC<VideoAnalyzerPanelProps> = ({
  videoUrl,
  currentTime,
  data,
  newMarkerLabel,
  markers,
  selectedClip,
  isPlayingClip,
  videoPlayerRef,
  recentVideos,
  onTimeUpdate,
  onVideoFileChange,
  onNewMarkerLabelChange,
  onAddMarker,
  onSelectVideo,
  onFileLoaded,
  onPlayClip,
  onStopClip,
  onExportClip,
  onSaveClip
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <VideoSection 
        videoUrl={videoUrl}
        currentTime={currentTime}
        newMarkerLabel={newMarkerLabel}
        markers={markers}
        videoPlayerRef={videoPlayerRef}
        onTimeUpdate={onTimeUpdate}
        onVideoFileChange={onVideoFileChange}
        onNewMarkerLabelChange={onNewMarkerLabelChange}
        onAddMarker={onAddMarker}
        recentVideos={recentVideos}
        onSelectVideo={onSelectVideo}
      />
      
      {isPlayingClip && selectedClip && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">
              Now playing: {selectedClip["Play Name"]}
            </p>
            <p className="text-sm text-muted-foreground">
              Start: {selectedClip["Start time"]}s, Duration: {selectedClip["Duration"]}s
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
      )}
      
      <GameDataSection 
        data={data}
        videoUrl={videoUrl}
        selectedClip={selectedClip}
        isPlayingClip={isPlayingClip}
        onFileLoaded={onFileLoaded}
        onPlayClip={onPlayClip}
        onStopClip={onStopClip}
        onExportClip={onExportClip}
      />
    </div>
  );
};

export default VideoAnalyzerPanel;
