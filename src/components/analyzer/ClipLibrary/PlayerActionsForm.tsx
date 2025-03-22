
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List, User } from "lucide-react";
import { PlayerAction, PlayerActionType, PLAYER_ACTIONS } from "@/types/analyzer";
import PlayerActionItem from "./PlayerActionItem";

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

  const getActionIcon = (action: PlayerActionType) => {
    const icons: Record<PlayerActionType, React.ReactNode> = {
      scored: <Target className="h-3 w-3" />,
      missed: <XIcon className="h-3 w-3" />,
      assist: <UserPlus className="h-3 w-3" />,
      rebound: <ArrowDown className="h-3 w-3" />,
      block: <Hand className="h-3 w-3" />,
      steal: <Hand className="h-3 w-3" />,
      turnover: <RotateCcw className="h-3 w-3" />,
      foul: <XIcon className="h-3 w-3" />,
      other: <List className="h-3 w-3" />
    };
    
    return icons[action] || <User className="h-3 w-3" />;
  };

  const getActionColor = (action: PlayerActionType): string => {
    const colors: Record<PlayerActionType, string> = {
      scored: "bg-green-500",
      missed: "bg-red-500",
      assist: "bg-blue-500",
      rebound: "bg-purple-500",
      block: "bg-yellow-500",
      steal: "bg-indigo-500",
      turnover: "bg-orange-500",
      foul: "bg-pink-500",
      other: "bg-gray-500"
    };
    
    return colors[action] || "bg-gray-500";
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
              getActionIcon={getActionIcon}
              getActionColor={getActionColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerActionsForm;
