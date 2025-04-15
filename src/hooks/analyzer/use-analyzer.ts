
import { useVideo } from "./use-video";
import { useMarkers } from "./use-markers";
import { useGameData } from "./use-game-data";
import { useClipLibrary } from "./use-clip-library";
import { useAuth } from "../use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SavedClip, GameData } from "@/types/analyzer";
import { useState, useEffect } from "react";

export const useAnalyzer = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    saveClipsFromData,
    autoOrganizeClips
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
            setIsUploading(true);
            
            if (videoUrl) {
              const videoFile = await fetch(videoUrl);
              const videoBlob = await videoFile.blob();
              const videoFileName = `game_video_${Date.now()}.mp4`;
              
              // Upload in chunks to show progress
              const chunkSize = 5 * 1024 * 1024; // 5MB chunks
              const totalSize = videoBlob.size;
              const chunks = Math.ceil(totalSize / chunkSize);
              
              for (let i = 0; i < chunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, totalSize);
                const chunk = videoBlob.slice(start, end);
                
                const tempFileName = `${videoFileName}.part${i}`;
                
                const { error: uploadChunkError } = await supabase.storage
                  .from('videos')
                  .upload(tempFileName, chunk, {
                    contentType: 'video/mp4',
                  });
                
                if (uploadChunkError) throw uploadChunkError;
                
                setUploadProgress(Math.round(((i + 1) / chunks) * 100));
              }
              
              // Combine chunks (in a real implementation, you'd use a server-side function)
              // For simplicity, we'll just use the last chunk as the complete file
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('videos')
                .upload(videoFileName, videoBlob, {
                  contentType: 'video/mp4',
                  upsert: true
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
          } catch (error) {
            console.error("Error uploading to Supabase:", error);
            toast.error("Failed to save video and data to cloud");
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
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
    autoOrganizeClips
  };
};
