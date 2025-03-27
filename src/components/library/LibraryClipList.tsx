import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SavedClip, ClipFolder, ExportOptions } from "@/types/analyzer";
import { SavedClipItem } from "@/components/analyzer/clips/SavedClipItem";
import { 
  List, 
  Download, 
  Move, 
  MoreVertical, 
  Check, 
  FolderPlus, 
  FileJson
} from "lucide-react";
import { toast } from "sonner";

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onMoveToFolder: (clipId: string, folderId: string | null) => void;
  onBulkExport: (clipIds: string[], options?: ExportOptions) => void;
  onBulkMove: (clipIds: string[], targetFolderId: string | null) => void;
  onCreateFolder: (name: string, description: string) => ClipFolder | undefined;
}

export const LibraryClipList: React.FC<LibraryClipListProps> = ({
  clips,
  folders,
  activeFolder,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onMoveToFolder,
  onBulkExport,
  onBulkMove,
  onCreateFolder
}) => {
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isBulkMoveDialogOpen, setIsBulkMoveDialogOpen] = useState(false);
  const [isBulkExportDialogOpen, setIsBulkExportDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [exportFormat, setExportFormat] = useState<"json" | "mp4" | "webm">("json");
  const [includeSubfolders, setIncludeSubfolders] = useState(false);
  
  // Store last selected folder to use when creating a new folder during move operation
  const lastSelectedFolderRef = useRef<string | null>(null);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedClips([]);
  };

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId) 
        : [...prev, clipId]
    );
  };

  const selectAllClips = () => {
    if (selectedClips.length === clips.length) {
      setSelectedClips([]);
    } else {
      setSelectedClips(clips.map(clip => clip.id));
    }
  };

  const handleBulkMove = () => {
    if (selectedClips.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    onBulkMove(selectedClips, moveToFolderId);
    setIsBulkMoveDialogOpen(false);
    setIsSelectMode(false);
    setSelectedClips([]);
  };

  const handleBulkExport = () => {
    if (selectedClips.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    onBulkExport(selectedClips, {
      format: exportFormat,
      includeSubfolders
    });
    setIsBulkExportDialogOpen(false);
    setIsSelectMode(false);
    setSelectedClips([]);
  };
  
  const handleMoveWithCreateFolder = () => {
    // Store the currently selected folder ID (or null for root)
    lastSelectedFolderRef.current = moveToFolderId;
    setIsNewFolderDialogOpen(true);
  };
  
  const handleCreateFolderAndMove = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    // Create the new folder
    const newFolder = onCreateFolder(newFolderName, newFolderDescription);
    
    if (newFolder) {
      // Move the clips to the new folder
      onBulkMove(selectedClips, newFolder.id);
      
      // Reset states
      setNewFolderName("");
      setNewFolderDescription("");
      setIsNewFolderDialogOpen(false);
      setIsBulkMoveDialogOpen(false);
      setIsSelectMode(false);
      setSelectedClips([]);
      
      toast.success(`Created folder "${newFolder.name}" and moved ${selectedClips.length} clips`);
    }
  };

  if (clips.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <List className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          No clips found in this folder
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">
            {isSelectMode 
              ? `${selectedClips.length} of ${clips.length} selected` 
              : `${clips.length} clips`}
          </h3>
          {isSelectMode && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={selectAllClips}
              className="h-8 text-xs"
            >
              {selectedClips.length === clips.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {isSelectMode ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={selectedClips.length === 0}>
                    <MoreVertical className="h-4 w-4 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setIsBulkMoveDialogOpen(true)}>
                    <Move className="h-4 w-4 mr-2" />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsBulkExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      const confirmed = window.confirm(`Are you sure you want to delete ${selectedClips.length} clips?`);
                      if (confirmed) {
                        selectedClips.forEach(id => onRemoveClip(id));
                        setSelectedClips([]);
                        setIsSelectMode(false);
                      }
                    }}
                    className="text-destructive"
                  >
                    Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={toggleSelectMode}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={toggleSelectMode}>
              Select Clips
            </Button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {clips.map((clip) => (
          <li 
            key={clip.id} 
            className={`relative border rounded-lg transition-colors ${
              selectedClips.includes(clip.id) ? 'bg-muted/80 border-primary/40' : ''
            }`}
          >
            {isSelectMode && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                <Checkbox 
                  checked={selectedClips.includes(clip.id)}
                  onCheckedChange={() => toggleClipSelection(clip.id)}
                  className="h-5 w-5"
                />
              </div>
            )}
            <div className={isSelectMode ? 'pl-8' : ''}>
              <SavedClipItem
                clip={clip}
                onPlay={onPlayClip}
                onExport={onExportClip}
                onRemove={onRemoveClip}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Bulk Move Dialog */}
      <Dialog open={isBulkMoveDialogOpen} onOpenChange={setIsBulkMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Clips to Folder</DialogTitle>
            <DialogDescription>
              Select a destination folder for the {selectedClips.length} selected clips
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Destination Folder</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                <div 
                  className={`p-2 flex items-center gap-2 rounded-md cursor-pointer ${
                    moveToFolderId === null ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => setMoveToFolderId(null)}
                >
                  {moveToFolderId === null && <Check className="h-4 w-4 text-primary" />}
                  <span>Root (No folder)</span>
                </div>
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    className={`p-2 flex items-center gap-2 rounded-md cursor-pointer ${
                      moveToFolderId === folder.id ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setMoveToFolderId(folder.id)}
                  >
                    {moveToFolderId === folder.id && <Check className="h-4 w-4 text-primary" />}
                    <span>{folder.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleMoveWithCreateFolder}
            >
              <FolderPlus className="h-4 w-4" />
              Create New Folder
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkMove}>
              Move {selectedClips.length} Clips
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder and move the selected clips
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
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
              <Textarea
                id="description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter folder description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewFolderDialogOpen(false);
                // If user was in the move dialog, keep it open
                if (isBulkMoveDialogOpen) {
                  setMoveToFolderId(lastSelectedFolderRef.current);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolderAndMove}>
              Create and Move Clips
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Export Dialog */}
      <Dialog open={isBulkExportDialogOpen} onOpenChange={setIsBulkExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Clips</DialogTitle>
            <DialogDescription>
              Choose export format for the {selectedClips.length} selected clips
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                <Button 
                  variant={exportFormat === "json" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setExportFormat("json")}
                >
                  <FileJson className="h-4 w-4" />
                  JSON
                </Button>
                <Button 
                  variant={exportFormat === "webm" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setExportFormat("webm")}
                >
                  Video (WebM)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {exportFormat === "json" 
                  ? "Export clip metadata as a JSON file" 
                  : "Export actual video clips (may take some time)"
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkExport}>
              Export {selectedClips.length} Clips
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
