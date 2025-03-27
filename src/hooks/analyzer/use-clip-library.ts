import { useState, useEffect } from "react";
import { SavedClip, ClipFolder, Game, ExportOptions } from "@/types/analyzer";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export const useClipLibrary = (videoUrl?: string) => {
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [playLabel, setPlayLabel] = useState("");
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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
    } catch (error) {
      console.error("Error loading clips from local storage:", error);
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

  const createFolder = (name: string, description: string) => {
    const newFolder: ClipFolder = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderType: "other"
    };

    setFolders((prevFolders) => [...prevFolders, newFolder]);
    toast.success(`Folder "${name}" created`);
    return newFolder;
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

  const addGame = (title: string, date: string, homeTeam: string, awayTeam: string, videoUrl?: string, dataUrl?: string, teamId?: string) => {
    const newGame: Game = {
      id: uuidv4(),
      title,
      date,
      homeTeam,
      awayTeam,
      videoUrl,
      dataUrl,
      teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGames((prevGames) => [...prevGames, newGame]);
    toast.success(`Game "${title}" created`);
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prevGames) =>
      prevGames.map((game) => (game.id === id ? { ...game, ...updates } : game))
    );
    toast.success(`Game updated`);
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
    moveClipToFolder,
    games,
    addGame,
    updateGame
  };
};
