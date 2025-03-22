
import React from "react";
import { GameData, GameSituation, GAME_SITUATIONS, PlayerAction } from "@/types/analyzer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookmarkIcon } from "lucide-react";
import { formatVideoTime } from "@/components/video/utils";
import { getSituationLabel } from "@/utils/playerActionUtils";
import PlayerActionsForm from "./PlayerActionsForm";

interface AddToLibraryFormProps {
  selectedClip: GameData | null;
  playLabel: string;
  activePlayers: PlayerAction[];
  situation: GameSituation | "";
  playerName: string;
  playerAction: any;
  onPlayLabelChange: (value: string) => void;
  onSituationChange: (value: GameSituation | "") => void;
  onPlayerNameChange: (value: string) => void;
  onPlayerActionChange: (value: any) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onSaveClip: () => void;
}

const AddToLibraryForm: React.FC<AddToLibraryFormProps> = ({
  selectedClip,
  playLabel,
  activePlayers,
  situation,
  playerName,
  playerAction,
  onPlayLabelChange,
  onSituationChange,
  onPlayerNameChange,
  onPlayerActionChange,
  onAddPlayer,
  onRemovePlayer,
  onSaveClip
}) => {
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
        {selectedClip.Notes || "Unnamed clip"} ({formatVideoTime(parseFloat(selectedClip["Start time"] || "0"))})
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
        <Select 
          value={situation} 
          onValueChange={(value) => onSituationChange(value as GameSituation)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a situation" />
          </SelectTrigger>
          <SelectContent>
            {GAME_SITUATIONS.map(situation => (
              <SelectItem key={situation} value={situation}>
                {getSituationLabel(situation)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator className="my-3" />
      
      {/* Player tracking section */}
      <PlayerActionsForm
        playerName={playerName}
        playerAction={playerAction}
        activePlayers={activePlayers}
        onPlayerNameChange={onPlayerNameChange}
        onPlayerActionChange={onPlayerActionChange}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
      />
      
      <Button onClick={onSaveClip} className="w-full">
        <BookmarkIcon className="h-4 w-4 mr-2" />
        Save to Library
      </Button>
    </>
  );
};

export default AddToLibraryForm;
