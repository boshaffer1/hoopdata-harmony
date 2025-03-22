
import React from "react";
import { Badge } from "@/components/ui/badge";
import { XCircle } from "lucide-react";
import { PlayerAction } from "@/types/analyzer";
import { getActionIcon, getActionColor } from "@/utils/playerActionUtils";

interface PlayerActionItemProps {
  player: PlayerAction;
  onRemove: (playerId: string) => void;
}

const PlayerActionItem: React.FC<PlayerActionItemProps> = ({
  player,
  onRemove,
}) => {
  return (
    <Badge key={player.playerId} variant="outline" className="flex items-center gap-1 px-2 py-1">
      {getActionIcon(player.action)}
      <span className="ml-1">{player.playerName}</span>
      <span className={`w-2 h-2 rounded-full ${getActionColor(player.action)}`} />
      <span className="text-xs">{player.action}</span>
      <button onClick={() => onRemove(player.playerId)} className="ml-1">
        <XCircle className="h-3 w-3" />
      </button>
    </Badge>
  );
};

export default PlayerActionItem;
