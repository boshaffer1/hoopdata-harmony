
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player, TeamRoster } from "@/types/analyzer";
import { Badge } from "@/components/ui/badge";

interface PlayerProfileProps {
  player: Player;
  team: TeamRoster;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, team }) => {
  // Get player initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Mock data (in a real app, this would come from the player object)
  const playerDetails = {
    height: "6-4",
    weight: "195 lbs", 
    class: "Freshman",
    season: "2023-2024"
  };

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 mb-4">
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-xl font-semibold mb-1">{player.name}</h3>
        <p className="text-lg mb-2">#{player.number}</p>
        
        <Badge variant="outline" className="mb-4">
          {player.position}
        </Badge>
        
        <div className="w-full border-t pt-4 mt-2">
          <div className="grid grid-cols-2 gap-y-3 text-left">
            <div className="text-sm font-medium">Height:</div>
            <div className="text-sm text-right">{playerDetails.height}</div>
            
            <div className="text-sm font-medium">Weight:</div>
            <div className="text-sm text-right">{playerDetails.weight}</div>
            
            <div className="text-sm font-medium">Class:</div>
            <div className="text-sm text-right">{playerDetails.class}</div>
            
            <div className="text-sm font-medium">Team:</div>
            <div className="text-sm text-right">{team.name}</div>
            
            <div className="text-sm font-medium">Season:</div>
            <div className="text-sm text-right">{playerDetails.season}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
