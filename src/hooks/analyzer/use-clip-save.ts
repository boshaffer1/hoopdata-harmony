
import { useState } from "react";
import { GameData, SavedClip, PlayerAction, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";

export const useClipSave = () => {
  const [playLabel, setPlayLabel] = useState("");
  
  const saveClipToLibrary = (
    clip: GameData, 
    playLabel: string,
    savedClips: SavedClip[], 
    setSavedClips: React.Dispatch<React.SetStateAction<SavedClip[]>>
  ) => {
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
    
    const situation = (clip.Situation || "other") as GameSituation;
    
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
      // Check if this marker already exists at approximately the same time
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
    
    return savedClip;
  };
  
  const saveClipsFromData = (
    data: GameData[], 
    savedClips: SavedClip[], 
    setSavedClips: React.Dispatch<React.SetStateAction<SavedClip[]>>
  ) => {
    if (!data || data.length === 0) return [];
    
    console.log("Creating clips from", data.length, "plays");
    const newClips: SavedClip[] = [];
    
    data.forEach(item => {
      const startTime = parseFloat(item["Start time"] || "0");
      const duration = parseFloat(item["Duration"] || "0");
      
      if (isNaN(startTime)) {
        console.warn("Skipping clip with invalid start time:", item);
        return;
      }
      
      let players: PlayerAction[] = [];
      try {
        if (item.Players && item.Players !== "[]") {
          players = JSON.parse(item.Players);
        }
      } catch (error) {
        console.error("Error parsing player data:", error);
      }
      
      let label = item["Play Name"] || "";
      if (!label && item["Notes"]) {
        label = item["Notes"];
      }
      if (!label) {
        label = `Clip at ${startTime.toFixed(1)}s`;
      }
      
      const situation = (item.Situation || "other") as GameSituation;
      
      const newClip: SavedClip = {
        id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        startTime,
        duration,
        label,
        notes: item.Notes || "",
        timeline: item.Timeline || "",
        saved: new Date().toISOString(),
        players,
        situation
      };
      
      newClips.push(newClip);
    });
    
    console.log(`Generated ${newClips.length} new clips from data`);
    
    setSavedClips(prev => {
      // Filter out duplicates by checking if a clip already exists at approximately the same time
      const filteredNewClips = newClips.filter(newClip => 
        !prev.some(existingClip => 
          Math.abs(existingClip.startTime - newClip.startTime) < 0.1 && 
          existingClip.label === newClip.label
        )
      );
      
      console.log("Adding", filteredNewClips.length, "unique clips to library");
      return [...prev, ...filteredNewClips];
    });
    
    return newClips;
  };

  return {
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    saveClipsFromData
  };
};
