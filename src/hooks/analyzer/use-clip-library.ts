import { useState, useEffect } from "react";
import { GameData, SavedClip, PlayerAction, GameSituation, ClipFolder, Game, TeamRoster, ClipType } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

const CLIPS_STORAGE_KEY = 'savedClips';
const FOLDERS_STORAGE_KEY = 'clipFolders';
const GAMES_STORAGE_KEY = 'savedGames';

export const useClipLibrary = (videoUrl: string | undefined) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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
      
      const gamesData = localStorage.getItem(GAMES_STORAGE_KEY);
      if (gamesData) {
        const parsedGames = JSON.parse(gamesData);
        if (Array.isArray(parsedGames)) {
          setGames(parsedGames);
        }
      }
      
      setStorageInitialized(true);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setSavedClips([]);
      setFolders([]);
      setGames([]);
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
  
  useEffect(() => {
    if (storageInitialized) {
      try {
        localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
      } catch (error) {
        console.error('Error saving games to localStorage:', error);
        toast.error("Failed to save games to local storage");
      }
    }
  }, [games, storageInitialized]);

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
    
    let teamFolders = folders.filter(f => f.folderType === "team");
    let defaultTeamFolder: ClipFolder | undefined;
    
    if (teamFolders.length === 0) {
      defaultTeamFolder = createTeamFolder("My Team", "Default team created during import");
      teamFolders = [defaultTeamFolder];
    } else {
      defaultTeamFolder = teamFolders[0];
    }
    
    let playsFolder = folders.find(f => 
      f.parentId === defaultTeamFolder?.id && 
      f.folderType === "plays"
    );
    
    let gamesFolder = folders.find(f => 
      f.parentId === defaultTeamFolder?.id && 
      f.folderType === "games"
    );
    
    if (!playsFolder && defaultTeamFolder) {
      playsFolder = createFolder("Plays", "Team plays and possessions", { 
        parentId: defaultTeamFolder.id, 
        folderType: "plays",
        teamId: defaultTeamFolder.id 
      });
    }
    
    if (!gamesFolder && defaultTeamFolder) {
      gamesFolder = createFolder("Games", "Full game recordings", { 
        parentId: defaultTeamFolder.id, 
        folderType: "games",
        teamId: defaultTeamFolder.id 
      });
    }
    
    const clipsByName: Record<string, GameData[]> = {};
    
    data.forEach(item => {
      const playName = item["Play Name"] || "";
      if (!playName || playName === "clip" || playName.length < 3) return;
      
      if (!clipsByName[playName]) {
        clipsByName[playName] = [];
      }
      clipsByName[playName].push(item);
    });
    
    const playSubfolders: Record<string, ClipFolder> = {};
    
    Object.entries(clipsByName).forEach(([name, clips]) => {
      if (clips.length > 0 && playsFolder) {
        const playSubfolder = createFolder(name, `Clips for ${name}`, {
          parentId: playsFolder.id,
          folderType: "other",
          teamId: defaultTeamFolder?.id
        });
        
        if (playSubfolder) {
          playSubfolders[name] = playSubfolder;
        }
      }
    });
    
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
      
      const clipType = duration > 60 ? "full_game" : "play";
      
      let clipFolderId = undefined;
      let teamId = undefined;
      
      if (defaultTeamFolder) {
        teamId = defaultTeamFolder.id;
        
        if (clipType === "full_game" && gamesFolder) {
          clipFolderId = gamesFolder.id;
        } else if (playSubfolders[label]) {
          clipFolderId = playSubfolders[label].id;
        } else if (playsFolder) {
          const newPlayFolder = createFolder(label, `Clips for ${label}`, {
            parentId: playsFolder.id,
            folderType: "other",
            teamId: defaultTeamFolder.id
          });
          
          if (newPlayFolder) {
            playSubfolders[label] = newPlayFolder;
            clipFolderId = newPlayFolder.id;
          } else {
            clipFolderId = playsFolder.id;
          }
        }
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
        situation: item.Situation || "other",
        folderId: clipFolderId,
        teamId,
        clipType
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

  const createFolder = (name: string, description: string = "", options: { parentId?: string, folderType?: "team" | "plays" | "games" | "other", teamId?: string } = {}) => {
    if (!name.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    const sameLevel = folders.filter(f => f.parentId === options.parentId);
    if (sameLevel.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A folder with this name already exists at this level");
      return;
    }
    
    const newFolder: ClipFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...options
    };
    
    setFolders(prev => [...prev, newFolder]);
    toast.success(`Created folder: ${name}`);
    return newFolder;
  };
  
  const createTeamFolder = (teamName: string, description: string = "") => {
    const teamFolder = createFolder(teamName, description, { folderType: "team" });
    
    if (teamFolder) {
      createFolder("Plays", "Team plays and possessions", { 
        parentId: teamFolder.id, 
        folderType: "plays",
        teamId: teamFolder.id 
      });
      
      createFolder("Games", "Full game recordings", { 
        parentId: teamFolder.id, 
        folderType: "games",
        teamId: teamFolder.id 
      });
    }
    
    return teamFolder;
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
    const getSubfolderIds = (folderId: string): string[] => {
      const directSubfolders = folders.filter(f => f.parentId === folderId);
      let allSubfolderIds = directSubfolders.map(f => f.id);
      
      directSubfolders.forEach(subfolder => {
        allSubfolderIds = [...allSubfolderIds, ...getSubfolderIds(subfolder.id)];
      });
      
      return allSubfolderIds;
    };
    
    const subfolderIds = getSubfolderIds(id);
    const allFolderIds = [id, ...subfolderIds];
    
    setSavedClips(prev => prev.map(clip => 
      allFolderIds.includes(clip.folderId || '')
        ? { ...clip, folderId: undefined } 
        : clip
    ));
    
    setFolders(prev => prev.filter(folder => !allFolderIds.includes(folder.id)));
    
    if (activeFolder === id || allFolderIds.includes(activeFolder || '')) {
      setActiveFolder(null);
    }
    
    toast.success("Folder and subfolders deleted");
  };
  
  const moveClipToFolder = (clipId: string, folderId: string | null, teamId?: string) => {
    setSavedClips(prev => prev.map(clip => 
      clip.id === clipId 
        ? { ...clip, folderId, teamId } 
        : clip
    ));
    toast.success("Clip moved to folder");
  };
  
  const getClipsByFolder = (folderId: string | null, includeSubfolders: boolean = false) => {
    if (!folderId) {
      return savedClips;
    }
    
    if (!includeSubfolders) {
      return savedClips.filter(clip => clip.folderId === folderId);
    }
    
    const getSubfolderIds = (parentId: string): string[] => {
      const directSubfolders = folders.filter(f => f.parentId === parentId);
      let allSubfolderIds = directSubfolders.map(f => f.id);
      
      directSubfolders.forEach(subfolder => {
        allSubfolderIds = [...allSubfolderIds, ...getSubfolderIds(subfolder.id)];
      });
      
      return allSubfolderIds;
    };
    
    const allFolderIds = [folderId, ...getSubfolderIds(folderId)];
    return savedClips.filter(clip => clip.folderId && allFolderIds.includes(clip.folderId));
  };
  
  const getClipsByTeam = (teamId: string) => {
    return savedClips.filter(clip => clip.teamId === teamId);
  };
  
  const addGame = (gameData: Omit<Game, "id" | "createdAt" | "updatedAt">) => {
    const newGame: Game = {
      ...gameData,
      id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setGames(prev => [...prev, newGame]);
    toast.success(`Added game: ${newGame.title}`);
    return newGame;
  };
  
  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(game => 
      game.id === id 
        ? { ...game, ...updates, updatedAt: new Date().toISOString() } 
        : game
    ));
    toast.success("Game updated");
  };
  
  const deleteGame = (id: string) => {
    setGames(prev => prev.filter(game => game.id !== id));
    
    setSavedClips(prev => prev.filter(clip => clip.gameId !== id));
    
    toast.success("Game deleted");
  };
  
  const getFolderHierarchy = () => {
    const folderMap = new Map<string | undefined, ClipFolder[]>();
    
    folders.forEach(folder => {
      const parent = folder.parentId;
      if (!folderMap.has(parent)) {
        folderMap.set(parent, []);
      }
      folderMap.get(parent)?.push(folder);
    });
    
    const rootFolders = folderMap.get(undefined) || [];
    
    const buildTree = (parentId: string | undefined): ClipFolder[] => {
      const children = folderMap.get(parentId) || [];
      return children.map(folder => ({
        ...folder,
        children: buildTree(folder.id)
      })) as ClipFolder[];
    };
    
    return buildTree(undefined);
  };
  
  const getTeamFolders = () => {
    return folders.filter(folder => folder.folderType === "team");
  };
  
  const getStorageInfo = () => {
    try {
      const clipsSize = new Blob([JSON.stringify(savedClips)]).size;
      const foldersSize = new Blob([JSON.stringify(folders)]).size;
      const gamesSize = new Blob([JSON.stringify(games)]).size;
      const totalSize = clipsSize + foldersSize + gamesSize;
      
      return {
        clipsCount: savedClips.length,
        foldersCount: folders.length,
        gamesCount: games.length,
        totalSizeBytes: totalSize,
        totalSizeKB: Math.round(totalSize / 1024),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error("Error calculating storage size:", error);
      return null;
    }
  };

  const autoOrganizeClips = () => {
    try {
      toast.info("Starting to organize clips...");
      
      // Create a "My Library" folder if it doesn't exist
      let myLibraryFolder = folders.find(f => f.name === "My Library");
      
      if (!myLibraryFolder) {
        myLibraryFolder = createFolder("My Library", "Default library folder");
        if (!myLibraryFolder) {
          toast.error("Failed to create My Library folder");
          return;
        }
      }
      
      // Find or create team folder
      let teamFolder = folders.find(f => f.folderType === "team");
      
      if (!teamFolder) {
        teamFolder = createTeamFolder("My Team", "Default team");
        if (!teamFolder) {
          toast.error("Failed to create team folder");
          return;
        }
      }
      
      // Find or create plays and games folders
      let playsFolder = folders.find(f => 
        f.parentId === teamFolder.id && 
        f.folderType === "plays"
      );
      
      let gamesFolder = folders.find(f => 
        f.parentId === teamFolder.id && 
        f.folderType === "games"
      );
      
      if (!playsFolder) {
        playsFolder = createFolder("Plays", "Team plays and possessions", { 
          parentId: teamFolder.id, 
          folderType: "plays",
          teamId: teamFolder.id 
        });
        if (!playsFolder) {
          toast.error("Failed to create plays folder");
          return;
        }
      }
      
      if (!gamesFolder) {
        gamesFolder = createFolder("Games", "Full game recordings", { 
          parentId: teamFolder.id, 
          folderType: "games",
          teamId: teamFolder.id 
        });
        if (!gamesFolder) {
          toast.error("Failed to create games folder");
          return;
        }
      }
      
      // Create "Unnamed Clips" folder if it doesn't exist
      let unnamedClipsFolder = folders.find(f => f.name === "Unnamed Clips");
      if (!unnamedClipsFolder) {
        unnamedClipsFolder = createFolder("Unnamed Clips", "Automatically generated unnamed clips");
        if (!unnamedClipsFolder) {
          toast.error("Failed to create Unnamed Clips folder");
          return;
        }
      }
      
      const clipsByName: Record<string, SavedClip[]> = {};
      const fullGameClips: SavedClip[] = [];
      const otherClips: SavedClip[] = [];
      const unnamedClips: SavedClip[] = [];
      
      // First, categorize clips
      savedClips.forEach(clip => {
        // Include all clips for reorganization, even those already in folders
        if (clip.duration > 60) {
          fullGameClips.push(clip);
        } else if (clip.label && clip.label.trim() !== "") {
          // Check if this is an unnamed clip (matches the pattern "Clip at X.Xs")
          if (clip.label.match(/^Clip at \d+(\.\d+)?s$/)) {
            unnamedClips.push(clip);
          } else {
            const name = clip.label;
            if (!clipsByName[name]) {
              clipsByName[name] = [];
            }
            clipsByName[name].push(clip);
          }
        } else {
          otherClips.push(clip);
        }
      });
      
      const updatedFolders = [...folders];
      const playSubfolders: Record<string, ClipFolder> = {};
      
      // Create subfolders for each play name
      Object.entries(clipsByName).forEach(([name, clips]) => {
        if (clips.length > 0 && playsFolder) {
          // Check if a subfolder already exists
          let playSubfolder = folders.find(f => 
            f.parentId === playsFolder.id && 
            f.name === name
          );
          
          // Create a new subfolder if it doesn't exist
          if (!playSubfolder) {
            playSubfolder = {
              id: `folder-play-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
              name,
              description: `Clips for ${name}`,
              parentId: playsFolder.id,
              teamId: teamFolder?.id,
              folderType: "other",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            updatedFolders.push(playSubfolder);
          }
          
          playSubfolders[name] = playSubfolder;
        }
      });
      
      // Update clips with folder and team IDs
      const updatedClips = savedClips.map(clip => {
        // Always update all clips to ensure proper organization
        // First, add to My Library as the base folder
        let updatedClip = { ...clip, folderId: myLibraryFolder?.id };
        
        // Check if this is an unnamed clip
        if (clip.label.match(/^Clip at \d+(\.\d+)?s$/)) {
          // Place unnamed clips in the Unnamed Clips folder
          updatedClip = {
            ...updatedClip,
            folderId: unnamedClipsFolder?.id,
            clipType: "other" as ClipType
          };
        } else if (clip.duration > 60 && gamesFolder) {
          // Place full games in the Games folder
          updatedClip = {
            ...updatedClip,
            folderId: gamesFolder.id,
            teamId: teamFolder?.id,
            clipType: "full_game" as ClipType
          };
        } else if (clip.label && clip.label.trim() !== "") {
          const subfolder = playSubfolders[clip.label];
          if (subfolder) {
            // Place in play subfolder
            updatedClip = {
              ...updatedClip, 
              folderId: subfolder.id,
              teamId: teamFolder?.id,
              clipType: "play" as ClipType
            };
          } else if (playsFolder) {
            // Fallback to main plays folder
            updatedClip = {
              ...updatedClip,
              folderId: playsFolder.id,
              teamId: teamFolder?.id,
              clipType: "play" as ClipType
            };
          }
        }
        
        return updatedClip;
      });
      
      setFolders(updatedFolders);
      setSavedClips(updatedClips);
      
      toast.success("Clips organized into My Library and team folders");
    } catch (error) {
      console.error("Error auto-organizing clips:", error);
      toast.error("Failed to organize clips");
    }
  };

  return {
    savedClips,
    folders,
    games,
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
    createTeamFolder,
    updateFolder,
    deleteFolder,
    moveClipToFolder,
    getClipsByFolder,
    getClipsByTeam,
    addGame,
    updateGame,
    deleteGame,
    getFolderHierarchy,
    getTeamFolders,
    getStorageInfo,
    autoOrganizeClips
  };
};
