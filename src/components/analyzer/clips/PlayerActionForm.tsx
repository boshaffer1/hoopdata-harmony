
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PlayerAction, PlayerActionType, PLAYER_ACTIONS } from "@/types/analyzer";

interface PlayerActionFormProps {
  onAddPlayer: (player: PlayerAction) => void;
}

export const PlayerActionForm: React.FC<PlayerActionFormProps> = ({ onAddPlayer }) => {
  const [playerName, setPlayerName] = useState("");
  const [playerAction, setPlayerAction] = useState<PlayerActionType>("scored");

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: PlayerAction = {
      playerId: Date.now().toString(),
      playerName: playerName.trim(),
      action: playerAction
    };
    
    onAddPlayer(newPlayer);
    setPlayerName("");
  };

  const getActionIcon = (action: PlayerActionType): React.ReactNode => {
    switch(action) {
      case "scored": return <Target className="h-3 w-3" />;
      case "missed": return <XIcon className="h-3 w-3" />;
      case "assist": return <UserPlus className="h-3 w-3" />;
      case "rebound": return <ArrowDown className="h-3 w-3" />;
      case "block": return <Hand className="h-3 w-3" />;
      case "steal": return <Hand className="h-3 w-3" />;
      case "turnover": return <RotateCcw className="h-3 w-3" />;
      case "foul": return <XIcon className="h-3 w-3" />;
      case "other": return <List className="h-3 w-3" />;
      default: return <List className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <Input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Player name"
        className="flex-1"
      />
      <Select value={playerAction} onValueChange={(value) => setPlayerAction(value as PlayerActionType)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          {PLAYER_ACTIONS.map(action => (
            <SelectItem key={action} value={action}>
              {getActionIcon(action)}
              <span className="ml-2">
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="icon" variant="outline" onClick={handleAddPlayer}>
        <PlusCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

import { Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List } from "lucide-react";
