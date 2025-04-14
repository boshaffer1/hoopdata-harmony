import { useState, useEffect } from "react";
import { SavedClip, ClipFolder, Game, ExportOptions, GameSituation } from "@/types/analyzer";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

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
        createUnnamedClipsFolder();
      }

      const storedGames = localStorage.getItem("games");
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }

      const storedRegistry = localStorage.getItem("videoRegistry");
      if (storedRegistry) {
        setVideoRegistry(JSON.parse(storedRegistry));
      }
    } catch (error) {
      console.error("Error loading data from local storage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("savedClips", JSON.stringify(savedClips));
    } catch (error) {
      console.error("Error saving clips to local storage:", error);
    }
  }, [savedClips]);

  useEffect(() => {
    try {
      localStorage.setItem("clipFolders", JSON.stringify(folders));
    } catch (error) {
      console.error("Error saving folders to local storage:", error);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem("games", JSON.stringify(games));
    } catch (error) {
      console.error("Error saving games to local storage:", error);
    }
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem("videoRegistry", JSON.stringify(videoRegistry));
    } catch (error) {
      console.error("Error saving video registry to local storage:", error);
    }
  }, [videoRegistry]);

  useEffect(() => {
    if (videoUrl) {
      const existingVideo = videoRegistry.find(v => v.url === videoUrl);
      if (!existingVideo) {
        const name = videoUrl.split('/').pop() || 'Unnamed Video';
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

  const autoOrganizeByPlayName = () => {
    const clipsWithLabels = savedClips.filter(clip => 
      clip.label && clip.label !== "Unnamed Clip"
    );
    
    if (clipsWithLabels.length === 0) {
      toast.info("No named clips found to organize");
      return;
    }
    
    const playNames = new Set<string>();
    clipsWithLabels.forEach(clip => {
      if (clip.label && clip.label !== "Unnamed Clip") {
        playNames.add(clip.label);
      }
    });
    
    console.log(`Found ${playNames.size} unique play names to organize`);
    
    let playsFolder = folders.find(f => f.name === "Plays" && !f.parentId);
    if (!playsFolder) {
      playsFolder = createFolder("Plays", "Auto-organized play folders", { folderType: "plays" });
    }

    if (!playsFolder) {
      toast.error("Failed to create main Plays folder");
      return;
    }
    
    console.log(`Using plays folder: ${playsFolder.name} (${playsFolder.id})`);

    let foldersCreated = 0;
    let clipsMoved = 0;
    
    playNames.forEach(playName => {
      let playFolder = folders.find(f => 
        f.name === playName && f.parentId === playsFolder?.id
      );

      if (!playFolder) {
        playFolder = createFolder(playName, `Clips for the "${playName}" play`, {
          parentId: playsFolder.id,
          folderType: "plays"
        });
        
        if (playFolder) {
          foldersCreated++;
          console.log(`Created folder for play: ${playName}`);
        }
      }

      if (!playFolder) {
        console.error(`Failed to create/find folder for play: ${playName}`);
        return;
      }
      
      const clipsToMove = savedClips.filter(clip => 
        clip.label === playName && clip.folderId !== playFolder.id
      );
      
      console.log(`Found ${clipsToMove.length} clips with play name "${playName}" to move to folder ${playFolder.id}`);

      clipsToMove.forEach(clip => {
        moveClipToFolder(clip.id, playFolder.id);
        clipsMoved++;
      });
    });
    
    if (foldersCreated > 0 || clipsMoved > 0) {
      const message = `Auto-organization complete: Created ${foldersCreated} folders and moved ${clipsMoved} clips`;
      console.log(message);
      toast.success(message);
    } else {
      toast.info("No new folders needed or clips to move");
    }

    console.log("Starting game organization");
    
    return playsFolder.id;
  };

  const organizeByGames = () => {
    const videoUrls = new Set<string>();
    savedClips.forEach(clip => {
      if (clip.videoUrl) {
        videoUrls.add(clip.videoUrl);
      }
    });
    
    console.log(`Found ${videoUrls.size} unique videos to organize`);
    
    if (videoUrls.size === 0) {
      toast.info("No video information found to organize by game");
      return;
    }

    let gamesCreated = 0;
    let clipsMoved = 0;
    
    videoUrls.forEach(url => {
      const videoInfo = getVideoByUrl(url);
      if (!videoInfo) {
        console.log(`No video info found for URL: ${url}`);
        return;
      }

      let gamesFolder = folders.find(f => f.name === "Games" && !f.parentId);
      if (!gamesFolder) {
        gamesFolder = createFolder("Games", "Game footage and analysis", { folderType: "games" });
        if (gamesFolder) {
          console.log(`Created main Games folder: ${gamesFolder.id}`);
        }
      }
      if (!gamesFolder) {
        console.error("Failed to create main Games folder");
        return;
      }

      const gameName = videoInfo.name || "Unnamed Game";
      let gameFolder = folders.find(f => f.name === gameName && f.parentId === gamesFolder.id);
      if (!gameFolder) {
        gameFolder = createFolder(gameName, `Footage from ${gameName}`, {
          parentId: gamesFolder.id,
          folderType: "game"
        });
        if (gameFolder) {
          gamesCreated++;
          console.log(`Created game folder: ${gameName}`);
        }
      }
      if (!gameFolder) {
        console.error(`Failed to create game folder for: ${gameName}`);
        return;
      }

      let allClipsFolder = folders.find(f => f.name === "All Clips" && f.parentId === gameFolder.id);
      if (!allClipsFolder) {
        allClipsFolder = createFolder("All Clips", "All clips from this game", {
          parentId: gameFolder.id,
          folderType: "game-clips"
        });
        if (allClipsFolder) {
          console.log(`Created All Clips folder for game: ${gameName}`);
        }
      }

      let offenseFolder = folders.find(f => f.name === "Offense" && f.parentId === gameFolder.id);
      if (!offenseFolder) {
        offenseFolder = createFolder("Offense", "Offensive plays from this game", {
          parentId: gameFolder.id,
          folderType: "game-clips"
        });
        if (offenseFolder) {
          console.log(`Created Offense folder for game: ${gameName}`);
        }
      }

      let defenseFolder = folders.find(f => f.name === "Defense" && f.parentId === gameFolder.id);
      if (!defenseFolder) {
        defenseFolder = createFolder("Defense", "Defensive plays from this game", {
          parentId: gameFolder.id,
          folderType: "game-clips"
        });
        if (defenseFolder) {
          console.log(`Created Defense folder for game: ${gameName}`);
        }
      }

      const gameClips = savedClips.filter(clip => clip.videoUrl === url);
      console.log(`Found ${gameClips.length} clips for game: ${gameName}`);
      
      if (allClipsFolder) {
        gameClips.forEach(clip => {
          if (!isInPlayFolder) {
            moveClipToFolder(clip.id, allClipsFolder.id);
            clipsMoved++;
          }
        });
      }

      if (offenseFolder && defenseFolder) {
        gameClips.forEach(clip => {
          if (clip.situation === "offense" && offenseFolder) {
            const offenseClip = {...clip, id: uuidv4(), folderId: offenseFolder.id};
            setSavedClips(prev => [...prev, offenseClip]);
          } else if (clip.situation === "defense" && defenseFolder) {
            const defenseClip = {...clip, id: uuidv4(), folderId: defenseFolder.id};
            setSavedClips(prev => [...prev, defenseClip]);
          }
        });
      }
    });
    
    if (gamesCreated > 0 || clipsMoved > 0) {
      toast.success(`Game organization: Created ${gamesCreated} game folders and organized ${clipsMoved} clips`);
    }
  };

  const saveClipToLibrary = (clip: any, autoOrganize = false) => {
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    const playName = clip["Play Name"] || "";
    const isUnnamed = !playName || playName.trim() === "" || playName === "Unnamed Clip";
    
    try {
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
        videoUrl: videoUrl
      };

      setSavedClips(prevClips => [...prevClips, newClip]);
      
      if (isUnnamed) {
        createUnnamedClipsFolder();
      } else if (autoOrganize) {
        let playsFolder = folders.find(f => f.name === "Plays" && !f.parentId);
        if (!playsFolder) {
          playsFolder = createFolder("Plays", "Auto-organized play folders", { folderType: "plays" });
        }
        
        if (playsFolder) {
          let playFolder = folders.find(f => f.name === playName && f.parentId === playsFolder.id);
          
          if (!playFolder) {
            playFolder = createFolder(playName, `Clips for the "${playName}" play`, {
              parentId: playsFolder.id,
              folderType: "plays"
            });
          }
          
          if (playFolder) {
            setSavedClips(prevClips => 
              prevClips.map(clip => 
                clip.id === newClip.id ? { ...clip, folderId: playFolder?.id } : clip
              )
            );
            
            if (videoUrl) {
              organizeByGames();
            }
            
            toast.success(`Clip "${newClip.label}" saved to "${playName}" folder`);
          }
        }
      } else {
        toast.success(`Clip "${newClip.label}" saved to library`);
      }
      
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
    const clipJson = JSON.stringify(clip, null, 2);
    const blob = new Blob([clipJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clip.label.replace(/ /g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Clip "${clip.label}" exported`);
  };

  const exportLibrary = () => {
    const libraryJson = JSON.stringify(savedClips, null, 2);
    const blob = new Blob([libraryJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clip_library.json";
    document.body.appendChild(a);
    a.click();
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
          videoUrl: videoUrl
        };

        newClips.push(newClip);
        setSavedClips((prevClips) => [...prevClips, newClip]);
        
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
    setSavedClips((prevClips) =>
      prevClips.map((clip) =>
        clip.folderId === id ? { ...clip, folderId: undefined } : clip
      )
    );
    
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
    
    const clipsJson = JSON.stringify(clips, null, 2);
    const blob = new Blob([clipsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clips_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
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
        const newClips = importData.map((clipData: any) => {
          if (!clipData.id) {
            clipData.id = uuidv4();
          }
          return clipData;
        });
        
        setSavedClips(prev => [...prev, ...newClips]);
        return true;
      } else if (importData.clips || importData.folders || importData.games || importData.videoRegistry) {
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

  const getVideoByUrl = (url: string) => {
    return videoRegistry.find(v => v.url === url);
  };

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
    getVideosByFolder,
    autoOrganizeByPlayName,
    organizeByGames
  };
};
