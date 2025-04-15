import { useVideo } from "./use-video";
import { useMarkers } from "./use-markers";
import { useGameData } from "./use-game-data";
import { useClipLibrary } from "./use-clip-library";
import { useAuth } from "../use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SavedClip, GameData } from "@/types/analyzer";

export const useAnalyzer = () => {
  const { user } = useAuth();

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
      
      if (user) {
        const uploadVideoAndData = async () => {
          try {
            if (videoUrl) {
              const videoFile = await fetch(videoUrl);
              const videoBlob = await videoFile.blob();
              const videoFileName = `game_video_${Date.now()}.mp4`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('videos')
                .upload(videoFileName, videoBlob, {
                  contentType: 'video/mp4',
                });
              
              if (uploadError) throw uploadError;
              
              const { data: videoData, error: videoError } = await supabase
                .from('video_files')
                .insert({
                  user_id: user.id,
                  filename: videoFileName,
                  file_path: uploadData?.path,
                });
              
              if (videoError) throw videoError;
              
              const { error: csvError } = await supabase
                .from('csv_data')
                .insert({
                  user_id: user.id,
                  data: processedData,
                  filename: `game_data_${Date.now()}.csv`
                });
              
              if (csvError) throw csvError;
              
              toast.success(`Uploaded video and ${processedData.length} plays to Supabase`);
            }
          } catch (error) {
            console.error("Error uploading to Supabase:", error);
            toast.error("Failed to save video and data to cloud");
          }
        };
        
        uploadVideoAndData();
      }
      
      toast.success(`Created ${createdMarkers.length} markers and ${savedClips.length} clips from ${processedData.length} plays`);
    }
    
    return processedData;
  };

  const handleVideoFileChange = (fileOrEvent: File | string | React.ChangeEvent<HTMLInputElement>) => {
    return originalHandleVideoFileChange(fileOrEvent);
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
    
    setTimeout(() => {
      playClip(item).catch(error => {
        console.error("Failed to play clip:", error);
        toast.error("Failed to play the clip, please try again");
      });
    }, 100);
  };

  const handlePlaySavedClip = (clip: SavedClip) => {
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
  
  const handleStopClip = () => {
    if (isPlayingClip) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
      stopClipPlayback();
      toast.info("Clip playback stopped");
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
