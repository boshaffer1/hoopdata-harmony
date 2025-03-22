
import { useState } from "react";
import { GameData } from "@/types/analyzer";

export const useGameData = (videoPlayerRef: React.RefObject<any>) => {
  const [data, setData] = useState<GameData[]>([]);
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);

  const handleFileLoaded = (loadedData: any) => {
    const processedData = loadedData.map((item: any) => {
      return {
        ...item,
        "Start time": item["Start time"] || "0",
        "Duration": item["Duration"] || "0",
      };
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
