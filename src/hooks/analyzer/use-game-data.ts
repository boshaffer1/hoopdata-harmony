
import { useState } from "react";
import { GameData, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";

export const useGameData = (videoPlayerRef: React.RefObject<any>) => {
  const [data, setData] = useState<GameData[]>([]);
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);

  const handleFileLoaded = (loadedData: any) => {
    try {
      const processedData = loadedData.map((item: any) => {
        // Validate required fields
        if (!item["Play Name"] || !item["Start time"] || !item["Duration"]) {
          throw new Error("CSV must include Play Name, Start time, and Duration columns");
        }

        // Process and validate the data
        const processedItem: GameData = {
          "Play Name": item["Play Name"],
          "Start time": item["Start time"] || "0",
          "Duration": item["Duration"] || "0",
          "Situation": (item["Situation"] as GameSituation) || "other",
          "Outcome": item["Outcome"] || "other",
          "Players": item["Players"] || "[]",
          "Notes": item["Notes"] || "",
          "Timeline": item["Timeline"] || ""
        };

        // Validate Players JSON format
        try {
          JSON.parse(processedItem.Players);
        } catch (e) {
          console.warn("Invalid Players JSON format:", item.Players);
          processedItem.Players = "[]";
        }

        return processedItem;
      });

      setData(processedData);
      toast.success(`Loaded ${processedData.length} plays`);
      return processedData;
    } catch (error) {
      toast.error((error as Error).message);
      return [];
    }
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
