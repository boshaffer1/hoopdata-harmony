
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getActionIcon, getActionColor } from "@/utils/playerActionUtils";
import { PlayerAction } from "@/types/analyzer";

interface PlayerActionBadgeProps {
  player: PlayerAction;
  onRemove?: (playerId: string) => void;
  isInteractive?: boolean;
}

const PlayerActionBadge: React.FC<PlayerActionBadgeProps> = ({ 
  player, 
  onRemove, 
  isInteractive = false 
}) => {
  return (
    <Badge 
      key={player.playerId} 
      variant="outline" 
      className={`flex items-center gap-1 px-2 py-1 ${isInteractive ? 'hover:bg-muted/50' : ''}`}
    >
      {getActionIcon(player.action)}
      <span className="ml-1">{player.playerName}</span>
      <span className={`inline-block w-2 h-2 rounded-full ${getActionColor(player.action)}`} />
      {isInteractive && onRemove && (
        <button 
          onClick={() => onRemove(player.playerId)} 
          className="ml-1 text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
      )}
    </Badge>
  );
};

export default PlayerActionBadge;
