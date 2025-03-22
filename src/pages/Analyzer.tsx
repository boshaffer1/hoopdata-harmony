
import React from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/layout/Section";
import VideoSection from "@/components/analyzer/VideoSection";
import GameDataSection from "@/components/analyzer/GameDataSection";
import MarkersList from "@/components/analyzer/MarkersList";
import { useAnalyzer } from "@/hooks/use-analyzer";

const Analyzer = () => {
  const {
    videoUrl,
    currentTime,
    data,
    markers,
    newMarkerLabel,
    selectedClip,
    videoPlayerRef,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip,
    seekToMarker,
    setNewMarkerLabel
  } = useAnalyzer();

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
          />
        </div>
        
        {/* Markers and Notes Section */}
        <div className="lg:col-span-1">
          <MarkersList 
            markers={markers}
            onSeekToMarker={seekToMarker}
            onRemoveMarker={removeMarker}
            onMarkerNotesChange={updateMarkerNotes}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Analyzer;
