
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedClip, GameData, PlayerAction, PlayerActionType, GameSituation } from "@/types/analyzer";
import AddToLibraryForm from "./AddToLibraryForm";
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
  const [playerName, setPlayerName] = useState("");
  const [playerAction, setPlayerAction] = useState<PlayerActionType>("scored");
  const [activePlayers, setActivePlayers] = useState<PlayerAction[]>([]);
  const [situation, setSituation] = useState<GameSituation | "">("");

  const addPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: PlayerAction = {
      playerId: Date.now().toString(),
      playerName: playerName.trim(),
      action: playerAction
    };
    
    setActivePlayers([...activePlayers, newPlayer]);
    setPlayerName("");
  };
  
  const removePlayer = (playerId: string) => {
    setActivePlayers(activePlayers.filter(p => p.playerId !== playerId));
  };

  const handleSaveClip = () => {
    if (selectedClip) {
      const clipWithMetadata: GameData = {
        ...selectedClip,
        "Players": JSON.stringify(activePlayers),
        "Situation": situation as GameSituation || "other"
      };
      onSaveClip(clipWithMetadata);
      setActivePlayers([]);
      setSituation("");
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
          <h3 className="text-sm font-medium mb-2">Add Current Clip to Library</h3>
          <AddToLibraryForm
            selectedClip={selectedClip}
            playLabel={playLabel}
            activePlayers={activePlayers}
            situation={situation}
            playerName={playerName}
            playerAction={playerAction}
            onPlayLabelChange={onPlayLabelChange}
            onSituationChange={setSituation}
            onPlayerNameChange={setPlayerName}
            onPlayerActionChange={setPlayerAction}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onSaveClip={handleSaveClip}
          />
        </div>

        {/* Saved clips library */}
        <SavedClipsList
          savedClips={savedClips}
          onPlayClip={onPlayClip}
          onExportClip={onExportClip}
          onRemoveClip={onRemoveClip}
          onExportLibrary={onExportLibrary}
        />
      </CardContent>
    </Card>
  );
};

export default ClipLibrary;
