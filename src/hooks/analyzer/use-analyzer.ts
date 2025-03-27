
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
    seekToMarker,
    isPlayerReady
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
    isPlayingClip,
    handleFileLoaded: originalHandleFileLoaded,
    playClip,
    stopClipPlayback,
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
    saveClipsFromData
  } = useClipLibrary(videoUrl);

  const handleFileLoaded = (loadedData: any) => {
    const processedData = originalHandleFileLoaded(loadedData);
    
    if (processedData && processedData.length > 0) {
      console.log("Creating markers and clips from", processedData.length, "plays");
      
      const createdMarkers = addMarkersFromData(processedData);
      
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
    
    const startTime = parseFloat(item["Start time"] || "0");
    const duration = parseFloat(item["Duration"] || "0");
    
    const minutes = Math.floor(startTime / 60);
    const seconds = Math.floor(startTime % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    toast.success(`Playing clip from ${formattedTime}`);
    
    // Add a small delay to ensure the video player is ready
    setTimeout(() => {
      playClip(item).catch(error => {
        console.error("Failed to play clip:", error);
        toast.error("Failed to play the clip, please try again");
      });
    }, 300);
  };

  const handlePlaySavedClip = (clip: SavedClip) => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      navigate("/analyzer");
      return;
    }
    
    if (!isPlayerReady) {
      toast.error("Video player is still initializing. Please try again in a moment.");
      return;
    }
    
    console.log("Playing saved clip:", clip);

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
  
  // Add this new function to stop clip playback
  const handleStopClip = () => {
    if (isPlayingClip) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
      stopClipPlayback();
      toast.info("Clip playback stopped");
    }
  };
  
  // Add navigate function to redirect to analyzer page when needed
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
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
    isPlayingClip,
    videoPlayerRef,
    isPlayerReady,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip: playSelectedClip,
    stopClip: handleStopClip,
    seekToMarker,
    setNewMarkerLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    exportAllMarkers,
    handlePlaySavedClip,
    setSelectedClip
  };
};
