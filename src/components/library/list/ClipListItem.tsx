
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedClip } from "@/types/analyzer";
import { SavedClipItem } from "@/components/analyzer/clips/SavedClipItem";
import { Badge } from "@/components/ui/badge";
import { FolderIcon } from "lucide-react";

interface ClipListItemProps {
  clip: SavedClip;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelection: (clipId: string) => void;
  onPlay: (clip: SavedClip) => void;
  onExport: (clip: SavedClip) => void;
  onRemove: (id: string) => void;
  folderName?: string; // Added folder name prop
}

export const ClipListItem: React.FC<ClipListItemProps> = ({
  clip,
  isSelected,
  isSelectMode,
  onToggleSelection,
  onPlay,
  onExport,
  onRemove,
  folderName
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
      {folderName && (
        <div className="absolute right-2 top-2 z-10">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <FolderIcon className="h-3 w-3" />
            {folderName}
          </Badge>
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
