
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BookmarkIcon } from "lucide-react";
import { PlayerAction, GameData, GameSituation } from "@/types/analyzer";
import PlayerActionsForm from "./PlayerActionsForm";
import SituationSelect from "./SituationSelect";
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
      
      {/* Use the new SituationSelect component */}
      <SituationSelect 
        value={situation} 
        onValueChange={(value) => setSituation(value)} 
      />
      
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
