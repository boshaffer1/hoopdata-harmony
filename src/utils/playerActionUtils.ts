
import React from "react";
import { Target, XIcon, UserPlus, ArrowDown, Hand, RotateCcw, List, User } from "lucide-react";
import { PlayerActionType } from "@/types/analyzer";

/**
 * Get the appropriate icon component for a player action
 */
export const getActionIcon = (action: PlayerActionType): React.ReactNode => {
  switch (action) {
    case "scored":
      return <Target className="h-3 w-3" />;
    case "missed":
      return <XIcon className="h-3 w-3" />;
    case "assist":
      return <UserPlus className="h-3 w-3" />;
    case "rebound":
      return <ArrowDown className="h-3 w-3" />;
    case "block":
      return <Hand className="h-3 w-3" />;
    case "steal":
      return <Hand className="h-3 w-3" />;
    case "turnover":
      return <RotateCcw className="h-3 w-3" />;
    case "foul":
      return <XIcon className="h-3 w-3" />;
    case "other":
      return <List className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

/**
 * Get the appropriate background color class for a player action
 */
export const getActionColor = (action: PlayerActionType): string => {
  switch (action) {
    case "scored":
      return "bg-green-500";
    case "missed":
      return "bg-red-500";
    case "assist":
      return "bg-blue-500";
    case "rebound":
      return "bg-purple-500";
    case "block":
      return "bg-yellow-500";
    case "steal":
      return "bg-indigo-500";
    case "turnover":
      return "bg-orange-500";
    case "foul":
      return "bg-pink-500";
    case "other":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};
