import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import VideoAnalyzerPanel from "@/components/analyzer/panels/VideoAnalyzerPanel";
import SidePanelTabs from "@/components/analyzer/panels/SidePanelTabs";
import MarkerPanel from "@/components/analyzer/panels/MarkerPanel";
import LibraryPanel from "@/components/analyzer/panels/LibraryPanel";
import RosterPanel from "@/components/analyzer/panels/RosterPanel";
import { SavedClip, GameData } from "@/types/analyzer";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";

const Analyzer = () => {
  const [activeTab, setActiveTab] = useState("markers");
  
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
    videoPlayerRef,
    recentVideos,
    setVideoUrl,
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
    setSelectedClip,
    autoOrganizeByPlayName,
    organizeByGames
  } = useAnalyzer();

  const {
    rosters,
    addTeam,
    removeTeam,
    addPlayer,
    removePlayer
  } = useRoster();

  const { 
    folders, 
    createFolder, 
    bulkMoveClips 
  } = useClipLibrary(videoUrl);

  const handleSelectRecentVideo = (url: string) => {
    setVideoUrl(url);
  };

  const handleSaveClipWrapper = (gameData: GameData, autoOrganize?: boolean) => {
    saveClipToLibrary(gameData, autoOrganize);
  };

  const handlePlayClipForVideoAnalyzer = (item: GameData) => {
    playClip(item);
  };

  const handleLibrarySavedClipPlay = (savedClip: SavedClip) => {
    const gameDataClip: GameData = {
      "Play Name": savedClip.label || "Unnamed Clip",
      "Start time": savedClip.startTime.toString(),
      "Duration": savedClip.duration.toString(),
      "Notes": savedClip.notes || "",
      "Timeline": savedClip.timeline || "",
      "Players": savedClip.players ? JSON.stringify(savedClip.players) : "[]",
      "Situation": savedClip.situation || "other",
      "Outcome": "other"
    };
    
    playClip(gameDataClip);
  };

  const handleBulkMoveClips = (clipIds: string[], targetFolderId: string | null) => {
    bulkMoveClips(clipIds, targetFolderId);
  };

  const handleCreateFolder = (name: string, description: string) => {
    return createFolder(name, description);
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Video Analyzer</h1>
        <p className="text-muted-foreground">
          Sync game footage with data for comprehensive analysis
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <VideoAnalyzerPanel 
          videoUrl={videoUrl}
          currentTime={currentTime}
          data={data}
          newMarkerLabel={newMarkerLabel}
          markers={markers}
          selectedClip={selectedClip}
          isPlayingClip={isPlayingClip}
          videoPlayerRef={videoPlayerRef}
          recentVideos={recentVideos}
          onTimeUpdate={handleTimeUpdate}
          onVideoFileChange={handleVideoFileChange}
          onNewMarkerLabelChange={setNewMarkerLabel}
          onAddMarker={addMarker}
          onSelectVideo={handleSelectRecentVideo}
          onFileLoaded={handleFileLoaded}
          onPlayClip={handlePlayClipForVideoAnalyzer}
          onStopClip={stopClip}
          onExportClip={exportClip}
          onSaveClip={handleSaveClipWrapper}
        />
        
        <div className="lg:col-span-1">
          <SidePanelTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            markersPanel={
              <MarkerPanel 
                markers={markers}
                onSeekToMarker={seekToMarker}
                onRemoveMarker={removeMarker}
                onMarkerNotesChange={updateMarkerNotes}
                onExportAllMarkers={exportAllMarkers}
              />
            }
            libraryPanel={
              <LibraryPanel 
                savedClips={savedClips}
                playLabel={playLabel}
                selectedClip={selectedClip}
                isPlayingClip={isPlayingClip}
                onPlayLabelChange={setPlayLabel}
                onSaveClip={handleSaveClipWrapper}
                onRemoveClip={removeSavedClip}
                onExportClip={exportClip}
                onExportLibrary={exportLibrary}
                onPlayClip={handleLibrarySavedClipPlay}
                onStopClip={stopClip}
                onBulkMoveClips={handleBulkMoveClips}
                onCreateFolder={handleCreateFolder}
                folders={folders}
              />
            }
            rosterPanel={
              <RosterPanel 
                rosters={rosters}
                onAddTeam={addTeam}
                onRemoveTeam={removeTeam}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
              />
            }
          />
        </div>
      </div>
    </Layout>
  );
};

export default Analyzer;
