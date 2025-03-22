
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookmarkIcon, Flag } from "lucide-react";
import { PlayerAction, GameData, GameSituation, GAME_SITUATIONS } from "@/types/analyzer";
import PlayerActionsForm from "./PlayerActionsForm";
import { formatVideoTime } from "@/components/video/utils";

interface ClipFormProps {
  selectedClip: GameData | null;
  playLabel: string;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData) => void;
}

const ClipForm: React.FC<ClipFormProps> = ({
  selectedClip,
  playLabel,
  onPlayLabelChange,
  onSaveClip,
}) => {
  const [activePlayers, setActivePlayers] = useState<PlayerAction[]>([]);
  const [situation, setSituation] = useState<GameSituation | "">("");

  const handleAddPlayer = (player: PlayerAction) => {
    setActivePlayers([...activePlayers, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setActivePlayers(activePlayers.filter(p => p.playerId !== playerId));
  };

  const handleSaveClip = () => {
    if (selectedClip) {
      const clipWithMetadata = {
        ...selectedClip,
        Players: JSON.stringify(activePlayers),
        Situation: situation
      };
      onSaveClip(clipWithMetadata);
      setActivePlayers([]);
      setSituation("");
    }
  };

  const getSituationLabel = (situation: GameSituation): string => {
    const labels: Record<GameSituation, string> = {
      transition: "Transition",
      half_court: "Half Court",
      ato: "After Timeout (ATO)",
      slob: "Sideline Out of Bounds (SLOB)",
      blob: "Baseline Out of Bounds (BLOB)",
      press_break: "Press Break",
      zone_offense: "Zone Offense",
      man_offense: "Man Offense",
      fast_break: "Fast Break",
      other: "Other"
    };
    
    return labels[situation] || situation;
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
        <Select value={situation} onValueChange={(value) => setSituation(value as GameSituation)}>
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
        activePlayers={activePlayers}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
      />
      
      <Button onClick={handleSaveClip} className="w-full">
        <BookmarkIcon className="h-4 w-4 mr-2" />
        Save to Library
      </Button>
    </>
  );
};

export default ClipForm;
