
import React from "react";
import { Button } from "@/components/ui/button";
import { List, Download, Check } from "lucide-react";
import { SavedClip } from "@/types/analyzer";
import { SavedClipItem } from "./SavedClipItem";
import { Checkbox } from "@/components/ui/checkbox";

interface ClipLibraryListProps {
  savedClips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onExportLibrary: () => void;
  isSelectMode?: boolean;
  selectedClips?: string[];
  onToggleSelection?: (clipId: string) => void;
}

export const ClipLibraryList: React.FC<ClipLibraryListProps> = ({
  savedClips,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onExportLibrary,
  isSelectMode = false,
  selectedClips = [],
  onToggleSelection
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
        <Button variant="outline" size="sm" onClick={onExportLibrary}>
          <Download className="h-4 w-4 mr-2" />
          Export Library
        </Button>
      </div>

      <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 mt-4">
        {savedClips.map((clip) => (
          <li 
            key={clip.id}
            className={`relative border rounded-lg transition-colors ${
              selectedClips.includes(clip.id) ? 'bg-muted/80 border-primary/40' : ''
            }`}
          >
            {isSelectMode && onToggleSelection && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                <Checkbox 
                  checked={selectedClips.includes(clip.id)}
                  onCheckedChange={() => onToggleSelection(clip.id)}
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
    </>
  );
};
