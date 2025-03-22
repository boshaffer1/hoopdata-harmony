
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerAction, PlayerActionType, PLAYER_ACTIONS } from "@/types/analyzer";
import { PlusCircle } from "lucide-react";
import PlayerActionBadge from "./PlayerActionBadge";
import { getActionIcon } from "@/utils/playerActionUtils";

interface PlayerActionsFormProps {
  playerName: string;
  playerAction: PlayerActionType;
  activePlayers: PlayerAction[];
  onPlayerNameChange: (value: string) => void;
  onPlayerActionChange: (value: PlayerActionType) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
}

const PlayerActionsForm: React.FC<PlayerActionsFormProps> = ({
  playerName,
  playerAction,
  activePlayers,
  onPlayerNameChange,
  onPlayerActionChange,
  onAddPlayer,
  onRemovePlayer
}) => {
  return (
    <div className="mt-4 mb-3">
      <h4 className="text-sm font-medium mb-2">Player Actions</h4>
      
      <div className="flex items-center gap-2 mb-2">
        <Input
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          placeholder="Player name"
          className="flex-1"
        />
        <Select 
          value={playerAction} 
          onValueChange={(value) => onPlayerActionChange(value as PlayerActionType)}
        >
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
        <Button size="icon" variant="outline" onClick={onAddPlayer}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Display active players */}
      {activePlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {activePlayers.map(player => (
            <PlayerActionBadge 
              key={player.playerId} 
              player={player} 
              onRemove={onRemovePlayer} 
              isInteractive={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerActionsForm;
