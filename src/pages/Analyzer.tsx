
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import AnalyticsOverview from "@/components/analyzer/stats/AnalyticsOverview";
import ClipAssistant from "@/components/analyzer/ai/ClipAssistant";
import RosterView from "@/components/analyzer/teams/RosterView";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import { calculateStats } from "@/utils/analyzer-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, BarChart3, Bot, Users } from "lucide-react";

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

  // Calculate analytics on clips change
  const [analyticsData, setAnalyticsData] = useState(null);
  
  useEffect(() => {
    if (savedClips.length > 0) {
      const stats = calculateStats(savedClips);
      setAnalyticsData(stats);
    } else {
      setAnalyticsData(null);
    }
  }, [savedClips]);

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
        
        {/* Tabs for various tools */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="markers">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="markers" className="flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Markers</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Assistant</span>
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
                onPlayLabelChange={setPlayLabel}
                onSaveClip={saveClipToLibrary}
                onRemoveClip={removeSavedClip}
                onExportClip={exportClip}
                onExportLibrary={exportLibrary}
                onPlayClip={handlePlaySavedClip}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsOverview data={analyticsData} />
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-0">
              <ClipAssistant 
                savedClips={savedClips}
                onPlayClip={handlePlaySavedClip}
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
