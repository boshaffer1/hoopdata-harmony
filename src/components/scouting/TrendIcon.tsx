
import React from "react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface TrendIconProps {
  trend?: 'up' | 'down' | 'neutral';
}

export function TrendIcon({ trend }: TrendIconProps) {
  switch (trend) {
    case 'up':
      return <ChevronUp className="text-green-500 h-4 w-4" />;
    case 'down':
      return <ChevronDown className="text-red-500 h-4 w-4" />;
    default:
      return <Minus className="text-gray-500 h-4 w-4" />;
  }
}
