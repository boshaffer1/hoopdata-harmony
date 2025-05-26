
import React from "react";
import VideoSection from "./VideoSection";
import ExistingVideosSection from "./ExistingVideosSection";
import UploadProgressIndicator from "./UploadProgressIndicator";
import ClipPlaybackControl from "./ClipPlaybackControl";
import GameDataSection from "./GameDataSection";
import RealTimeStats from "./RealTimeStats";
import { GameData, Marker, SavedClip } from "@/types/analyzer";

interface VideoPlayerSectionProps {
  videoUrl: string | null;
  currentTime: number;
  newMarkerLabel: string;
  markers: Marker[];
  videoPlayerRef: React.RefObject<any>;
  data: any[];
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onTimeUpdate: (time: number) => void;
  onVideoFileChange: (e: File | string | React.ChangeEvent<HTMLInputElement>) => void;
  onFileLoaded: (data: any) => void;
  onNewMarkerLabelChange: (value: string) => void;
  onAddMarker: () => void;
  onPlayClip: (clip: GameData) => void;
  onStopClip: () => void;
  onExportClip: (clip: GameData | SavedClip) => void;
}

const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
  videoUrl,
  currentTime,
  newMarkerLabel,
  markers,
  videoPlayerRef,
  data,
  selectedClip,
  isPlayingClip,
  isUploading,
  uploadProgress,
  onTimeUpdate,
  onVideoFileChange,
  onFileLoaded,
  onNewMarkerLabelChange,
  onAddMarker,
  onPlayClip,
  onStopClip,
  onExportClip
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Add Existing Videos Section */}
      <ExistingVideosSection 
        onVideoSelect={onVideoFileChange}
        onCsvDataSelect={onFileLoaded}
      />
      
      <UploadProgressIndicator 
        isUploading={isUploading} 
        uploadProgress={uploadProgress} 
      />
      
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
      />
      
      <ClipPlaybackControl 
        isPlayingClip={isPlayingClip}
        selectedClip={selectedClip}
        onStopClip={onStopClip}
      />

      {/* Real-Time Analysis Stats */}
      <RealTimeStats 
        isAnalyzing={isUploading || (videoUrl !== null && data.length > 0)}
        onDetectionUpdate={(detection) => {
          console.log('New detection:', detection);
        }}
      />
      
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

export default VideoPlayerSection;
