import React from "react";
import Layout from "@/components/layout/Layout";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library } from "lucide-react";

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
    videoPlayerRef,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip,
    seekToMarker,
    setNewMarkerLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    exportAllMarkers
  } = useAnalyzer();

  const handlePlaySavedClip = (clip: any) => {
    // Convert SavedClip to GameData format for playClip
    const gameDataClip = {
      "Start time": clip.startTime.toString(),
      "Duration": clip.duration.toString(),
      Notes: clip.label,
      Timeline: clip.timeline
    };
    playClip(gameDataClip);
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
        {/* Video Player and Upload Section */}
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
          />
          
          {/* Data Table */}
          <GameDataSection 
            data={data}
            videoUrl={videoUrl}
            selectedClip={selectedClip}
            onFileLoaded={handleFileLoaded}
            onPlayClip={playClip}
            onExportClip={exportClip}
          />
        </div>
        
        {/* Markers and Library Tabs */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="markers">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="markers" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                Markers
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Clip Library
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
                onPlayLabelChange={setPlayLabel}
                onSaveClip={saveClipToLibrary}
                onRemoveClip={removeSavedClip}
                onExportClip={exportClip}
                onExportLibrary={exportLibrary}
                onPlayClip={handlePlaySavedClip}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Analyzer;
