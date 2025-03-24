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
        const playName = item["Play Name"] || item["Notes"] || item["CHAD NOTES"] || "";
        const startTime = item["Start time"] || "0";
        const duration = item["Duration"] || "0";
        const situation = getSituationFromCSV(item);
        const outcome = getOutcomeFromCSV(item);
        const players = getPlayersFromCSV(item);
        const notes = item["Notes"] || "";
        const timeline = item["Timeline"] || "";
        
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
      return Promise.reject("Video player not available");
    }
    
    if (isPlayingClip) {
      console.log("Already playing a clip, cancelling new request");
      toast.info("Already playing a clip");
      return Promise.reject("Already playing a clip");
    }
    
    setIsPlayingClip(true);
    setSelectedClip(item);
    
    try {
      const startTime = parseFloat(item["Start time"] || "0");
      const duration = parseFloat(item["Duration"] || "0");
      
      console.log(`Playing clip: "${item["Play Name"]}" at ${startTime}s for ${duration}s`);
      
      try {
        videoPlayerRef.current.pause();
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log("Error pausing before seek, continuing:", error);
      }
      
      try {
        console.log("Seeking to position:", startTime);
        await videoPlayerRef.current.seekToTime(startTime);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log("Current position after seek:", videoPlayerRef.current.getCurrentTime());
      } catch (error) {
        console.error("Error seeking to position:", error);
        toast.error("Failed to seek to clip position");
        setIsPlayingClip(false);
        return Promise.reject(error);
      }
      
      try {
        console.log("Seek completed, now playing video");
        await videoPlayerRef.current.play();
      } catch (error) {
        console.error("Error playing clip:", error);
        toast.error("Failed to play clip");
        setIsPlayingClip(false);
        return Promise.reject(error);
      }
      
      if (duration > 0) {
        setTimeout(() => {
          if (videoPlayerRef.current) {
            try {
              videoPlayerRef.current.pause();
              console.log("Clip playback completed");
            } catch (error) {
              console.error("Error pausing after clip completion:", error);
            } finally {
              setIsPlayingClip(false);
            }
          }
        }, duration * 1000);
      } else {
        setTimeout(() => {
          setIsPlayingClip(false);
        }, 3000);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in clip playback flow:", error);
      setIsPlayingClip(false);
      toast.error("Failed to play clip");
      return Promise.reject(error);
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
