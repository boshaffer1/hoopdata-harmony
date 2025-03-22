
import React from "react";
import { SavedClip } from "@/types/analyzer";
import { Button } from "@/components/ui/button";
import { Download, List } from "lucide-react";
import SavedClipCard from "./SavedClipCard";

interface SavedClipsListProps {
  savedClips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onExportLibrary: () => void;
}

const SavedClipsList: React.FC<SavedClipsListProps> = ({
  savedClips,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onExportLibrary
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Saved Clips</h3>
        {savedClips.length > 0 && (
          <Button variant="outline" size="sm" onClick={onExportLibrary}>
            <Download className="h-4 w-4 mr-2" />
            Export Library
          </Button>
        )}
      </div>

      {savedClips.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <List className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            Your clip library is empty
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {savedClips.map((clip) => (
            <SavedClipCard
              key={clip.id}
              clip={clip}
              onPlayClip={onPlayClip}
              onExportClip={onExportClip}
              onRemoveClip={onRemoveClip}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedClipsList;
