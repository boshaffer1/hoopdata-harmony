
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, X, Download, RefreshCw } from "lucide-react";
import { TeamRoster, Player } from "@/types/analyzer";
import { ESPNService } from "@/utils/espn-service";
import { toast } from "sonner";
import TeamForm from "./TeamForm";
import ESPNImport from "./ESPNImport";
import TeamRosterList from "./TeamRosterList";
import PlayerList from "./PlayerList";
import AddPlayerForm from "./AddPlayerForm";

interface RosterViewProps {
  rosters: TeamRoster[];
  onAddTeam: (teamName: string) => TeamRoster | null;
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
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
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
          <TeamRosterList 
            rosters={rosters} 
          />
          
          {/* Add New Team */}
          <TabsContent value="add">
            <div className="space-y-6">
              {/* Manual team creation */}
              <TeamForm onAddTeam={onAddTeam} />

              {/* ESPN team import */}
              <ESPNImport 
                onTeamCreated={(newTeam) => {
                  if (newTeam) {
                    setActiveTeamId(newTeam.id);
                  }
                }}
                onAddTeam={onAddTeam}
                onAddPlayer={onAddPlayer}
              />
            </div>
          </TabsContent>
          
          {/* Team Roster Views */}
          {rosters.map(team => (
            <TabsContent key={team.id} value={team.id}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    onClick={() => onRemoveTeam(team.id)}
                  >
                    Remove Team
                  </button>
                </div>
                
                {/* Search Players */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    placeholder="Search players..." 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Add New Player */}
                <AddPlayerForm 
                  teamId={team.id}
                  onAddPlayer={onAddPlayer}
                />
                
                {/* Player List */}
                <PlayerList 
                  players={filteredPlayers}
                  teamId={team.id}
                  onRemovePlayer={onRemovePlayer}
                  searchQuery={searchQuery}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RosterView;
