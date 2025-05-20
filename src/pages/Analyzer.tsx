import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import RosterView from "@/components/analyzer/teams/RosterView";
import ExistingVideosSection from "@/components/analyzer/ExistingVideosSection";
import GameDataDisplay from "@/components/analyzer/GameDataDisplay";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, Users, StopCircle, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedClip, GameData } from "@/types/analyzer";
import { Progress } from "@/components/ui/progress";
import { ClipThumbnailGrid } from "@/components/library/ClipThumbnailGrid";
import { formatReadableTime } from "@/components/video/utils";
import { ClipLibraryExtension } from "@/components/analyzer/ClipLibraryExtension";
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

  // Add a helper function to convert GameData to SavedClip
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

  // Fix the handleExportClip function
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

  // Toggle between analyzer mode and demo data display mode
  const [showDemoData, setShowDemoData] = useState(false);

  return (
    <Layout className="py-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Video Analyzer</h1>
          <p className="text-muted-foreground">
            Sync game footage with data for comprehensive analysis
          </p>
        </div>
        <div>
          <Button
            variant={showDemoData ? "default" : "outline"}
            onClick={() => setShowDemoData(!showDemoData)}
          >
            {showDemoData ? "Analyzer Mode" : "Demo Data Mode"}
          </Button>
        </div>
      </div>
      
      {showDemoData ? (
        <GameDataDisplay />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Existing Videos Section */}
            <ExistingVideosSection 
              onVideoSelect={handleVideoFileChange}
              onCsvDataSelect={handleFileLoaded}
            />
            
            {isUploading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                <p className="mb-2 font-medium">Uploading video to your account</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            )}
            
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
            />
            
            {/* Clip control indicator and stop button */}
            {isPlayingClip && selectedClip && (
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
                  onClick={stopClip} 
                  className="bg-white dark:bg-background flex items-center gap-1"
                >
                  <StopCircle className="h-4 w-4" />
                  Stop Clip
                </Button>
              </div>
            )}
            
            {/* Data Table */}
            <GameDataSection 
              data={data}
              videoUrl={videoUrl}
              selectedClip={selectedClip}
              isPlayingClip={isPlayingClip}
              onFileLoaded={handleFileLoaded}
              onPlayClip={playClip}
              onStopClip={stopClip}
              onExportClip={handleExportClip}
            />
          </div>
          
          {/* Tabs for various tools */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="markers">
              <TabsList className="grid grid-cols-4 mb-6">
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
                <TabsTrigger value="gallery" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Gallery</span>
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
                  onPlayClip={handleLibrarySavedClipPlay}
                  onStopClip={stopClip}
                  onAutoOrganize={autoOrganizeClips}
                />
                
                {/* Add the AI analysis extension */}
                <ClipLibraryExtension selectedClip={selectedClip} />
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
              
              <TabsContent value="gallery" className="mt-0">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Clip Gallery</h3>
                  <ClipThumbnailGrid
                    clips={savedClips}
                    onPlayClip={handleLibrarySavedClipPlay}
                    bucketFilter="clips"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Analyzer;
