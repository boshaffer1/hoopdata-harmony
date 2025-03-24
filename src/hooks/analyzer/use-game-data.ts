
import { useState } from "react";
import { GameData, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";

export const useGameData = (videoPlayerRef: React.RefObject<any>) => {
  const [data, setData] = useState<GameData[]>([]);
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);

  const handleFileLoaded = (loadedData: any) => {
    try {
      if (!Array.isArray(loadedData) || loadedData.length === 0) {
        throw new Error("Invalid CSV data format");
      }
      
      const processedData = loadedData.map((item: any) => {
        // Map CSV fields to required GameData structure
        // Handle various CSV formats and field names for flexibility
        const playName = item["Play Name"] || item["Notes"] || item["CHAD NOTES"] || "";
        const startTime = item["Start time"] || "0";
        const duration = item["Duration"] || "0";
        const situation = getSituationFromCSV(item);
        const outcome = getOutcomeFromCSV(item);
        const players = getPlayersFromCSV(item);
        const notes = item["Notes"] || "";
        const timeline = item["Timeline"] || "";
        
        // Process and validate the data
        const processedItem: GameData = {
          "Play Name": playName,
          "Start time": startTime,
          "Duration": duration,
          "Situation": situation,
          "Outcome": outcome,
          "Players": players,
          "Notes": notes,
          "Timeline": timeline
        };

        // Validate Players JSON format
        try {
          if (processedItem.Players && processedItem.Players !== "[]") {
            JSON.parse(processedItem.Players);
          }
        } catch (e) {
          console.warn("Invalid Players JSON format:", processedItem.Players);
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

  // Helper function to determine situation from CSV
  const getSituationFromCSV = (item: any): GameSituation => {
    if (item["Situation"] === "SLOB") return "slob";
    if (item["Situation"] === "BLOB") return "blob";
    if (item["Situation"] === "ATO" || item["ATO"] === "ATO") return "ato";
    if (item["Notes"]?.includes("TRANS")) return "transition";
    if (item["Notes"]?.includes("FAST")) return "fast_break";
    return "other";
  };

  // Helper function to determine outcome from CSV
  const getOutcomeFromCSV = (item: any) => {
    if (item["Shooting"]?.includes("3")) return "scored";
    if (item["Shooting"]?.includes("2")) return "scored";
    if (item["Shooting"]?.includes("-3") || item["Shooting"]?.includes("-2")) return "missed";
    if (item["Turnovers"] === "TO") return "turnover";
    return "other";
  };

  // Helper function to extract players from CSV
  const getPlayersFromCSV = (item: any): string => {
    const players = [];
    
    // Process Atlanta Hawks players
    if (item["Atlanta Hawks"]) {
      const hawksPlayers = item["Atlanta Hawks"].split(",");
      for (const player of hawksPlayers) {
        if (player.trim()) {
          players.push({
            playerId: `hawks-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            playerName: player.trim(),
            action: item["Shooting"]?.includes("-") ? "missed" : "scored"
          });
        }
      }
    }
    
    // Process Orlando Magic players
    if (item["Orlando Magic"]) {
      const magicPlayers = item["Orlando Magic"].split(",");
      for (const player of magicPlayers) {
        if (player.trim()) {
          players.push({
            playerId: `magic-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            playerName: player.trim(),
            action: item["Shooting"]?.includes("-") ? "missed" : "scored"
          });
        }
      }
    }
    
    return JSON.stringify(players);
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
    playClip,
    setSelectedClip
  };
};
