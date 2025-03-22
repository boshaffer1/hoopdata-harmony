
import React from "react";
import { TeamStats } from "@/utils/analyzer-stats";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TeamStatsProps {
  teams: TeamStats[];
}

const TeamStatsComponent: React.FC<TeamStatsProps> = ({ teams }) => {
  return (
    <ScrollArea className="h-[400px] rounded-md border">
      {teams.length > 0 ? (
        <div className="p-4 space-y-6">
          {teams.map(team => (
            <div key={team.teamName} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">{team.teamName}</h3>
                <Badge variant="outline">{team.totalClips} clips</Badge>
              </div>
              
              <Separator className="my-2" />
              
              {team.players.length > 0 ? (
                <div className="space-y-3 pl-2">
                  {team.players.map(player => (
                    <div key={player.playerName} className="text-sm">
                      <div className="flex justify-between">
                        <span>{player.playerName.replace(`${team.teamName} - `, '')}</span>
                        <span className="text-muted-foreground">{player.totalClips} clips</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No player data for this team</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No team data available
        </div>
      )}
    </ScrollArea>
  );
};

export default TeamStatsComponent;
