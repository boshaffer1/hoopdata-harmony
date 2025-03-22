
import React from "react";
import { TeamRoster } from "@/types/analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface TopPlayersProps {
  team: TeamRoster;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ team }) => {
  // Get player initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Mock stats for display
  const getRandomStat = (base: number, variance: number) => {
    return (base + Math.random() * variance).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {team && team.players.slice(0, 3).map((player) => (
            <Link 
              to={`/myteam/player/${team.id}/${player.id}`} 
              key={player.id}
              className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">
                  #{player.number} • {player.position}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{getRandomStat(15, 10)} PPG</div>
                <div className="text-sm text-muted-foreground">
                  {getRandomStat(6, 4)} RPG, {getRandomStat(3, 3)} APG
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
