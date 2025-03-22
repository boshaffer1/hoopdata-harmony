
import React, { useState } from "react";
import { PlayerStats } from "@/utils/analyzer-stats";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface PlayerStatsProps {
  players: PlayerStats[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.playerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : players;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search players..." 
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border p-2">
        <div className="space-y-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <div key={player.playerName} className="border-b pb-3 last:border-b-0">
                <h4 className="font-medium">{player.playerName}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Appears in {player.totalClips} clips
                </p>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(player.actions).map(([action, count]) => (
                    <Badge 
                      key={action} 
                      variant={action === 'scored' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {action}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? "No players match your search" : "No player data available"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerStats;
