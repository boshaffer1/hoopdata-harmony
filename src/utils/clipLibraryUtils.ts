
import { GameData, SavedClip, PlayerAction, GameSituation } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

export const createSavedClipFromGameData = (
  clip: GameData, 
  playLabel: string
): SavedClip | null => {
  if (!playLabel.trim()) {
    toast.error("Please enter a play label");
    return null;
  }
  
  const startTime = parseFloat(clip["Start time"] || "0");
  const duration = parseFloat(clip["Duration"] || "0");
  
  let players: PlayerAction[] = [];
  try {
    if (clip.Players) {
      players = JSON.parse(clip.Players as string);
    }
  } catch (error) {
    console.error("Error parsing player data:", error);
  }
  
  let situation: GameSituation | undefined;
  if (clip.Situation) {
    situation = clip.Situation as GameSituation;
  }
  
  return {
    id: Date.now().toString(),
    startTime,
    duration,
    label: playLabel,
    notes: clip.Notes as string || "",
    timeline: clip.Timeline as string || "",
    saved: new Date().toISOString(),
    players,
    situation
  };
};

export const exportVideoClip = async (
  clip: SavedClip | GameData,
  videoUrl: string | undefined
): Promise<void> => {
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
    startTime = parseFloat(clip["Start time"] as string || "0");
    duration = parseFloat(clip["Duration"] as string || "0");
    label = clip.Notes as string || "clip";
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

export const exportClipLibrary = (savedClips: SavedClip[]): void => {
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
