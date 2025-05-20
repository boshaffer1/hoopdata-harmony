
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import GameDataDisplay from "@/components/analyzer/GameDataDisplay";
import AnalyzerHeader from "@/components/analyzer/AnalyzerHeader";
import VideoPlayerSection from "@/components/analyzer/VideoPlayerSection";
import AnalyzerTabs from "@/components/analyzer/AnalyzerTabs";
import { GameData, SavedClip } from "@/types/analyzer";
import { toast } from "sonner";

const Analyzer = () => {
  const {
    videoUrl,
    currentTime,
    data,
    markers,
    newMarkerLabel,
    selectedClip,
    playLabel,
    savedClips,
    isPlayingClip,
    isUploading,
    uploadProgress,
    videoPlayerRef,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip,
    stopClip,
    seekToMarker,
    setNewMarkerLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    exportAllMarkers,
    handlePlaySavedClip,
    autoOrganizeClips
  } = useAnalyzer();

  const {
    rosters,
    addTeam,
    removeTeam,
    addPlayer,
    removePlayer
  } = useRoster();
  
  // Toggle between analyzer mode and demo data display mode
  const [showDemoData, setShowDemoData] = useState(false);
  
  // Convert GameData to SavedClip for the handleLibrarySavedClipPlay function
  const convertGameDataToSavedClip = (gameData: GameData): SavedClip => {
    const startTime = parseFloat(gameData["Start time"] || "0");
    const duration = parseFloat(gameData["Duration"] || "0");
    
    return {
      id: `temp-${Date.now()}`,
      startTime,
      duration,
      label: gameData["Play Name"] || "Untitled Clip",
      notes: gameData["Notes"] || "",
      timeline: gameData["Timeline"] || "",
      saved: new Date().toISOString(),
      situation: gameData["Situation"] || "other"
    };
  };
  
  // Adapter function to convert SavedClip to GameData
  const handleLibrarySavedClipPlay = (clip: SavedClip) => {
    console.log("handleLibrarySavedClipPlay called with clip:", clip);
    
    // If the clip has a directVideoUrl, ensure it's set immediately 
    if (clip.directVideoUrl) {
      console.log("Clip has directVideoUrl - using it directly:", clip.directVideoUrl.substring(0, 50) + "...");
      // First set the video URL directly through the video handler
      handleVideoFileChange(clip.directVideoUrl);
    } else {
      console.log("Clip does not have directVideoUrl");
    }
    
    // Then pass to the handler
    handlePlaySavedClip(clip);
  };

  // Fix the handleExportClip function to properly convert GameData to SavedClip
  const handleExportClip = async (clipData: GameData | SavedClip) => {
    if (!videoUrl) {
      toast.error("No video loaded");
      return;
    }

    let clip: SavedClip;
    
    // Convert GameData to SavedClip if needed
    if ('startTime' in clipData) {
      clip = clipData as SavedClip;
    } else {
      clip = convertGameDataToSavedClip(clipData as GameData);
    }
    
    exportClip(clip);
  };

  return (
    <Layout className="py-6">
      <AnalyzerHeader 
        showDemoData={showDemoData}
        onToggleDemoMode={() => setShowDemoData(!showDemoData)}
      />
      
      {showDemoData ? (
        <GameDataDisplay />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <VideoPlayerSection 
            videoUrl={videoUrl}
            currentTime={currentTime}
            newMarkerLabel={newMarkerLabel}
            markers={markers}
            videoPlayerRef={videoPlayerRef}
            data={data}
            selectedClip={selectedClip}
            isPlayingClip={isPlayingClip}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onTimeUpdate={handleTimeUpdate}
            onVideoFileChange={handleVideoFileChange}
            onFileLoaded={handleFileLoaded}
            onNewMarkerLabelChange={setNewMarkerLabel}
            onAddMarker={addMarker}
            onPlayClip={playClip}
            onStopClip={stopClip}
            onExportClip={handleExportClip}
          />
          
          <div className="lg:col-span-1">
            <AnalyzerTabs 
              markers={markers}
              savedClips={savedClips}
              playLabel={playLabel}
              selectedClip={selectedClip}
              isPlayingClip={isPlayingClip}
              rosters={rosters}
              onSeekToMarker={seekToMarker}
              onRemoveMarker={removeMarker}
              onMarkerNotesChange={updateMarkerNotes}
              onPlayLabelChange={setPlayLabel}
              onSaveClip={saveClipToLibrary}
              onRemoveClip={removeSavedClip}
              onExportClip={exportClip}
              onExportLibrary={exportLibrary}
              onPlayClip={handleLibrarySavedClipPlay}
              onStopClip={stopClip}
              onAutoOrganize={autoOrganizeClips}
              onExportAllMarkers={exportAllMarkers}
              onAddTeam={addTeam}
              onRemoveTeam={removeTeam}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Analyzer;
