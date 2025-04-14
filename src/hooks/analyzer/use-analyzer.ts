
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
    isPlayerReady,
    recentVideos,
    setVideoUrl
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
    saveClipsFromData,
    folders,
    createFolder,
    moveClipToFolder,
    games,
    addGame,
    updateGame,
    videoRegistry,
    getVideoByUrl,
    autoOrganizeByPlayName,
    organizeByGames
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
    // First check if the clip has a videoUrl
    const clipVideoUrl = clip.videoUrl;
    
    // If we have a video URL associated with this clip
    if (clipVideoUrl) {
      // If it's different from the current video, load it
      if (clipVideoUrl !== videoUrl) {
        toast.info("Loading the associated video for this clip...");
        setVideoUrl(clipVideoUrl);
        // Give time for the video to load before playing
        setTimeout(() => {
          playSavedClipInternal(clip);
        }, 800);
        return;
      }
    }
    
    // If no specific video URL or it's the current one, use the current video
    if (!videoUrl) {
      // Check the recent videos first to see if we can find a matching video
      const clipVideoFound = recentVideos.some(video => {
        if (video.url) {
          setVideoUrl(video.url);
          // Give a small delay for the video to load before attempting to play
          setTimeout(() => {
            playSavedClipInternal(clip);
          }, 800);
          return true;
        }
        return false;
      });
      
      if (!clipVideoFound) {
        toast.error("Please upload a video to play this clip");
        return;
      }
    } else {
      playSavedClipInternal(clip);
    }
  };
  
  const playSavedClipInternal = (clip: SavedClip) => {
    if (!isPlayerReady) {
      toast.error("Video player is still initializing. Please try again in a moment.");
      return;
    }
    
    console.log("Playing saved clip:", clip);

    const gameDataClip: GameData = {
      "Play Name": clip.label || "Unnamed Clip",
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
  
  const handleStopClip = () => {
    if (isPlayingClip) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
      stopClipPlayback();
      toast.info("Clip playback stopped");
    }
  };

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
    folders,
    recentVideos,
    setVideoUrl,
    createFolder,
    moveClipToFolder,
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
    games,
    addGame,
    updateGame,
    autoOrganizeByPlayName,
    organizeByGames
  };
};
