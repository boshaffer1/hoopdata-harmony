
import { useVideo } from "./use-video";
import { useMarkers } from "./use-markers";
import { useGameData } from "./use-game-data";
import { useClipLibrary } from "./use-clip-library";
import { toast } from "sonner";
import { SavedClip, GameData } from "@/types/analyzer";

export const useAnalyzer = () => {
  const {
    videoUrl,
    currentTime,
    videoPlayerRef,
    handleVideoFileChange,
    handleTimeUpdate,
    seekToMarker
  } = useVideo();

  const {
    markers,
    newMarkerLabel,
    setNewMarkerLabel,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    addMarkersFromData,
    exportAllMarkers
  } = useMarkers(currentTime);

  const {
    data,
    selectedClip,
    handleFileLoaded: originalHandleFileLoaded,
    playClip,
    setSelectedClip
  } = useGameData(videoPlayerRef);

  const {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    saveClipsFromData,
    addDemoClips
  } = useClipLibrary(videoUrl);

  // Combined handlers with explicit data processing
  const handleFileLoaded = (loadedData: any) => {
    // Process data through the original handler
    const processedData = originalHandleFileLoaded(loadedData);
    
    // Only proceed if we have valid data
    if (processedData && processedData.length > 0) {
      console.log("Creating markers and clips from", processedData.length, "plays");
      
      // Explicitly create markers from data - this must run
      const createdMarkers = addMarkersFromData(processedData);
      
      // Explicitly save clips to library - this must run
      const savedClips = saveClipsFromData(processedData);
      
      toast.success(`Created ${createdMarkers.length} markers and ${savedClips.length} clips from ${processedData.length} plays`);
    }
    
    return processedData;
  };

  const playSelectedClip = (item: GameData) => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    
    playClip(item);
    
    const startTime = parseFloat(item["Start time"] || "0");
    const minutes = Math.floor(startTime / 60);
    const seconds = Math.floor(startTime % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    toast.success(`Playing clip from ${formattedTime}`);
  };

  const handlePlaySavedClip = (clip: SavedClip) => {
    // If there's no video loaded yet, just show the clip info
    if (!videoUrl) {
      toast.info(`Clip: ${clip.label}${clip.notes ? ` - ${clip.notes}` : ''}`);
      return;
    }
    
    // Convert SavedClip to GameData format for playClip
    const gameDataClip: GameData = {
      "Play Name": clip.label,
      "Start time": clip.startTime.toString(),
      "Duration": clip.duration.toString(),
      "Notes": clip.notes || "",
      "Timeline": clip.timeline || "",
      "Players": clip.players ? JSON.stringify(clip.players) : "[]",
      "Situation": clip.situation || "other",
      "Outcome": "other"
    };
    
    playSelectedClip(gameDataClip);
  };
  
  // Function to add demo clips if needed
  const addDemoClipsIfNeeded = () => {
    return addDemoClips();
  };

  return {
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
    playClip: playSelectedClip,
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
    addDemoClipsIfNeeded
  };
};
