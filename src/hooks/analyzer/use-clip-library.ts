import { useState, useEffect } from "react";
import { GameData, SavedClip, PlayerAction, GameSituation, ClipFolder } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

const CLIPS_STORAGE_KEY = 'savedClips';
const FOLDERS_STORAGE_KEY = 'clipFolders';

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [playLabel, setPlayLabel] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [storageInitialized, setStorageInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedClipsData = localStorage.getItem(CLIPS_STORAGE_KEY);
      if (savedClipsData) {
        const parsedClips = JSON.parse(savedClipsData);
        if (Array.isArray(parsedClips)) {
          setSavedClips(parsedClips);
        } else {
          console.error('Invalid clip data format in localStorage');
          localStorage.removeItem(CLIPS_STORAGE_KEY);
        }
      }
      
      const foldersData = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (foldersData) {
        const parsedFolders = JSON.parse(foldersData);
        if (Array.isArray(parsedFolders)) {
          setFolders(parsedFolders);
        } else {
          console.error('Invalid folder data format in localStorage');
          localStorage.removeItem(FOLDERS_STORAGE_KEY);
        }
      }
      
      setStorageInitialized(true);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setSavedClips([]);
      setFolders([]);
      setStorageInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (storageInitialized) {
      try {
        localStorage.setItem(CLIPS_STORAGE_KEY, JSON.stringify(savedClips));
      } catch (error) {
        console.error('Error saving clips to localStorage:', error);
        toast.error("Failed to save clips to local storage");
      }
    }
  }, [savedClips, storageInitialized]);
  
  useEffect(() => {
    if (storageInitialized) {
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      } catch (error) {
        console.error('Error saving folders to localStorage:', error);
        toast.error("Failed to save folders to local storage");
      }
    }
  }, [folders, storageInitialized]);

  const saveClipToLibrary = (clip: GameData, folderId?: string) => {
    if (!playLabel.trim()) {
      toast.error("Please enter a play label");
      return;
    }
    
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    
    let players: PlayerAction[] = [];
    try {
      if (clip.Players && clip.Players !== "[]") {
        players = JSON.parse(clip.Players);
      }
    } catch (error) {
      console.error("Error parsing player data:", error);
    }
    
    let situation: GameSituation = clip.Situation || "other";
    
    const savedClip: SavedClip = {
      id: Date.now().toString(),
      startTime,
      duration,
      label: playLabel,
      notes: clip.Notes || "",
      timeline: clip.Timeline || "",
      saved: new Date().toISOString(),
      players,
      situation,
      folderId: folderId || activeFolder || undefined
    };
    
    setSavedClips(prevClips => {
      const clipExists = prevClips.some(existingClip => 
        Math.abs(existingClip.startTime - startTime) < 0.1 && 
        existingClip.label === playLabel
      );
      
      if (clipExists) {
        toast.info(`Clip updated: ${playLabel}`);
        return prevClips.map(existingClip => 
          Math.abs(existingClip.startTime - startTime) < 0.1 && 
          existingClip.label === playLabel ? savedClip : existingClip
        );
      } else {
        toast.success(`Saved clip: ${playLabel}`);
        return [...prevClips, savedClip];
      }
    });
    
    setPlayLabel("");
    return savedClip;
  };
  
  const saveClipsFromData = (data: GameData[]) => {
    if (!data || data.length === 0) return [];
    
    console.log("Creating clips from", data.length, "plays");
    const newClips: SavedClip[] = [];
    
    data.forEach(item => {
      const startTime = parseFloat(item["Start time"] || "0");
      const duration = parseFloat(item["Duration"] || "0");
      
      if (isNaN(startTime)) {
        console.warn("Skipping clip with invalid start time:", item);
        return;
      }
      
      let players: PlayerAction[] = [];
      try {
        if (item.Players && item.Players !== "[]") {
          players = JSON.parse(item.Players);
        }
      } catch (error) {
        console.error("Error parsing player data:", error);
      }
      
      let label = item["Play Name"] || "";
      if (!label && item["Notes"]) {
        label = item["Notes"];
      }
      if (!label) {
        label = `Clip at ${startTime.toFixed(1)}s`;
      }
      
      const newClip: SavedClip = {
        id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        startTime,
        duration,
        label,
        notes: item.Notes || "",
        timeline: item.Timeline || "",
        saved: new Date().toISOString(),
        players,
        situation: item.Situation || "other"
      };
      
      newClips.push(newClip);
    });
    
    setSavedClips(prev => {
      const filteredNewClips = newClips.filter(newClip => 
        !prev.some(existingClip => 
          Math.abs(existingClip.startTime - newClip.startTime) < 0.1 && 
          existingClip.label === newClip.label
        )
      );
      
      console.log("Adding", filteredNewClips.length, "unique clips to library");
      return [...prev, ...filteredNewClips];
    });
    
    return newClips;
  };
  
  const removeSavedClip = (id: string) => {
    setSavedClips(savedClips.filter(clip => clip.id !== id));
    toast.success("Clip removed from library");
  };
  
  const exportClip = async (clip: SavedClip | GameData) => {
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
      startTime = parseFloat(clip["Start time"] || "0");
      duration = parseFloat(clip["Duration"] || "0");
      label = clip["Play Name"] || "clip";
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
  
  const exportLibrary = () => {
    if (savedClips.length === 0) {
      toast.error("No clips in library to export");
      return;
    }
    
    const exportData = {
      clips: savedClips,
      folders: folders,
      exportedAt: new Date().toISOString(),
      totalClips: savedClips.length
    };
    
    downloadJSON(exportData, "clip-library.json");
    toast.success(`Clip library exported (${savedClips.length} clips)`);
  };

  const createFolder = (name: string, description: string = "") => {
    if (!name.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    if (folders.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A folder with this name already exists");
      return;
    }
    
    const newFolder: ClipFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    toast.success(`Created folder: ${name}`);
    return newFolder;
  };
  
  const updateFolder = (id: string, updates: Partial<ClipFolder>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id 
        ? { 
            ...folder, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : folder
    ));
    toast.success("Folder updated");
  };
  
  const deleteFolder = (id: string) => {
    setSavedClips(prev => prev.map(clip => 
      clip.folderId === id 
        ? { ...clip, folderId: undefined } 
        : clip
    ));
    
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    if (activeFolder === id) {
      setActiveFolder(null);
    }
    
    toast.success("Folder deleted");
  };
  
  const moveClipToFolder = (clipId: string, folderId: string | null) => {
    setSavedClips(prev => prev.map(clip => 
      clip.id === clipId 
        ? { ...clip, folderId: folderId || undefined } 
        : clip
    ));
    toast.success("Clip moved to folder");
  };
  
  const getClipsByFolder = (folderId: string | null) => {
    if (!folderId) {
      return savedClips;
    }
    return savedClips.filter(clip => clip.folderId === folderId);
  };

  const importLibrary = (data: any) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid import data format");
      }
      
      if (!Array.isArray(data.clips)) {
        throw new Error("Invalid clips format in import data");
      }
      
      if (!Array.isArray(data.folders)) {
        throw new Error("Invalid folders format in import data");
      }
      
      setSavedClips(prev => {
        const existingIds = new Set(prev.map(clip => clip.id));
        const newClips = data.clips.filter((clip: SavedClip) => !existingIds.has(clip.id));
        
        if (newClips.length === 0) {
          toast.info("No new clips found in import");
          return prev;
        }
        
        toast.success(`Imported ${newClips.length} new clips`);
        return [...prev, ...newClips];
      });
      
      setFolders(prev => {
        const existingIds = new Set(prev.map(folder => folder.id));
        const newFolders = data.folders.filter((folder: ClipFolder) => !existingIds.has(folder.id));
        
        if (newFolders.length > 0) {
          toast.success(`Imported ${newFolders.length} new folders`);
        }
        
        return [...prev, ...newFolders];
      });
      
      return true;
    } catch (error) {
      console.error("Error importing library:", error);
      toast.error("Failed to import library: Invalid format");
      return false;
    }
  };

  const getStorageInfo = () => {
    try {
      const clipsSize = new Blob([JSON.stringify(savedClips)]).size;
      const foldersSize = new Blob([JSON.stringify(folders)]).size;
      const totalSize = clipsSize + foldersSize;
      
      return {
        clipsCount: savedClips.length,
        foldersCount: folders.length,
        totalSizeBytes: totalSize,
        totalSizeKB: Math.round(totalSize / 1024),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error("Error calculating storage size:", error);
      return null;
    }
  };

  return {
    savedClips,
    folders,
    playLabel,
    activeFolder,
    setPlayLabel,
    setActiveFolder,
    saveClipToLibrary,
    saveClipsFromData,
    removeSavedClip,
    exportClip,
    exportLibrary,
    importLibrary,
    createFolder,
    updateFolder,
    deleteFolder,
    moveClipToFolder,
    getClipsByFolder,
    getStorageInfo
  };
};
