
import { useState } from "react";
import { GameData, SavedClip, PlayerAction, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [playLabel, setPlayLabel] = useState("");

  const saveClipToLibrary = (clip: GameData) => {
    if (!playLabel.trim()) {
      toast.error("Please enter a play label");
      return;
    }
    
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    
    let players: PlayerAction[] = [];
    try {
      if (clip.Players && clip.Players !== "[]") {
        players = JSON.parse(clip.Players);
      }
    } catch (error) {
      console.error("Error parsing player data:", error);
    }
    
    let situation: GameSituation = clip.Situation || "other";
    
    const savedClip: SavedClip = {
      id: Date.now().toString(),
      startTime,
      duration,
      label: playLabel,
      notes: clip.Notes || "",
      timeline: clip.Timeline || "",
      saved: new Date().toISOString(),
      players,
      situation
    };
    
    setSavedClips(prevClips => {
      // Check if this clip already exists by comparing startTime
      const clipExists = prevClips.some(existingClip => 
        Math.abs(existingClip.startTime - startTime) < 0.1 && 
        existingClip.label === playLabel
      );
      
      if (clipExists) {
        toast.info(`Clip updated: ${playLabel}`);
        return prevClips.map(existingClip => 
          Math.abs(existingClip.startTime - startTime) < 0.1 && 
          existingClip.label === playLabel ? savedClip : existingClip
        );
      } else {
        toast.success(`Saved clip: ${playLabel}`);
        return [...prevClips, savedClip];
      }
    });
    
    setPlayLabel("");
  };
  
  const saveClipsFromData = (data: GameData[]) => {
    if (!data || data.length === 0) return;
    
    const newClips: SavedClip[] = data.map(item => {
      const startTime = parseFloat(item["Start time"] || "0");
      const duration = parseFloat(item["Duration"] || "0");
      
      let players: PlayerAction[] = [];
      try {
        if (item.Players && item.Players !== "[]") {
          players = JSON.parse(item.Players);
        }
      } catch (error) {
        console.error("Error parsing player data:", error);
      }
      
      return {
        id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        startTime,
        duration,
        label: item["Play Name"] || `Clip at ${startTime.toFixed(1)}s`,
        notes: item.Notes || "",
        timeline: item.Timeline || "",
        saved: new Date().toISOString(),
        players,
        situation: item.Situation || "other"
      };
    });
    
    setSavedClips(prev => {
      // Filter out duplicates by checking startTime and label to prevent duplicates
      const filteredNewClips = newClips.filter(newClip => 
        !prev.some(existingClip => 
          Math.abs(existingClip.startTime - newClip.startTime) < 0.1 && 
          existingClip.label === newClip.label
        )
      );
      
      return [...prev, ...filteredNewClips];
    });
  };
  
  const removeSavedClip = (id: string) => {
    setSavedClips(savedClips.filter(clip => clip.id !== id));
    toast.success("Clip removed from library");
  };
  
  const exportClip = async (clip: SavedClip | GameData) => {
    if (!videoUrl) {
      toast.error("No video loaded");
      return;
    }
    
    let startTime, duration, label;
    
    if ('id' in clip) {
      startTime = clip.startTime;
      duration = clip.duration;
      label = clip.label;
    } else {
      startTime = parseFloat(clip["Start time"] || "0");
      duration = parseFloat(clip["Duration"] || "0");
      label = clip["Play Name"] || "clip";
    }
    
    toast.loading("Exporting clip...");
    
    try {
      const filename = `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
      await extractVideoClip(videoUrl, startTime, duration, filename);
      toast.dismiss();
      toast.success(`Clip exported as ${filename}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export clip");
      console.error(error);
    }
  };
  
  const exportLibrary = () => {
    if (savedClips.length === 0) {
      toast.error("No clips in library to export");
      return;
    }
    
    const exportData = {
      clips: savedClips,
      exportedAt: new Date().toISOString(),
      totalClips: savedClips.length
    };
    
    downloadJSON(exportData, "clip-library.json");
    toast.success("Clip library exported as JSON");
  };

  return {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    saveClipsFromData,
    removeSavedClip,
    exportClip,
    exportLibrary
  };
};
