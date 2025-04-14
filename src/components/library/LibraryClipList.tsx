
import React, { useState, useRef } from "react";
import { ClipListHeader } from "./list/ClipListHeader";
import { ClipListItem } from "./list/ClipListItem";
import { BulkMoveDialog } from "./dialogs/BulkMoveDialog";
import { CreateFolderDialog } from "./dialogs/CreateFolderDialog";
import { BulkExportDialog } from "./dialogs/BulkExportDialog";
import { List } from "lucide-react";
import { SavedClip, ClipFolder, ExportOptions } from "@/types/analyzer";
import { toast } from "sonner";

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void; // This expects SavedClip
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
  const [autoOrganize, setAutoOrganize] = useState(false);
  
  const lastSelectedFolderRef = useRef<string | null>(null);

  const getFolderNameForClip = (clip: SavedClip): string | undefined => {
    if (!clip.folderId) return undefined;
    const folder = folders.find(f => f.id === clip.folderId);
    return folder?.name;
  };

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
    });
    setIsBulkExportDialogOpen(false);
    setIsSelectMode(false);
    setSelectedClips([]);
  };
  
  const handleMoveWithCreateFolder = () => {
    lastSelectedFolderRef.current = moveToFolderId;
    setIsNewFolderDialogOpen(true);
  };
  
  const handleCreateFolderAndMove = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    const newFolder = onCreateFolder(newFolderName, newFolderDescription);
    
    if (newFolder) {
      onBulkMove(selectedClips, newFolder.id);
      
      if (autoOrganize) {
        const selectedClipData = selectedClips.map(id => clips.find(clip => clip.id === id)).filter(Boolean) as SavedClip[];
        
        const labels = new Set<string>();
        selectedClipData.forEach(clip => {
          if (clip.label && clip.label !== "Unnamed Clip") {
            labels.add(clip.label);
          }
        });
        
        const additionalClipIds: string[] = [];
        labels.forEach(label => {
          const matchingClips = clips.filter(clip => 
            clip.label === label && 
            !selectedClips.includes(clip.id) &&
            clip.folderId !== newFolder.id
          );
          additionalClipIds.push(...matchingClips.map(clip => clip.id));
        });
        
        if (additionalClipIds.length > 0) {
          onBulkMove(additionalClipIds, newFolder.id);
          toast.success(`Also moved ${additionalClipIds.length} additional clips with the same play names`);
        }
      }
      
      setNewFolderName("");
      setNewFolderDescription("");
      setIsNewFolderDialogOpen(false);
      setIsBulkMoveDialogOpen(false);
      setIsSelectMode(false);
      setSelectedClips([]);
      setAutoOrganize(false);
      
      toast.success(`Created folder "${newFolder.name}" and moved clips`);
    }
  };

  const handleBulkDelete = () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedClips.length} clips?`);
    if (confirmed) {
      selectedClips.forEach(id => onRemoveClip(id));
      setSelectedClips([]);
      setIsSelectMode(false);
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
      <ClipListHeader 
        totalClips={clips.length}
        selectedClips={selectedClips}
        isSelectMode={isSelectMode}
        onToggleSelectMode={toggleSelectMode}
        onSelectAll={selectAllClips}
        onBulkMoveClick={() => setIsBulkMoveDialogOpen(true)}
        onBulkExportClick={() => setIsBulkExportDialogOpen(true)}
        onBulkDeleteClick={handleBulkDelete}
      />

      <ul className="space-y-2">
        {clips.map((clip) => (
          <ClipListItem 
            key={clip.id}
            clip={clip}
            isSelected={selectedClips.includes(clip.id)}
            isSelectMode={isSelectMode}
            onToggleSelection={toggleClipSelection}
            onPlay={onPlayClip}
            onExport={onExportClip}
            onRemove={onRemoveClip}
            folderName={getFolderNameForClip(clip)}
          />
        ))}
      </ul>

      <BulkMoveDialog 
        isOpen={isBulkMoveDialogOpen}
        onOpenChange={setIsBulkMoveDialogOpen}
        folders={folders}
        selectedFolderId={moveToFolderId}
        onFolderSelect={setMoveToFolderId}
        onCreateFolderClick={handleMoveWithCreateFolder}
        onMoveConfirm={handleBulkMove}
        selectedClipsCount={selectedClips.length}
      />

      <CreateFolderDialog 
        isOpen={isNewFolderDialogOpen}
        onOpenChange={setIsNewFolderDialogOpen}
        folderName={newFolderName}
        folderDescription={newFolderDescription}
        onFolderNameChange={setNewFolderName}
        onFolderDescriptionChange={setNewFolderDescription}
        onCreateConfirm={handleCreateFolderAndMove}
        autoOrganize={autoOrganize}
        onAutoOrganizeChange={setAutoOrganize}
      />

      <BulkExportDialog 
        isOpen={isBulkExportDialogOpen}
        onOpenChange={setIsBulkExportDialogOpen}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onExportConfirm={handleBulkExport}
        selectedClipsCount={selectedClips.length}
      />
    </div>
  );
};
