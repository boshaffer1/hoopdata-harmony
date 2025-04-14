
import React from "react";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import { GameData, SavedClip } from "@/types/analyzer";

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
  onPlayClip: (clip: SavedClip) => void;
  onStopClip: () => void;
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
  onStopClip
}) => {
  return (
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
    />
  );
};

export default LibraryPanel;
