import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SavedClip, GameData } from "@/types/analyzer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { ClipLibraryList } from "./clips/ClipLibraryList";

interface ClipLibraryProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  onPlayLabelChange: (label: string) => void;
  onSaveClip: (clip: GameData) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
  onStopClip: () => void;
  onAutoOrganize?: () => void;
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
  onAutoOrganize
}) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedClipIds([]);
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedClipIds(prevIds => {
      if (prevIds.includes(id)) {
        return prevIds.filter(clipId => clipId !== id);
      } else {
        return [...prevIds, id];
      }
    });
  };

  const handleSaveCurrentClip = () => {
    if (selectedClip) {
      onSaveClip(selectedClip);
    }
  };

  const handleSelectAllClips = () => {
    if (selectedClipIds.length === savedClips.length) {
      setSelectedClipIds([]);
    } else {
      setSelectedClipIds(savedClips.map(clip => clip.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Save Current Clip</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleSelectionMode}
            className="text-xs"
          >
            {selectionMode ? "Exit Selection" : "Select Multiple"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="playLabel">Clip Label</Label>
            <div className="flex gap-2">
              <Input
                id="playLabel"
                placeholder="Enter clip name"
                value={playLabel}
                onChange={e => onPlayLabelChange(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSaveCurrentClip} 
                disabled={!selectedClip || !playLabel}
                className="whitespace-nowrap"
              >
                Save Current
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {selectionMode && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAllClips}
              className="mr-2"
            >
              {selectedClipIds.length === savedClips.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedClipIds.length} of {savedClips.length} selected
            </span>
          </div>
        )}
        
        <ClipLibraryList
          savedClips={savedClips}
          onPlayClip={onPlayClip}
          onExportClip={onExportClip}
          onRemoveClip={onRemoveClip}
          onExportLibrary={onExportLibrary}
          selectable={selectionMode}
          selectedClipIds={selectedClipIds}
          onToggleSelection={handleToggleSelection}
          onAutoOrganize={onAutoOrganize}
        />
      </div>
    </div>
  );
};

export default ClipLibrary;
