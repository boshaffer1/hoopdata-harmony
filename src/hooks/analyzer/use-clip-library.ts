
import { useState } from "react";
import { GameData, SavedClip } from "@/types/analyzer";
import { toast } from "sonner";
import { 
  createSavedClipFromGameData, 
  exportVideoClip, 
  exportClipLibrary 
} from "@/utils/clipLibraryUtils";

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [playLabel, setPlayLabel] = useState("");

  const saveClipToLibrary = (clip: GameData) => {
    const savedClip = createSavedClipFromGameData(clip, playLabel);
    
    if (savedClip) {
      setSavedClips([...savedClips, savedClip]);
      setPlayLabel("");
      toast.success(`Saved clip: ${playLabel}`);
    }
  };
  
  const removeSavedClip = (id: string) => {
    setSavedClips(savedClips.filter(clip => clip.id !== id));
    toast.success("Clip removed from library");
  };
  
  const exportClip = async (clip: SavedClip | GameData) => {
    await exportVideoClip(clip, videoUrl);
  };
  
  const exportLibrary = () => {
    exportClipLibrary(savedClips);
  };

  return {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary
  };
};
