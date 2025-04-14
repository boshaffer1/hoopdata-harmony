import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import RosterView from "@/components/analyzer/teams/RosterView";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, Users, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameData, SavedClip } from "@/types/analyzer";

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
    handlePlaySavedClip
  } = useAnalyzer();

  const {
    rosters,
    addTeam,
    removeTeam,
    addPlayer,
    removePlayer
  } = useRoster();

  const handleSelectRecentVideo = (url: string) => {
    setVideoUrl(url);
  };

  const handlePlaySavedClipWrapper = (clip: SavedClip) => {
    handlePlaySavedClip(clip);
  };

  const handleSavedClipToGameData = (clip: SavedClip): GameData => {
    return {
      "Play Name": clip.label,
      "Start time": clip.startTime.toString(),
      "Duration": clip.duration.toString(),
      "Situation": clip.situation || "other",
      "Outcome": "other",
      "Players": JSON.stringify(clip.players || []),
      "Notes": clip.notes || "",
      "Timeline": clip.timeline || ""
    };
  };

  const handleSaveClipWrapper = (clip: SavedClip) => {
    const gameData = handleSavedClipToGameData(clip);
    saveClipToLibrary(gameData);
  };

  const handleGameDataToSavedClip = (gameData: GameData): SavedClip => {
    let players = [];
    try {
      if (gameData.Players && gameData.Players !== "[]") {
        players = JSON.parse(gameData.Players);
      }
    } catch (e) {
      console.error("Error parsing players:", e);
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      startTime: parseFloat(gameData["Start time"]),
      duration: parseFloat(gameData["Duration"]),
      label: gameData["Play Name"],
      notes: gameData["Notes"] || "",
      timeline: gameData["Timeline"] || "",
      saved: new Date().toISOString(),
      players,
      situation: gameData["Situation"]
    };
  };

  const handlePlayGameData = (gameData: GameData) => {
    const savedClip = handleGameDataToSavedClip(gameData);
    handlePlaySavedClip(savedClip);
  };

  const handleSaveClip = (clip: GameData, autoOrganize: boolean = false) => {
    saveClipToLibrary(clip, autoOrganize);
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
        <div className="lg:col-span-2 space-y-6">
          <VideoSection 
            videoUrl={videoUrl}
            currentTime={currentTime}
            newMarkerLabel={newMarkerLabel}
            markers={markers}
            videoPlayerRef={videoPlayerRef}
            onTimeUpdate={handleTimeUpdate}
            onVideoFileChange={handleVideoFileChange}
            onNewMarkerLabelChange={setNewMarkerLabel}
            onAddMarker={addMarker}
            recentVideos={recentVideos}
            onSelectVideo={handleSelectRecentVideo}
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
                onClick={stopClip} 
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
            onFileLoaded={handleFileLoaded}
            onPlayClip={handlePlayGameData}
            onStopClip={stopClip}
            onExportClip={exportClip}
            onSaveClip={handleSaveClip}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Tabs defaultValue="markers">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="markers" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Markers</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="roster" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Rosters</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="markers" className="mt-0">
              <MarkersList 
                markers={markers}
                onSeekToMarker={seekToMarker}
                onRemoveMarker={removeMarker}
                onMarkerNotesChange={updateMarkerNotes}
                onExportAllMarkers={exportAllMarkers}
              />
            </TabsContent>
            
            <TabsContent value="library" className="mt-0">
              <ClipLibrary 
                savedClips={savedClips}
                playLabel={playLabel}
                selectedClip={selectedClip}
                isPlayingClip={isPlayingClip}
                onPlayLabelChange={setPlayLabel}
                onSaveClip={saveClipToLibrary}
                onRemoveClip={removeSavedClip}
                onExportClip={exportClip}
                onExportLibrary={exportLibrary}
                onPlayClip={handlePlaySavedClipWrapper}
                onStopClip={stopClip}
              />
            </TabsContent>
            
            <TabsContent value="roster" className="mt-0">
              <RosterView 
                rosters={rosters}
                onAddTeam={addTeam}
                onRemoveTeam={removeTeam}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Analyzer;
