
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatVideoTime } from "@/components/video/utils";
import { GameData, GameSituation, GAME_SITUATIONS, PlayerAction } from "@/types/analyzer";
import { PlayerActionBadge } from "./PlayerActionBadge";
import { PlayerActionForm } from "./PlayerActionForm";

interface ClipFormProps {
  selectedClip: GameData | null;
  playLabel: string;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData) => void;
  activePlayers: PlayerAction[];
  onAddPlayer: (player: PlayerAction) => void;
  onRemovePlayer: (playerId: string) => void;
  situation: GameSituation;
  onSituationChange: (situation: GameSituation) => void;
}

export const ClipForm: React.FC<ClipFormProps> = ({
  selectedClip,
  playLabel,
  onPlayLabelChange,
  onSaveClip,
  activePlayers,
  onAddPlayer,
  onRemovePlayer,
  situation,
  onSituationChange
}) => {
  // Use the actual record from GAME_SITUATIONS
  const getSituationLabel = (situation: GameSituation): string => {
    return GAME_SITUATIONS[situation] || "Other";
  };

  const handleSaveClip = () => {
    if (selectedClip) {
      // Create a copy of selectedClip with the updated data
      const clipWithMetadata = {
        ...selectedClip,
        Players: JSON.stringify(activePlayers),
        Situation: situation
      };
      
      onSaveClip(clipWithMetadata);
    }
  };

  if (!selectedClip) {
    return (
      <p className="text-muted-foreground text-sm">
        Play a clip from the data table and add it to your library
      </p>
    );
  }

  return (
    <>
      <div className="text-xs mb-3 bg-primary/10 p-2 rounded">
        <span className="font-medium">Selected: </span>
        {selectedClip["Play Name"] || selectedClip.Notes || "Unnamed clip"} ({formatVideoTime(parseFloat(selectedClip["Start time"] || "0"))})
      </div>
      
      <div className="flex space-x-2 mb-3">
        <Input
          value={playLabel}
          onChange={(e) => onPlayLabelChange(e.target.value)}
          placeholder="Label this play (e.g. 'Goal Kick')"
          className="flex-1"
        />
      </div>
      
      {/* Game Situation dropdown */}
      <div className="mb-3">
        <label className="text-sm font-medium mb-2 block">Game Situation</label>
        <Select value={situation} onValueChange={(value) => onSituationChange(value as GameSituation)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a situation" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GAME_SITUATIONS).map(([situationKey, situationLabel]) => (
              <SelectItem key={situationKey} value={situationKey}>
                {situationLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator className="my-3" />
      
      {/* Player tracking section */}
      <div className="mt-4 mb-3">
        <h4 className="text-sm font-medium mb-2">Player Actions</h4>
        
        <PlayerActionForm onAddPlayer={onAddPlayer} />
        
        {/* Display active players */}
        {activePlayers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {activePlayers.map(player => (
              <PlayerActionBadge 
                key={player.playerId}
                player={player}
                onRemove={onRemovePlayer}
              />
            ))}
          </div>
        )}
      </div>
      
      <Button onClick={handleSaveClip} className="w-full">
        <BookmarkIcon className="h-4 w-4 mr-2" />
        Save to Library
      </Button>
    </>
  );
};
