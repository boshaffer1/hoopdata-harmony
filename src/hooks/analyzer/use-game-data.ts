
import { useState } from "react";
import { GameData, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";

export const useGameData = (videoPlayerRef: React.RefObject<any>) => {
  const [data, setData] = useState<GameData[]>([]);
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);
  const [isPlayingClip, setIsPlayingClip] = useState(false);

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

  // Helper functions for parsing CSV data
  const getSituationFromCSV = (item: any): GameSituation => {
    if (item["Situation"] === "SLOB") return "slob";
    if (item["Situation"] === "BLOB") return "blob";
    if (item["Situation"] === "ATO" || item["ATO"] === "ATO") return "ato";
    if (item["Notes"]?.includes("TRANS")) return "transition";
    if (item["Notes"]?.includes("FAST")) return "fast_break";
    return "other";
  };

  const getOutcomeFromCSV = (item: any) => {
    if (item["Shooting"]?.includes("3")) return "scored";
    if (item["Shooting"]?.includes("2")) return "scored";
    if (item["Shooting"]?.includes("-3") || item["Shooting"]?.includes("-2")) return "missed";
    if (item["Turnovers"] === "TO") return "turnover";
    return "other";
  };

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

  const playClip = async (item: GameData) => {
    if (!videoPlayerRef.current) {
      console.warn("Video player reference not available");
      toast.error("Video player not ready");
      return;
    }
    
    // Prevent multiple clip plays simultaneously
    if (isPlayingClip) {
      console.log("Already playing a clip, cancelling new request");
      toast.info("Already playing a clip");
      return;
    }
    
    setIsPlayingClip(true);
    setSelectedClip(item);
    
    try {
      const startTime = parseFloat(item["Start time"] || "0");
      const duration = parseFloat(item["Duration"] || "0");
      
      console.log(`Playing clip: "${item["Play Name"]}" at ${startTime}s for ${duration}s`);
      
      // First seek to the correct time
      await videoPlayerRef.current.seekToTime(startTime)
        .catch((error: any) => {
          console.error("Error seeking to position:", error);
          toast.error("Failed to seek to clip position");
          throw error;
        });
      
      // Wait for a moment to ensure the seek has completed
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Then play the video
      console.log("Seek completed, now playing video");
      await videoPlayerRef.current.play()
        .catch((error: any) => {
          console.error("Error playing clip:", error);
          toast.error("Failed to play clip");
          throw error;
        });
      
      // If duration specified, set a timer to pause at the end
      if (duration > 0) {
        setTimeout(() => {
          if (videoPlayerRef.current) {
            videoPlayerRef.current.pause();
            console.log("Clip playback completed");
            setIsPlayingClip(false);
          }
        }, duration * 1000);
      } else {
        // If no duration specified, we still reset the playing flag after a minimum time 
        // to avoid locking the player
        setTimeout(() => {
          setIsPlayingClip(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error in clip playback flow:", error);
      setIsPlayingClip(false);
      toast.error("Failed to play clip");
    }
  };

  return {
    data,
    selectedClip,
    isPlayingClip,
    handleFileLoaded,
    playClip,
    setSelectedClip
  };
};
