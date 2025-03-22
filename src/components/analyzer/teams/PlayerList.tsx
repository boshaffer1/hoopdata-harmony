
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Player } from "@/types/analyzer";

interface PlayerListProps {
  players: Player[];
  teamId: string;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  searchQuery: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  teamId, 
  onRemovePlayer,
  searchQuery
}) => {
  return (
    <ScrollArea className="h-[300px] rounded-md border">
      <div className="p-2">
        {players.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-sm">
                <th className="p-2">#</th>
                <th className="p-2">Name</th>
                <th className="p-2">Pos</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b last:border-0">
                  <td className="p-2">{player.number}</td>
                  <td className="p-2">{player.name}</td>
                  <td className="p-2">{player.position}</td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePlayer(teamId, player.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No players match your search" : "No players in this roster"}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PlayerList;
