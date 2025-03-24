
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List } from "lucide-react";
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
      case "assisted": return <UserPlus className="h-3 w-3" />;
      case "rebounded": return <ArrowDown className="h-3 w-3" />;
      case "blocked": return <Hand className="h-3 w-3" />;
      case "stole": return <Hand className="h-3 w-3" />;
      case "turnover": return <RotateCcw className="h-3 w-3" />;
      case "fouled": return <XIcon className="h-3 w-3" />;
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
          {Object.entries(PLAYER_ACTIONS).map(([action, label]) => (
            <SelectItem key={action} value={action}>
              <div className="flex items-center">
                {getActionIcon(action as PlayerActionType)}
                <span className="ml-2">{label}</span>
              </div>
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
