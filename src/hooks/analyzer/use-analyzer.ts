
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
    playClip
  } = useGameData(videoPlayerRef);

  const {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary
  } = useClipLibrary(videoUrl);

  // Combined handlers
  const handleFileLoaded = (loadedData: any) => {
    const processedData = originalHandleFileLoaded(loadedData);
    addMarkersFromData(processedData);
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
    // Convert SavedClip to GameData format for playClip
    const gameDataClip: GameData = {
      "Play Name": clip.label,
      "Start time": clip.startTime.toString(),
      "Duration": clip.duration.toString(),
      "Notes": clip.notes,
      "Timeline": clip.timeline,
      "Players": clip.players ? JSON.stringify(clip.players) : "",
      "Situation": clip.situation || "other",
      "Outcome": "other"
    };
    
    playSelectedClip(gameDataClip);
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
    handlePlaySavedClip
  };
};
