
import React from "react";
import { Button } from "@/components/ui/button";
import { List, Download, Building2, Users } from "lucide-react";
import { SavedClip } from "@/types/analyzer";
import { SavedClipItem } from "./SavedClipItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClipLibraryListProps {
  savedClips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onExportLibrary: () => void;
  selectable?: boolean;
  selectedClipIds?: string[];
  onToggleSelection?: (id: string) => void;
}

export const ClipLibraryList: React.FC<ClipLibraryListProps> = ({
  savedClips,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onExportLibrary,
  selectable = false,
  selectedClipIds = [],
  onToggleSelection = () => {},
}) => {
  if (savedClips.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <List className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          Your clip library is empty
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Saved Clips</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportLibrary}>
            <Download className="h-4 w-4 mr-2" />
            Export Library
          </Button>
        </div>
      </div>

      <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 mt-4">
        {savedClips.map((clip) => (
          <SavedClipItem
            key={clip.id}
            clip={clip}
            onPlay={onPlayClip}
            onExport={onExportClip}
            onRemove={onRemoveClip}
            selectable={selectable}
            isSelected={selectedClipIds.includes(clip.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </ul>
    </>
  );
};
