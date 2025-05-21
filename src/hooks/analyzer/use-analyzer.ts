
import { useVideo } from "./use-video";
import { useMarkers } from "./use-markers";
import { useGameData } from "./use-game-data";
import { useUpload } from "./use-upload";
import { useClipManagement } from "./use-clip-management";
import { useState } from "react";
import { GameData } from "@/types/analyzer";
import { toast } from "sonner";

export const useAnalyzer = () => {
  const {
    videoUrl,
    currentTime,
    videoPlayerRef,
    handleVideoFileChange: originalHandleVideoFileChange,
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
    handleFileLoaded: originalHandleFileLoaded
  } = useGameData(videoPlayerRef);

  const {
    isUploading,
    uploadProgress,
    uploadVideoToSupabase
  } = useUpload();

  const {
    selectedClip,
    isPlayingClip,
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    playClip: playSelectedClip,
    stopClip: handleStopClip,
    handlePlaySavedClip,
    saveClipsFromData,
    autoOrganizeClips,
    setSelectedClip
  } = useClipManagement(videoUrl, videoPlayerRef);

  const handleFileLoaded = (loadedData: any) => {
    const processedData = originalHandleFileLoaded(loadedData);
    
    if (processedData && processedData.length > 0) {
      console.log("Creating markers and clips from", processedData.length, "plays");
      
      const createdMarkers = addMarkersFromData(processedData);
      const savedClips = saveClipsFromData(processedData);
      
      if (videoUrl) {
        uploadVideoAndData(videoUrl, processedData);
        
        // Auto-organize clips after upload is complete
        setTimeout(() => {
          try {
            autoOrganizeClips();
            toast.success("Clips automatically organized into team folders");
          } catch (error) {
            console.error("Error auto-organizing clips:", error);
          }
        }, 2000);
      }
      
      toast.success(`Created ${createdMarkers.length} markers and ${savedClips.length} clips from ${processedData.length} plays`);
    }
    
    return processedData;
  };

  // Updated to fix the GameData to SavedClip conversion for proper clip saving
  const saveClip = (startTime: number, duration: number, label: string) => {
    if (!videoUrl) {
      toast.error("No video loaded");
      return;
    }
    
    const gameData: GameData = {
      "Play Name": label,
      "Start time": startTime.toString(),
      "Duration": duration.toString(),
      "Situation": "other",
      "Outcome": "other",
      "Players": "[]",
    };
    
    saveClipToLibrary(gameData);
  };
  
  const handleVideoFileChange = (fileOrEvent: File | string | React.ChangeEvent<HTMLInputElement>) => {
    return originalHandleVideoFileChange(fileOrEvent);
  };

  const uploadVideoAndData = async (videoUrl: string | null, processedData: GameData[]) => {
    // Skip the upload since we're now handling it differently
    return true;
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
    isUploading,
    uploadProgress,
    videoPlayerRef,
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
    setSelectedClip,
    autoOrganizeClips,
    saveClip // Make sure we export the saveClip function
  };
};
