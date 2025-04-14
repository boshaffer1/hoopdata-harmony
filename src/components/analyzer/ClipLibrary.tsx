import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SavedClip, ClipFolder } from "@/types/analyzer";
import { ClipLibraryList } from "../analyzer/clips/ClipLibraryList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderPlus,
  MoveRight,
  Folder,
  Check,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ClipLibraryProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: any | null;
  isPlayingClip: boolean;
  onPlayLabelChange: (label: string) => void;
  onSaveClip: (clipData: any, folderId?: string) => SavedClip | undefined;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
  onStopClip: () => void;
}

const ClipLibrary: React.FC<ClipLibraryProps> = ({
  savedClips,
  playLabel,
  selectedClip,
  isPlayingClip,
  onPlayLabelChange,
  onSaveClip,
  onRemoveClip,
  onExportClip,
  onExportLibrary,
  onPlayClip,
  onStopClip,
}) => {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [isMovingClips, setIsMovingClips] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [organizing, setOrganizing] = useState(false);
  
  const getFolders = (): ClipFolder[] => {
    try {
      const foldersData = localStorage.getItem('clipFolders');
      if (foldersData) {
        return JSON.parse(foldersData);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
    return [];
  };
  
  const folders = getFolders();
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    try {
      const newFolder: ClipFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        description: newFolderDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedFolders = [...folders, newFolder];
      localStorage.setItem('clipFolders', JSON.stringify(updatedFolders));
      
      setNewFolderName("");
      setNewFolderDescription("");
      setIsCreateFolderOpen(false);
      
      toast.success(`Created folder: ${newFolderName}`);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };
  
  const toggleClipSelection = (clipId: string) => {
    setSelectedClipIds(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId) 
        : [...prev, clipId]
    );
  };
  
  const selectAllClips = () => {
    if (selectedClipIds.length === savedClips.length) {
      setSelectedClipIds([]);
    } else {
      setSelectedClipIds(savedClips.map(clip => clip.id));
    }
  };
  
  const moveSelectedClipsToFolder = () => {
    if (!selectedFolderId || selectedClipIds.length === 0) {
      toast.error("Please select a folder and at least one clip");
      return;
    }
    
    try {
      const updatedClips = savedClips.map(clip => 
        selectedClipIds.includes(clip.id) 
          ? { ...clip, folderId: selectedFolderId } 
          : clip
      );
      
      localStorage.setItem('savedClips', JSON.stringify(updatedClips));
      
      toast.success(`Moved ${selectedClipIds.length} clips to folder`);
      setSelectedClipIds([]);
      setIsMovingClips(false);
      setSelectedFolderId(null);
      
      window.location.reload();
    } catch (error) {
      console.error("Error moving clips:", error);
      toast.error("Failed to move clips");
    }
  };
  
  const autoOrganizeClips = () => {
    setOrganizing(true);
    
    try {
      let playsFolder = folders.find(f => f.name === "Plays");
      let gamesFolder = folders.find(f => f.name === "Games");
      
      const updatedFolders = [...folders];
      
      if (!playsFolder) {
        playsFolder = {
          id: `folder-plays-${Date.now()}`,
          name: "Plays",
          description: "Auto-organized plays",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folderType: "plays"
        };
        updatedFolders.push(playsFolder);
      }
      
      if (!gamesFolder) {
        gamesFolder = {
          id: `folder-games-${Date.now()}`,
          name: "Games",
          description: "Full game recordings",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folderType: "games"
        };
        updatedFolders.push(gamesFolder);
      }
      
      let offenseFolder = folders.find(f => f.name === "Offense" && f.parentId === playsFolder.id);
      let defenseFolder = folders.find(f => f.name === "Defense" && f.parentId === playsFolder.id);
      
      if (!offenseFolder) {
        offenseFolder = {
          id: `folder-offense-${Date.now()}`,
          name: "Offense",
          description: "Offensive possessions",
          parentId: playsFolder.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedFolders.push(offenseFolder);
      }
      
      if (!defenseFolder) {
        defenseFolder = {
          id: `folder-defense-${Date.now()}`,
          name: "Defense",
          description: "Defensive possessions",
          parentId: playsFolder.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedFolders.push(defenseFolder);
      }
      
      localStorage.setItem('clipFolders', JSON.stringify(updatedFolders));
      
      const clipsByName = savedClips.reduce((acc, clip) => {
        const name = clip.label.trim();
        if (!name || name === "clip" || name.length < 3) return acc;
        
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(clip);
        return acc;
      }, {} as Record<string, SavedClip[]>);
      
      let updatedClips = [...savedClips];
      
      Object.entries(clipsByName).forEach(([name, clips]) => {
        if (!name || name === "clip" || name.length < 3) return;
        
        if (clips.length > 1) {
          const playSubfolder = {
            id: `folder-play-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
            name,
            description: `Clips for ${name}`,
            parentId: playsFolder.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          updatedFolders.push(playSubfolder);
          
          updatedClips = updatedClips.map(clip => 
            clip.label === name ? { ...clip, folderId: playSubfolder.id } : clip
          );
        }
      });
      
      localStorage.setItem('clipFolders', JSON.stringify(updatedFolders));
      localStorage.setItem('savedClips', JSON.stringify(updatedClips));
      
      toast.success("Clips organized into folders");
      setOrganizing(false);
      
      window.location.reload();
    } catch (error) {
      console.error("Error auto-organizing clips:", error);
      toast.error("Failed to organize clips");
      setOrganizing(false);
    }
  };
  
  const deleteSelectedClips = () => {
    if (selectedClipIds.length === 0) {
      toast.error("Please select at least one clip to delete");
      return;
    }
    
    try {
      const remainingClips = savedClips.filter(clip => !selectedClipIds.includes(clip.id));
      localStorage.setItem('savedClips', JSON.stringify(remainingClips));
      
      toast.success(`Deleted ${selectedClipIds.length} clips`);
      setSelectedClipIds([]);
      
      window.location.reload();
    } catch (error) {
      console.error("Error deleting clips:", error);
      toast.error("Failed to delete clips");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4">
        <Label htmlFor="playLabel">Save Current Clip</Label>
        <div className="flex gap-2">
          <Input
            id="playLabel"
            placeholder="Enter clip label"
            value={playLabel}
            onChange={(e) => onPlayLabelChange(e.target.value)}
          />
          <Button
            onClick={() => {
              if (selectedClip) {
                onSaveClip(selectedClip);
              } else {
                toast.error("No clip selected to save");
              }
            }}
            disabled={!playLabel.trim() || !selectedClip}
          >
            Save Clip
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <FolderPlus className="h-4 w-4" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your clips
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Enter folder description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isMovingClips} onOpenChange={setIsMovingClips}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              disabled={selectedClipIds.length === 0}
            >
              <MoveRight className="h-4 w-4" />
              Move Selected ({selectedClipIds.length})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move Clips to Folder</DialogTitle>
              <DialogDescription>
                Select a folder to move {selectedClipIds.length} clips
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderSelect">Select Folder</Label>
                <Select onValueChange={(value) => setSelectedFolderId(value)}>
                  <SelectTrigger id="folderSelect">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMovingClips(false)}>
                Cancel
              </Button>
              <Button onClick={moveSelectedClipsToFolder}>Move Clips</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={selectAllClips}
        >
          <Check className="h-4 w-4" />
          {selectedClipIds.length === savedClips.length ? "Deselect All" : "Select All"}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={autoOrganizeClips}
          disabled={organizing}
        >
          <Folder className="h-4 w-4" />
          Auto-Organize
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-1 text-destructive"
          onClick={deleteSelectedClips}
          disabled={selectedClipIds.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected
        </Button>
      </div>

      <ClipLibraryList
        savedClips={savedClips}
        onPlayClip={onPlayClip}
        onExportClip={onExportClip}
        onRemoveClip={onRemoveClip}
        onExportLibrary={onExportLibrary}
        selectable={true}
        selectedClipIds={selectedClipIds}
        onToggleSelection={toggleClipSelection}
      />
    </div>
  );
};

export default ClipLibrary;
