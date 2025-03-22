
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X } from "lucide-react";
import { TeamRoster, Player } from "@/types/analyzer";

interface RosterViewProps {
  rosters: TeamRoster[];
  onAddTeam: (teamName: string) => void;
  onAddPlayer: (teamId: string, player: Omit<Player, "id">) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onRemoveTeam: (teamId: string) => void;
}

const RosterView: React.FC<RosterViewProps> = ({
  rosters,
  onAddTeam,
  onAddPlayer,
  onRemovePlayer,
  onRemoveTeam
}) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Find the active team
  const activeTeam = activeTeamId 
    ? rosters.find(team => team.id === activeTeamId) 
    : null;

  // Filter players based on search query
  const filteredPlayers = activeTeam && searchQuery
    ? activeTeam.players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.number.toString().includes(searchQuery))
    : activeTeam?.players || [];

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    onAddTeam(newTeamName);
    setNewTeamName("");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeamId || !newPlayerName.trim()) return;
    
    onAddPlayer(activeTeamId, {
      name: newPlayerName,
      number: newPlayerNumber || "0",
      position: newPlayerPosition || "N/A"
    });
    
    setNewPlayerName("");
    setNewPlayerNumber("");
    setNewPlayerPosition("");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Team Rosters</CardTitle>
        <CardDescription>
          Manage player rosters for scouting reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTeamId || "add"} 
          onValueChange={(value) => setActiveTeamId(value === "add" ? null : value)}
        >
          <TabsList className="mb-4 overflow-x-auto flex w-full h-auto flex-wrap">
            {rosters.map(team => (
              <TabsTrigger key={team.id} value={team.id} className="flex items-center gap-1">
                {team.name}
              </TabsTrigger>
            ))}
            <TabsTrigger value="add" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Team
            </TabsTrigger>
          </TabsList>
          
          {/* Add New Team */}
          <TabsContent value="add">
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Input 
                  className="col-span-3"
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <Button type="submit">Add</Button>
              </div>
            </form>
          </TabsContent>
          
          {/* Team Roster Views */}
          {rosters.map(team => (
            <TabsContent key={team.id} value={team.id}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onRemoveTeam(team.id)}
                  >
                    Remove Team
                  </Button>
                </div>
                
                {/* Search Players */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search players..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Add New Player */}
                <form onSubmit={handleAddPlayer} className="space-y-2 p-3 border rounded-md">
                  <h4 className="text-sm font-medium">Add New Player</h4>
                  <div className="grid grid-cols-12 gap-2">
                    <Input 
                      className="col-span-6"
                      placeholder="Player Name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                    />
                    <Input 
                      className="col-span-2"
                      placeholder="#"
                      value={newPlayerNumber}
                      onChange={(e) => setNewPlayerNumber(e.target.value)}
                    />
                    <Input 
                      className="col-span-2"
                      placeholder="POS"
                      value={newPlayerPosition}
                      onChange={(e) => setNewPlayerPosition(e.target.value)}
                    />
                    <Button type="submit" className="col-span-2">Add</Button>
                  </div>
                </form>
                
                {/* Player List */}
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-2">
                    {filteredPlayers.length > 0 ? (
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
                          {filteredPlayers.map(player => (
                            <tr key={player.id} className="border-b last:border-0">
                              <td className="p-2">{player.number}</td>
                              <td className="p-2">{player.name}</td>
                              <td className="p-2">{player.position}</td>
                              <td className="p-2 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemovePlayer(team.id, player.id)}
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
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RosterView;
