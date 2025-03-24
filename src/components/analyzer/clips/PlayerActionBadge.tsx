
import React from "react";
import { Badge } from "@/components/ui/badge";
import { XCircle, Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List } from "lucide-react";
import { PlayerAction, PlayerActionType } from "@/types/analyzer";

interface PlayerActionBadgeProps {
  player: PlayerAction;
  onRemove?: (playerId: string) => void;
  size?: "sm" | "md";
}

export const PlayerActionBadge: React.FC<PlayerActionBadgeProps> = ({
  player,
  onRemove,
  size = "md"
}) => {
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
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${size === "sm" ? "text-xs px-1.5 py-0.5" : "px-2 py-1"}`}
    >
      {getActionIcon(player.action)}
      <span className={size === "sm" ? "ml-1" : "ml-1"}>{player.playerName}</span>
      <span className={`${size === "sm" ? "ml-1" : ""} inline-block w-2 h-2 rounded-full ${getActionColor(player.action)}`} />
      {size !== "sm" && <span className="text-xs">{player.action}</span>}
      {onRemove && (
        <button onClick={() => onRemove(player.playerId)} className="ml-1">
          <XCircle className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};
