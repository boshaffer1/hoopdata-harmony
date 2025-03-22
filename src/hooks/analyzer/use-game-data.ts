
import { useState } from "react";
import { GameData, GameSituation } from "@/types/analyzer";

export const useGameData = (videoPlayerRef: React.RefObject<any>) => {
  const [data, setData] = useState<GameData[]>([]);
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);

  const handleFileLoaded = (loadedData: any) => {
    const processedData = loadedData.map((item: any) => {
      // Process required fields with defaults
      const processedItem = {
        ...item,
        "Start time": item["Start time"] || "0",
        "Duration": item["Duration"] || "0",
      };
      
      // Handle potential situation data
      if (item.Situation) {
        processedItem.Situation = item.Situation;
      }
      
      // Handle players data if present
      if (item.Players) {
        try {
          // Validate JSON format for players
          JSON.parse(item.Players);
        } catch (e) {
          console.warn("Invalid Players JSON format:", item.Players);
          processedItem.Players = "[]";
        }
      }
      
      return processedItem;
    });
    
    setData(processedData);
    return processedData;
  };

  const playClip = (item: GameData) => {
    if (!videoPlayerRef.current) {
      return;
    }
    
    const startTime = parseFloat(item["Start time"] || "0");
    const duration = parseFloat(item["Duration"] || "0");
    
    videoPlayerRef.current.seekToTime(startTime);
    videoPlayerRef.current.play();
      
    setSelectedClip(item);
      
    if (duration > 0) {
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.pause();
        }
      }, duration * 1000);
    }
  };

  return {
    data,
    selectedClip,
    handleFileLoaded,
    playClip
  };
};
