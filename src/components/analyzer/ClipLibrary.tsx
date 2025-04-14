
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedClip, GameData, PlayerAction, GameSituation, ClipFolder } from "@/types/analyzer";
import { ClipForm } from "./clips/ClipForm";
import { ClipLibraryList } from "./clips/ClipLibraryList";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BulkMoveDialog } from "@/components/library/dialogs/BulkMoveDialog";
import { CreateFolderDialog } from "@/components/library/dialogs/CreateFolderDialog";
import { Button } from "@/components/ui/button";
import { Check, FolderPlus, MoveHorizontal } from "lucide-react";
import { toast } from "sonner";

interface ClipLibraryProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData, autoOrganize?: boolean) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
  onStopClip: () => void;
  onBulkMoveClips?: (clipIds: string[], targetFolderId: string | null) => void;
  onCreateFolder?: (name: string, description: string) => ClipFolder | undefined;
  folders?: ClipFolder[];
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
  onBulkMoveClips,
  onCreateFolder,
  folders = []
}) => {
  const [activePlayers, setActivePlayers] = useState<PlayerAction[]>([]);
  const [situation, setSituation] = useState<GameSituation>("other");
  const [autoOrganize, setAutoOrganize] = useState<boolean>(false);
  
  // New state for clip selection
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isBulkMoveDialogOpen, setIsBulkMoveDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");

  // Update the active players when a clip is selected
  useEffect(() => {
    if (selectedClip) {
      // Extract any existing players from the selected clip
      try {
        if (selectedClip.Players && selectedClip.Players !== "[]") {
          const players = JSON.parse(selectedClip.Players);
          if (Array.isArray(players)) {
            setActivePlayers(players);
          }
        }
        
        // Set the situation if it exists
        if (selectedClip.Situation) {
          setSituation(selectedClip.Situation as GameSituation);
        } else {
          setSituation("other");
        }
        
        // Set the play label if it doesn't exist yet
        if (!playLabel && selectedClip["Play Name"]) {
          onPlayLabelChange(selectedClip["Play Name"]);
        }
      } catch (error) {
        console.error("Error parsing players:", error);
      }
    }
  }, [selectedClip, playLabel, onPlayLabelChange]);

  const addPlayer = (newPlayer: PlayerAction) => {
    setActivePlayers([...activePlayers, newPlayer]);
  };
  
  const removePlayer = (playerId: string) => {
    setActivePlayers(activePlayers.filter(p => p.playerId !== playerId));
  };

  const handleSaveClip = (clip: GameData) => {
    onSaveClip(clip, autoOrganize);
    setActivePlayers([]);
    setSituation("other"); // Reset to a default valid value
  };
  
  // Functions for clip selection and bulk operations
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
    if (selectedClips.length === savedClips.length) {
      setSelectedClips([]);
    } else {
      setSelectedClips(savedClips.map(clip => clip.id));
    }
  };
  
  const handleBulkMove = () => {
    if (!onBulkMoveClips) {
      toast.error("Bulk move functionality not available");
      return;
    }
    
    if (selectedClips.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    onBulkMoveClips(selectedClips, moveToFolderId);
    setIsBulkMoveDialogOpen(false);
    setIsSelectMode(false);
    setSelectedClips([]);
    toast.success(`Moved ${selectedClips.length} clips to ${moveToFolderId ? folders.find(f => f.id === moveToFolderId)?.name : 'root folder'}`);
  };
  
  const handleCreateFolderAndMove = () => {
    if (!onCreateFolder) {
      toast.error("Create folder functionality not available");
      return;
    }
    
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    const newFolder = onCreateFolder(newFolderName, newFolderDescription);
    
    if (newFolder && onBulkMoveClips) {
      onBulkMoveClips(selectedClips, newFolder.id);
      
      setNewFolderName("");
      setNewFolderDescription("");
      setIsNewFolderDialogOpen(false);
      setIsBulkMoveDialogOpen(false);
      setIsSelectMode(false);
      setSelectedClips([]);
      
      toast.success(`Created folder "${newFolder.name}" and moved ${selectedClips.length} clips`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Clip Library</CardTitle>
        <CardDescription>
          Save and export video clips
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add to library section */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Add Current Clip to Library</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-organize"
                checked={autoOrganize}
                onCheckedChange={setAutoOrganize}
              />
              <Label htmlFor="auto-organize" className="text-xs">Auto-organize by play name</Label>
            </div>
          </div>
          <ClipForm
            selectedClip={selectedClip}
            playLabel={playLabel}
            onPlayLabelChange={onPlayLabelChange}
            onSaveClip={handleSaveClip}
            activePlayers={activePlayers}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            situation={situation}
            onSituationChange={setSituation}
          />
        </div>

        {/* Saved clips library */}
        <div className="space-y-4">
          {/* Add selection controls */}
          {savedClips.length > 0 && (
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">
                {isSelectMode 
                  ? `${selectedClips.length} of ${savedClips.length} selected` 
                  : `${savedClips.length} clips`}
              </h3>
              
              <div className="flex gap-2">
                {isSelectMode ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllClips}
                      className="text-xs"
                    >
                      {selectedClips.length === savedClips.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsBulkMoveDialogOpen(true)}
                      disabled={selectedClips.length === 0}
                      className="flex items-center gap-1 text-xs"
                    >
                      <MoveHorizontal className="h-3 w-3" />
                      Move to Folder
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsNewFolderDialogOpen(true)}
                      disabled={selectedClips.length === 0}
                      className="flex items-center gap-1 text-xs"
                    >
                      <FolderPlus className="h-3 w-3" />
                      New Folder
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleSelectMode}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleSelectMode}
                    className="text-xs"
                  >
                    Select Clips
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <ClipLibraryList
            savedClips={savedClips}
            onPlayClip={onPlayClip}
            onExportClip={onExportClip}
            onRemoveClip={onRemoveClip}
            onExportLibrary={onExportLibrary}
            isSelectMode={isSelectMode}
            selectedClips={selectedClips}
            onToggleSelection={toggleClipSelection}
          />
        </div>
      </CardContent>
      
      {/* Dialogs for bulk operations */}
      <BulkMoveDialog 
        isOpen={isBulkMoveDialogOpen}
        onOpenChange={setIsBulkMoveDialogOpen}
        folders={folders}
        selectedFolderId={moveToFolderId}
        onFolderSelect={setMoveToFolderId}
        onCreateFolderClick={() => {
          setIsBulkMoveDialogOpen(false);
          setIsNewFolderDialogOpen(true);
        }}
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
      />
    </Card>
  );
};

export default ClipLibrary;
