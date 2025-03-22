
import { useState, useEffect } from "react";
import { GameData, SavedClip } from "@/types/analyzer";
import { useClipSave } from "./use-clip-save";
import { useClipExport } from "./use-clip-export";
import { useDemoClips } from "./use-demo-clips";
import { toast } from "sonner";

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  
  const { playLabel, setPlayLabel, saveClipToLibrary, saveClipsFromData } = useClipSave();
  const { exportClip, exportLibrary } = useClipExport(videoUrl);
  const { addDemoClips } = useDemoClips();

  useEffect(() => {
    console.log("Clip library currently has", savedClips.length, "clips");
  }, [savedClips]);
  
  // Initialize with demo clips when empty
  useEffect(() => {
    addDemoClipsIfNeeded();
  }, []);
  
  const saveClipToLibraryHandler = (clip: GameData) => {
    const savedClip = saveClipToLibrary(clip, playLabel, savedClips, setSavedClips);
    setPlayLabel("");
    return savedClip;
  };
  
  const saveClipsFromDataHandler = (data: GameData[]) => {
    return saveClipsFromData(data, savedClips, setSavedClips);
  };
  
  const removeSavedClip = (id: string) => {
    setSavedClips(savedClips.filter(clip => clip.id !== id));
    toast.success("Clip removed from library");
  };
  
  const exportClipHandler = (clip: SavedClip | GameData) => {
    return exportClip(clip);
  };
  
  const exportLibraryHandler = () => {
    exportLibrary(savedClips);
  };
  
  const addDemoClipsIfNeeded = () => {
    return addDemoClips(savedClips, setSavedClips);
  };

  return {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary: saveClipToLibraryHandler,
    saveClipsFromData: saveClipsFromDataHandler,
    removeSavedClip,
    exportClip: exportClipHandler,
    exportLibrary: exportLibraryHandler,
    addDemoClips: addDemoClipsIfNeeded
  };
};
