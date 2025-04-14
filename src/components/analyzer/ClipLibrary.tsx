
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedClip, GameData, PlayerAction, GameSituation } from "@/types/analyzer";
import { ClipForm } from "./clips/ClipForm";
import { ClipLibraryList } from "./clips/ClipLibraryList";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ClipLibraryProps {
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
}) => {
  const [activePlayers, setActivePlayers] = useState<PlayerAction[]>([]);
  const [situation, setSituation] = useState<GameSituation>("other");
  const [autoOrganize, setAutoOrganize] = useState<boolean>(false);

  // Update the active players when a clip is selected
  useEffect(() => {
    if (selectedClip) {
      // Extract any existing players from the selected clip
      try {
        if (selectedClip.Players && selectedClip.Players !== "[]") {
          const players = JSON.parse(selectedClip.Players);
          if (Array.isArray(players)) {
            setActivePlayers(players);
          }
        }
        
        // Set the situation if it exists
        if (selectedClip.Situation) {
          setSituation(selectedClip.Situation as GameSituation);
        } else {
          setSituation("other");
        }
        
        // Set the play label if it doesn't exist yet
        if (!playLabel && selectedClip["Play Name"]) {
          onPlayLabelChange(selectedClip["Play Name"]);
        }
      } catch (error) {
        console.error("Error parsing players:", error);
      }
    }
  }, [selectedClip, playLabel, onPlayLabelChange]);

  const addPlayer = (newPlayer: PlayerAction) => {
    setActivePlayers([...activePlayers, newPlayer]);
  };
  
  const removePlayer = (playerId: string) => {
    setActivePlayers(activePlayers.filter(p => p.playerId !== playerId));
  };

  const handleSaveClip = (clip: GameData) => {
    onSaveClip(clip, autoOrganize);
    setActivePlayers([]);
    setSituation("other"); // Reset to a default valid value
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Add Current Clip to Library</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-organize"
                checked={autoOrganize}
                onCheckedChange={setAutoOrganize}
                size="sm"
              />
              <Label htmlFor="auto-organize" className="text-xs">Auto-organize by play name</Label>
            </div>
          </div>
          <ClipForm
            selectedClip={selectedClip}
            playLabel={playLabel}
            onPlayLabelChange={onPlayLabelChange}
            onSaveClip={handleSaveClip}
            activePlayers={activePlayers}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            situation={situation}
            onSituationChange={setSituation}
          />
        </div>

        {/* Saved clips library */}
        <div className="space-y-4">
          <ClipLibraryList
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
