
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedClip, GameData } from "@/types/analyzer";
import ClipForm from "./ClipForm";
import SavedClipsList from "./SavedClipsList";

interface ClipLibraryProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
}

const ClipLibrary: React.FC<ClipLibraryProps> = ({
  savedClips,
  playLabel,
  selectedClip,
  onPlayLabelChange,
  onSaveClip,
  onRemoveClip,
  onExportClip,
  onExportLibrary,
  onPlayClip,
}) => {
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
          <h3 className="text-sm font-medium mb-2">Add Current Clip to Library</h3>
          <ClipForm
            selectedClip={selectedClip}
            playLabel={playLabel}
            onPlayLabelChange={onPlayLabelChange}
            onSaveClip={onSaveClip}
          />
        </div>

        {/* Saved clips library */}
        <div className="space-y-4">
          <SavedClipsList
            savedClips={savedClips}
            onPlayClip={onPlayClip}
            onExportClip={onExportClip}
            onRemoveClip={onRemoveClip}
            onExportLibrary={onExportLibrary}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClipLibrary;
