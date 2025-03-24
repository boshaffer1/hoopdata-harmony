
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
        // First pause the video to stabilize the player
        videoPlayerRef.current.pause();
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log("Error pausing before seek, continuing:", error);
      }
      
      // Perform the seek with multiple retries if needed
      let seekError = null;
      let seekSuccess = false;
      
      // Try up to 3 times to seek
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Seek attempt ${attempt}: To position ${startTime}s`);
          await videoPlayerRef.current.seekToTime(startTime);
          
          // Wait for seek to take effect
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Verify the seek worked
          const actualTime = videoPlayerRef.current.getCurrentTime();
          console.log(`Current position after seek: ${actualTime}s`);
          
          // Check if seek was successful (within 2 seconds of target)
          if (Math.abs(actualTime - startTime) <= 2) {
            seekSuccess = true;
            break;
          } else {
            console.warn(`Seek verification failed. Expected: ${startTime}, Got: ${actualTime}`);
            // Try a different approach on subsequent attempts
            if (attempt === 2) {
              // Force a direct set on the video element
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
          }
        } catch (error) {
          console.error(`Seek attempt ${attempt} failed:`, error);
          seekError = error;
          await new Promise(resolve => setTimeout(resolve, 200 * attempt)); // Increasing delay between retries
        }
      }
      
      if (!seekSuccess) {
        if (seekError) {
          throw seekError;
        } else {
          throw new Error("Failed to seek to the correct position after multiple attempts");
        }
      }
      
      // Now play the video
      try {
        console.log("Seek completed, now playing video");
        await videoPlayerRef.current.play();
      } catch (error) {
        console.error("Error playing clip:", error);
        toast.error("Failed to play clip");
        setIsPlayingClip(false);
        return Promise.reject(error);
      }
      
      // Set a timeout to pause after the clip duration
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
        // If no duration specified, just clear the playing state after a few seconds
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
