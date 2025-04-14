
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedClip } from "@/types/analyzer";
import { SavedClipItem } from "@/components/analyzer/clips/SavedClipItem";

interface ClipListItemProps {
  clip: SavedClip;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelection: (clipId: string) => void;
  onPlay: (clip: SavedClip) => void;
  onExport: (clip: SavedClip) => void;
  onRemove: (id: string) => void;
}

export const ClipListItem: React.FC<ClipListItemProps> = ({
  clip,
  isSelected,
  isSelectMode,
  onToggleSelection,
  onPlay,
  onExport,
  onRemove
}) => {
  return (
    <li 
      className={`relative border rounded-lg transition-colors ${
        isSelected ? 'bg-muted/80 border-primary/40' : ''
      }`}
    >
      {isSelectMode && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(clip.id)}
            className="h-5 w-5"
          />
        </div>
      )}
      <div className={isSelectMode ? 'pl-8' : ''}>
        <SavedClipItem
          clip={clip}
          onPlay={onPlay}
          onExport={onExport}
          onRemove={onRemove}
        />
      </div>
    </li>
  );
};
