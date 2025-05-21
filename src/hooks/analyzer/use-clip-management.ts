
import { useState } from "react";
import { toast } from "sonner";
import { GameData, SavedClip } from "@/types/analyzer";
import { useClipLibrary } from "./use-clip-library";

export const useClipManagement = (videoUrl: string | null, videoPlayerRef: React.RefObject<any>) => {
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  
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

  const convertGameDataToSavedClip = (gameData: GameData): SavedClip => {
    const startTime = parseFloat(gameData["Start time"] || "0");
    const duration = parseFloat(gameData["Duration"] || "0");
    
    return {
      id: `temp-${Date.now()}`,
      startTime,
      duration,
      label: gameData["Play Name"] || "Untitled Clip",
      notes: gameData["Notes"] || "",
      timeline: gameData["Timeline"] || "",
      saved: new Date().toISOString(),
      situation: gameData["Situation"] || "other"
    };
  };

  const playSelectedClip = (item: GameData) => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    
    if (!videoPlayerRef.current) {
      toast.error("Video player not ready");
      return;
    }
    
    const startTime = parseFloat(item["Start time"] || "0");
    const duration = parseFloat(item["Duration"] || "0");
    
    const minutes = Math.floor(startTime / 60);
    const seconds = Math.floor(startTime % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    toast.success(`Playing clip from ${formattedTime}`);
    
    // Stop any currently playing clip first
    if (isPlayingClip) {
      stopClipPlayback();
    }
    
    setIsPlayingClip(true);
    setSelectedClip(item);
    
    setTimeout(async () => {
      try {
        // Try to pause before seeking
        try {
          videoPlayerRef.current.pause();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log("Error pausing before seek, continuing:", error);
        }
        
        // Try to seek to the correct time
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Seek attempt ${attempt}: To position ${startTime}s`);
            await videoPlayerRef.current.seekToTime(startTime);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const actualTime = videoPlayerRef.current.getCurrentTime();
            console.log(`Current position after seek: ${actualTime}s`);
            
            if (Math.abs(actualTime - startTime) <= 2) {
              break;
            } else if (attempt === 2) {
              try {
                const videoElement = videoPlayerRef.current.getVideoElement();
                if (videoElement) {
                  videoElement.currentTime = startTime;
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              } catch (directSetError) {
                console.error("Error on direct time set:", directSetError);
              }
            }
          } catch (error) {
            console.error(`Seek attempt ${attempt} failed:`, error);
            await new Promise(resolve => setTimeout(resolve, 200 * attempt));
          }
        }
        
        // Start playing
        await videoPlayerRef.current.play();
        
        // Set timeout to stop playing after duration
        if (duration > 0) {
          setTimeout(() => {
            if (videoPlayerRef.current) {
              try {
                videoPlayerRef.current.pause();
                console.log("Clip playback completed");
              } catch (error) {
                console.error("Error pausing after clip completion:", error);
              } finally {
                stopClipPlayback();
              }
            }
          }, duration * 1000);
        } else {
          setTimeout(() => {
            stopClipPlayback();
          }, 3000);
        }
      } catch (error) {
        console.error("Error in clip playback flow:", error);
        stopClipPlayback();
        toast.error("Failed to play clip");
      }
    }, 100);
  };

  const stopClipPlayback = () => {
    if (videoPlayerRef.current) {
      try {
        videoPlayerRef.current.pause();
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
    
    setIsPlayingClip(false);
    setSelectedClip(null);
    console.log("Clip playback state reset");
  };

  const handlePlaySavedClip = (clip: SavedClip) => {
    console.log("handlePlaySavedClip called with clip:", clip);
    
    if (clip.directVideoUrl) {
      console.log("Clip has direct video URL:", clip.directVideoUrl.substring(0, 50) + "...");
      // We need to convert this to a GameData object
      const gameData: GameData = {
        "Play Name": clip.label,
        "Start time": clip.startTime.toString(),
        "Duration": clip.duration.toString(),
        "Notes": clip.notes || "",
        "Timeline": clip.timeline || "",
        "Players": clip.players ? JSON.stringify(clip.players) : "[]",
        "Situation": clip.situation || "other",
        "Outcome": "other"
      };
      
      playSelectedClip(gameData);
    }
  };

  const handleExportClip = (clipData: GameData | SavedClip) => {
    let clip: SavedClip;
    
    // Convert GameData to SavedClip if needed
    if ('startTime' in clipData) {
      clip = clipData as SavedClip;
    } else {
      clip = convertGameDataToSavedClip(clipData as GameData);
    }
    
    exportClip(clip);
  };

  return {
    selectedClip,
    isPlayingClip,
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip: handleExportClip,
    exportLibrary,
    playClip: playSelectedClip,
    stopClip: stopClipPlayback,
    handlePlaySavedClip,
    saveClipsFromData,
    autoOrganizeClips,
    setSelectedClip
  };
};
