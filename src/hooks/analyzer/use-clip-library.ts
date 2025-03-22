import { useState, useEffect } from "react";
import { GameData, SavedClip, PlayerAction, GameSituation, PlayerActionType } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [playLabel, setPlayLabel] = useState("");

  useEffect(() => {
    console.log("Clip library currently has", savedClips.length, "clips");
  }, [savedClips]);

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
    return savedClip;
  };
  
  const saveClipsFromData = (data: GameData[]) => {
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
      
      const newClip: SavedClip = {
        id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        startTime,
        duration,
        label,
        notes: item.Notes || "",
        timeline: item.Timeline || "",
        saved: new Date().toISOString(),
        players,
        situation: item.Situation || "other"
      };
      
      newClips.push(newClip);
    });
    
    console.log(`Generated ${newClips.length} new clips from data`);
    
    setSavedClips(prev => {
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
  
  const addDemoClips = () => {
    if (savedClips.length === 0) {
      const demoClips: SavedClip[] = [
        {
          id: "demo-1",
          startTime: 10,
          duration: 15,
          label: "Fast break layup",
          notes: "Quick transition play with a finish at the rim",
          timeline: "",
          saved: new Date().toISOString(),
          players: [
            { playerId: "demo-p1", playerName: "John Smith", action: "scored" as PlayerActionType }
          ],
          situation: "fast_break" as GameSituation
        },
        {
          id: "demo-2",
          startTime: 45,
          duration: 20,
          label: "Corner three attempt",
          notes: "Open shot from the corner after ball movement",
          timeline: "",
          saved: new Date().toISOString(),
          players: [
            { playerId: "demo-p2", playerName: "Mike Johnson", action: "missed" as PlayerActionType }
          ],
          situation: "half_court" as GameSituation
        },
        {
          id: "demo-3",
          startTime: 120,
          duration: 12,
          label: "Post-up play",
          notes: "Back to the basket move with a hook shot",
          timeline: "",
          saved: new Date().toISOString(),
          players: [
            { playerId: "demo-p3", playerName: "David Williams", action: "scored" as PlayerActionType }
          ],
          situation: "other" as GameSituation
        },
        {
          id: "demo-4",
          startTime: 180,
          duration: 18,
          label: "Three pointer by Tatum",
          notes: "Clean look from beyond the arc",
          timeline: "",
          saved: new Date().toISOString(),
          players: [
            { playerId: "demo-p4", playerName: "Jayson Tatum", action: "scored" as PlayerActionType }
          ],
          situation: "other" as GameSituation
        },
        {
          id: "demo-5",
          startTime: 250,
          duration: 14,
          label: "Defense by Young",
          notes: "Great defensive stance leading to a steal",
          timeline: "",
          saved: new Date().toISOString(),
          players: [
            { playerId: "demo-p5", playerName: "Trae Young", action: "stole" as PlayerActionType }
          ],
          situation: "defense" as GameSituation
        }
      ];
      
      console.log("Adding demo clips for testing");
      setSavedClips(demoClips);
      return demoClips;
    }
    return [];
  };
  
  useEffect(() => {
    addDemoClips();
  }, []);
  
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
    exportLibrary,
    addDemoClips
  };
};
