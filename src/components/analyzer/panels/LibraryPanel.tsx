
import React from "react";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import { GameData, SavedClip, ClipFolder } from "@/types/analyzer";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { toast } from "sonner";

interface LibraryPanelProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData, autoOrganize?: boolean) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void; // This expects SavedClip
  onStopClip: () => void;
  onBulkMoveClips?: (clipIds: string[], targetFolderId: string | null) => void;
  onCreateFolder?: (name: string, description: string) => ClipFolder | undefined;
  folders?: ClipFolder[];
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
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
  folders
}) => {
  // Get the autoOrganizeByPlayName function directly
  const { autoOrganizeByPlayName, organizeByGames } = useClipLibrary();

  const handleRunAutoOrganize = () => {
    autoOrganizeByPlayName();
    organizeByGames();
    toast.success("Auto-organized all clips by play names and games");
  };

  return (
    <div className="space-y-4">
      <div className="text-right">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRunAutoOrganize}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Auto-organize All Clips
        </Button>
      </div>
      <ClipLibrary 
        savedClips={savedClips}
        playLabel={playLabel}
        selectedClip={selectedClip}
        isPlayingClip={isPlayingClip}
        onPlayLabelChange={onPlayLabelChange}
        onSaveClip={onSaveClip}
        onRemoveClip={onRemoveClip}
        onExportClip={onExportClip}
        onExportLibrary={onExportLibrary}
        onPlayClip={onPlayClip}
        onStopClip={onStopClip}
        onBulkMoveClips={onBulkMoveClips}
        onCreateFolder={onCreateFolder}
        folders={folders}
      />
    </div>
  );
};

export default LibraryPanel;
