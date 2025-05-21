
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import GameDataDisplay from "@/components/analyzer/GameDataDisplay";
import AnalyzerHeader from "@/components/analyzer/AnalyzerHeader";
import VideoPlayerSection from "@/components/analyzer/VideoPlayerSection";
import AnalyzerTabs from "@/components/analyzer/AnalyzerTabs";
import { GameData, SavedClip } from "@/types/analyzer";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const Analyzer = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isLoading && !user) {
      toast.error("Please sign in to access the video analyzer");
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
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
    autoOrganizeClips,
    saveClip
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
  
  // Adapter function to handle playing saved clips
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

  // Create a save clip adapter to match the expected interface
  const handleSaveClip = (startTime: number, duration: number, label: string) => {
    if (!videoUrl) {
      toast.error("No video loaded");
      return;
    }
    
    if (saveClip) {
      saveClip(startTime, duration, label);
    } else {
      toast.error("Save clip function not available");
    }
  };

  // Create an adapter for adding teams
  const handleAddTeam = (teamName: string) => {
    const result = addTeam(teamName);
    // Convert void return to empty roster if needed
    if (!result) {
      return {
        id: "",
        name: teamName,
        players: []
      };
    }
    return result;
  };
  
  // Adapter functions for markers with string IDs
  const handleRemoveMarker = (id: string) => {
    removeMarker(id);
  };
  
  const handleUpdateMarkerNotes = (id: string, notes: string) => {
    updateMarkerNotes(id, notes);
  };
  
  // Adapter function to handle game data to saved clip conversion for AnalyzerTabs
  const handleOnPlayClip = (clip: SavedClip | GameData) => {
    // Check if this is a GameData object
    if ('Play Name' in clip) {
      // Convert GameData to SavedClip before playing
      const convertedClip = convertGameDataToSavedClip(clip as GameData);
      handleLibrarySavedClipPlay(convertedClip);
    } else {
      // It's already a SavedClip
      handleLibrarySavedClipPlay(clip as SavedClip);
    }
  };
  
  // If loading or unauthenticated, show a loading state
  if (isLoading) {
    return (
      <Layout className="py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }

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
              onRemoveMarker={handleRemoveMarker}
              onMarkerNotesChange={handleUpdateMarkerNotes}
              onPlayLabelChange={setPlayLabel}
              onSaveClip={handleSaveClip}
              onRemoveClip={removeSavedClip}
              onExportClip={handleExportClip}
              onExportLibrary={exportLibrary}
              onPlayClip={handleOnPlayClip}
              onStopClip={stopClip}
              onAutoOrganize={autoOrganizeClips}
              onExportAllMarkers={exportAllMarkers}
              onAddTeam={handleAddTeam}
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
