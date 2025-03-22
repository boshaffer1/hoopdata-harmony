
import React from "react";
import { Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List, User } from "lucide-react";
import { PlayerActionType } from "@/types/analyzer";

/**
 * Get the appropriate icon component for a player action
 */
export const getActionIcon = (action: PlayerActionType): React.ReactNode => {
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

/**
 * Get the appropriate background color class for a player action
 */
export const getActionColor = (action: PlayerActionType): string => {
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
