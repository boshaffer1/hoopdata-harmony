
import { useState, useEffect } from "react";
import { SavedClip, ClipFolder, Game, ExportOptions } from "@/types/analyzer";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Define a type for storing video metadata
interface VideoMetadata {
  url: string;
  name: string;
  timestamp: number;
  duration?: number;
  thumbnailUrl?: string;
}

export const useClipLibrary = (videoUrl?: string) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [playLabel, setPlayLabel] = useState("");
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [videoRegistry, setVideoRegistry] = useState<VideoMetadata[]>([]);
  const DEFAULT_UNNAMED_FOLDER_ID = "unnamed-clips-folder";

  // Load saved clips and folders from local storage
  useEffect(() => {
    try {
      const storedClips = localStorage.getItem("savedClips");
      if (storedClips) {
        setSavedClips(JSON.parse(storedClips));
      }

      const storedFolders = localStorage.getItem("clipFolders");
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      } else {
        // Create default "Unnamed Clips" folder if it doesn't exist
        createUnnamedClipsFolder();
      }

      const storedGames = localStorage.getItem("games");
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }

      // Load video registry
      const storedRegistry = localStorage.getItem("videoRegistry");
      if (storedRegistry) {
        setVideoRegistry(JSON.parse(storedRegistry));
      }
    } catch (error) {
      console.error("Error loading data from local storage:", error);
    }
  }, []);

  // Save clips to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("savedClips", JSON.stringify(savedClips));
    } catch (error) {
      console.error("Error saving clips to local storage:", error);
    }
  }, [savedClips]);

  // Save folders to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("clipFolders", JSON.stringify(folders));
    } catch (error) {
      console.error("Error saving folders to local storage:", error);
    }
  }, [folders]);

  // Save games to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("games", JSON.stringify(games));
    } catch (error) {
      console.error("Error saving games to local storage:", error);
    }
  }, [games]);

  // Save video registry to local storage
  useEffect(() => {
    try {
      localStorage.setItem("videoRegistry", JSON.stringify(videoRegistry));
    } catch (error) {
      console.error("Error saving video registry to local storage:", error);
    }
  }, [videoRegistry]);

  // Register the current video if it exists and is not already registered
  useEffect(() => {
    if (videoUrl) {
      const existingVideo = videoRegistry.find(v => v.url === videoUrl);
      if (!existingVideo) {
        // Extract video name from URL if possible
        const name = videoUrl.split('/').pop() || 'Unnamed Video';
        
        // Add to video registry
        const newVideo: VideoMetadata = {
          url: videoUrl,
          name,
          timestamp: Date.now()
        };
        
        setVideoRegistry(prev => [newVideo, ...prev]);
        console.log("Added new video to registry:", name);
      }
    }
  }, [videoUrl, videoRegistry]);

  // Ensure the "Unnamed Clips" folder exists
  const createUnnamedClipsFolder = () => {
    const unnamedFolder: ClipFolder = {
      id: DEFAULT_UNNAMED_FOLDER_ID,
      name: "Unnamed Clips",
      description: "Automatically generated folder for clips without names",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderType: "other"
    };
    
    setFolders(prev => {
      const folderExists = prev.some(folder => folder.id === DEFAULT_UNNAMED_FOLDER_ID);
      if (folderExists) {
        return prev;
      }
      return [...prev, unnamedFolder];
    });
    
    return unnamedFolder;
  };

  const saveClipToLibrary = (clip: any) => {
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    const playName = clip["Play Name"] || "";
    const isUnnamed = !playName || playName.trim() === "" || playName === "Unnamed Clip";
    
    try {
      // Parse players if available
      let parsedPlayers = [];
      try {
        if (clip.Players && clip.Players !== "[]") {
          parsedPlayers = JSON.parse(clip.Players);
        }
      } catch (e) {
        console.error("Error parsing players:", e);
      }

      const newClip: SavedClip = {
        id: uuidv4(),
        startTime,
        duration,
        label: isUnnamed ? "Unnamed Clip" : playName,
        notes: clip.Notes || "",
        timeline: clip.Timeline || "",
        saved: new Date().toISOString(),
        players: parsedPlayers,
        situation: clip.Situation || "other",
        folderId: isUnnamed ? DEFAULT_UNNAMED_FOLDER_ID : undefined,
        videoUrl: videoUrl // Store the current video URL with the clip
      };

      setSavedClips(prevClips => [...prevClips, newClip]);
      
      // Ensure the unnamed clips folder exists
      if (isUnnamed) {
        createUnnamedClipsFolder();
      }
      
      toast.success(`Clip "${newClip.label}" saved to library${isUnnamed ? ' (in Unnamed Clips folder)' : ''}`);
      setPlayLabel("");
      return newClip;
    } catch (error) {
      console.error("Error saving clip:", error);
      toast.error("Failed to save clip");
      return null;
    }
  };

  const removeSavedClip = (id: string) => {
    setSavedClips((prevClips) => prevClips.filter((clip) => clip.id !== id));
    toast.success("Clip removed from library");
  };

  const exportClip = (clip: SavedClip) => {
    // Convert clip data to JSON format
    const clipJson = JSON.stringify(clip, null, 2);

    // Create a Blob from the JSON data
    const blob = new Blob([clipJson], { type: "application/json" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clip.label.replace(/ /g, "_")}.json`; // Replace spaces with underscores for filename
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Clip "${clip.label}" exported`);
  };

  const exportLibrary = () => {
    // Convert the entire library data to JSON format
    const libraryJson = JSON.stringify(savedClips, null, 2);

    // Create a Blob from the JSON data
    const blob = new Blob([libraryJson], { type: "application/json" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clip_library.json";
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Clip library exported");
  };

  const saveClipsFromData = (plays: any[]): SavedClip[] => {
    const newClips: SavedClip[] = [];

    plays.forEach((clip) => {
      const startTime = parseFloat(clip["Start time"] || "0");
      const duration = parseFloat(clip["Duration"] || "0");
      const playName = clip["Play Name"] || "";
      const isUnnamed = !playName || playName.trim() === "" || playName === "Unnamed Clip";

      try {
        // Parse players if available
        let parsedPlayers = [];
        try {
          if (clip.Players && clip.Players !== "[]") {
            parsedPlayers = JSON.parse(clip.Players);
          }
        } catch (e) {
          console.error("Error parsing players:", e);
        }

        const newClip: SavedClip = {
          id: uuidv4(),
          startTime,
          duration,
          label: isUnnamed ? "Unnamed Clip" : playName,
          notes: clip.Notes || "",
          timeline: clip.Timeline || "",
          saved: new Date().toISOString(),
          players: parsedPlayers,
          situation: clip.Situation || "other",
          folderId: isUnnamed ? DEFAULT_UNNAMED_FOLDER_ID : undefined,
          videoUrl: videoUrl // Store the current video URL with the clip
        };

        newClips.push(newClip);
        setSavedClips((prevClips) => [...prevClips, newClip]);
        
        // Ensure the unnamed clips folder exists
        if (isUnnamed) {
          createUnnamedClipsFolder();
        }
      } catch (error) {
        console.error("Error saving clip:", error);
        toast.error("Failed to save clip");
      }
    });

    return newClips;
  };

  const createFolder = (name: string, description: string, options?: Partial<ClipFolder>) => {
    const newFolder: ClipFolder = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderType: options?.folderType || "other",
      parentId: options?.parentId,
      teamId: options?.teamId
    };

    setFolders((prevFolders) => [...prevFolders, newFolder]);
    toast.success(`Folder "${name}" created`);
    return newFolder;
  };

  const createTeamFolder = (name: string, description: string) => {
    const teamFolder = createFolder(name, description, { folderType: "team" });
    return teamFolder;
  };

  const updateFolder = (id: string, updates: Partial<ClipFolder>) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) => 
        folder.id === id 
          ? { ...folder, ...updates, updatedAt: new Date().toISOString() } 
          : folder
      )
    );
    toast.success("Folder updated");
  };

  const deleteFolder = (id: string) => {
    // Move all clips in this folder back to no folder
    setSavedClips((prevClips) =>
      prevClips.map((clip) =>
        clip.folderId === id ? { ...clip, folderId: undefined } : clip
      )
    );
    
    // Remove the folder
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
    toast.success("Folder deleted");
  };

  const moveClipToFolder = (clipId: string, folderId: string | null) => {
    setSavedClips((prevClips) =>
      prevClips.map((clip) =>
        clip.id === clipId ? { ...clip, folderId: folderId } : clip
      )
    );

    const folder = folders.find(f => f.id === folderId);
    toast.success(`Clip moved to ${folder ? folder.name : 'root'}`);
  };

  const bulkMoveClips = (clipIds: string[], targetFolderId: string | null) => {
    setSavedClips((prevClips) =>
      prevClips.map((clip) =>
        clipIds.includes(clip.id) ? { ...clip, folderId: targetFolderId } : clip
      )
    );
    
    const folder = folders.find(f => f.id === targetFolderId);
    toast.success(`Moved ${clipIds.length} clips to ${folder ? folder.name : 'root folder'}`);
  };

  const getClipsByFolder = (folderId: string | null) => {
    return savedClips.filter(clip => clip.folderId === folderId);
  };

  const getTeamFolders = () => {
    return folders.filter(folder => folder.folderType === "team");
  };

  const bulkExportClips = (clips: SavedClip[], options?: ExportOptions) => {
    if (clips.length === 0) return;
    
    // For now, just export as JSON
    const clipsJson = JSON.stringify(clips, null, 2);
    
    // Create a Blob from the JSON data
    const blob = new Blob([clipsJson], { type: "application/json" });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clips_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up by removing the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addGame = (gameData: any) => {
    const newGame: Game = {
      id: uuidv4(),
      title: gameData.title,
      date: gameData.date,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      videoUrl: gameData.videoUrl,
      dataUrl: gameData.dataUrl,
      teamId: gameData.teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGames((prevGames) => [...prevGames, newGame]);
    toast.success(`Game "${newGame.title}" created`);
    return newGame;
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prevGames) =>
      prevGames.map((game) => (game.id === id ? { ...game, ...updates, updatedAt: new Date().toISOString() } : game))
    );
    toast.success(`Game updated`);
  };

  const deleteGame = (id: string) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== id));
    toast.success("Game deleted");
  };

  const getStorageInfo = () => {
    try {
      const clipsSize = new Blob([JSON.stringify(savedClips)]).size;
      const foldersSize = new Blob([JSON.stringify(folders)]).size;
      const gamesSize = new Blob([JSON.stringify(games)]).size;
      const registrySize = new Blob([JSON.stringify(videoRegistry)]).size;
      
      const totalSizeBytes = clipsSize + foldersSize + gamesSize + registrySize;
      const totalSizeKB = Math.round(totalSizeBytes / 1024);
      
      return {
        clipsSize,
        foldersSize,
        gamesSize,
        registrySize,
        totalSizeBytes,
        totalSizeKB
      };
    } catch (error) {
      console.error("Error calculating storage info:", error);
      return null;
    }
  };

  const importLibrary = (importData: any) => {
    try {
      if (Array.isArray(importData)) {
        // Import clips
        const newClips = importData.map((clipData: any) => {
          // Ensure each clip has an id
          if (!clipData.id) {
            clipData.id = uuidv4();
          }
          return clipData;
        });
        
        setSavedClips(prev => [...prev, ...newClips]);
        return true;
      } else if (importData.clips || importData.folders || importData.games || importData.videoRegistry) {
        // Import structured data
        if (importData.clips && Array.isArray(importData.clips)) {
          setSavedClips(prev => [...prev, ...importData.clips]);
        }
        
        if (importData.folders && Array.isArray(importData.folders)) {
          setFolders(prev => [...prev, ...importData.folders]);
        }
        
        if (importData.games && Array.isArray(importData.games)) {
          setGames(prev => [...prev, ...importData.games]);
        }
        
        if (importData.videoRegistry && Array.isArray(importData.videoRegistry)) {
          setVideoRegistry(prev => [...prev, ...importData.videoRegistry]);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error importing library:", error);
      return false;
    }
  };

  // Function to get a video by URL
  const getVideoByUrl = (url: string) => {
    return videoRegistry.find(v => v.url === url);
  };

  // Get all available videos for a specific folder
  const getVideosByFolder = (folderId: string | null) => {
    const clips = getClipsByFolder(folderId);
    const uniqueVideoUrls = [...new Set(clips.map(clip => clip.videoUrl).filter(Boolean))];
    return uniqueVideoUrls.map(url => getVideoByUrl(url as string)).filter(Boolean);
  };

  return {
    savedClips,
    playLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    saveClipsFromData,
    folders,
    createFolder,
    createTeamFolder,
    updateFolder,
    deleteFolder,
    moveClipToFolder,
    bulkMoveClips,
    getClipsByFolder,
    getTeamFolders,
    bulkExportClips,
    games,
    addGame,
    updateGame,
    deleteGame,
    getStorageInfo,
    importLibrary,
    activeFolder,
    setActiveFolder,
    videoRegistry,
    getVideoByUrl,
    getVideosByFolder
  };
};
