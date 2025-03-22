
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { PlayerAction, PlayerActionType, PLAYER_ACTIONS } from "@/types/analyzer";
import PlayerActionItem from "./PlayerActionItem";
import { getActionIcon } from "@/utils/playerActionUtils";

interface PlayerActionsFormProps {
  activePlayers: PlayerAction[];
  onAddPlayer: (player: PlayerAction) => void;
  onRemovePlayer: (playerId: string) => void;
}

const PlayerActionsForm: React.FC<PlayerActionsFormProps> = ({
  activePlayers,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [playerAction, setPlayerAction] = useState<PlayerActionType>("scored");

  const addPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: PlayerAction = {
      playerId: Date.now().toString(),
      playerName: playerName.trim(),
      action: playerAction
    };
    
    onAddPlayer(newPlayer);
    setPlayerName("");
  };

  return (
    <div className="mt-4 mb-3">
      <h4 className="text-sm font-medium mb-2">Player Actions</h4>
      
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
        <Button size="icon" variant="outline" onClick={addPlayer}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Display active players */}
      {activePlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {activePlayers.map(player => (
            <PlayerActionItem 
              key={player.playerId}
              player={player}
              onRemove={onRemovePlayer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerActionsForm;
