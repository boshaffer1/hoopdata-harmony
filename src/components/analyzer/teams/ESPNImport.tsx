
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { ESPNService } from "@/utils/espn-service";
import { toast } from "sonner";
import { TeamRoster, Player } from "@/types/analyzer";

interface ESPNImportProps {
  onTeamCreated: (team: TeamRoster | null) => void;
  onAddTeam: (teamName: string) => TeamRoster | null;
  onAddPlayer: (teamId: string, player: Omit<Player, "id">) => void;
}

const ESPNImport: React.FC<ESPNImportProps> = ({ 
  onTeamCreated, 
  onAddTeam, 
  onAddPlayer 
}) => {
  const [espnTeams, setEspnTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isImportingRoster, setIsImportingRoster] = useState(false);
  const [selectedESPNTeam, setSelectedESPNTeam] = useState<string>("");

  // Fetch ESPN teams on component mount
  useEffect(() => {
    fetchESPNTeams();
  }, []);

  const fetchESPNTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const teams = await ESPNService.fetchNBATeams();
      setEspnTeams(teams);
    } catch (error) {
      console.error("Error fetching ESPN teams:", error);
      toast.error("Failed to fetch teams from ESPN");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const importESPNRoster = async () => {
    if (!selectedESPNTeam) {
      toast.error("Please select a team to import");
      return;
    }

    setIsImportingRoster(true);
    try {
      const selectedTeam = espnTeams.find(team => team.id === selectedESPNTeam);
      if (!selectedTeam) {
        toast.error("Team not found");
        return;
      }

      const athletes = await ESPNService.fetchTeamRoster(selectedESPNTeam);
      const teamRoster = ESPNService.convertToTeamRoster(selectedTeam, athletes);
      
      // Create the team
      const newTeam = onAddTeam(teamRoster.name);
      
      // Add all players if team was created
      if (newTeam) {
        for (const player of teamRoster.players) {
          onAddPlayer(newTeam.id, {
            name: player.name,
            number: player.number,
            position: player.position
          });
        }
        
        // Set as active team
        onTeamCreated(newTeam);
        toast.success(`Imported ${teamRoster.name} with ${teamRoster.players.length} players`);
      }
    } catch (error) {
      console.error("Error importing ESPN roster:", error);
      toast.error("Failed to import roster from ESPN");
    } finally {
      setIsImportingRoster(false);
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Import from ESPN</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchESPNTeams} 
          disabled={isLoadingTeams}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTeams ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        <select 
          className="col-span-4 px-3 py-2 rounded-md border border-input bg-background"
          value={selectedESPNTeam}
          onChange={(e) => setSelectedESPNTeam(e.target.value)}
          disabled={isLoadingTeams || espnTeams.length === 0}
        >
          <option value="">Select an ESPN Team</option>
          {espnTeams.map(team => (
            <option key={team.id} value={team.id}>
              {team.displayName}
            </option>
          ))}
        </select>
        <Button 
          onClick={importESPNRoster} 
          disabled={isImportingRoster || !selectedESPNTeam}
        >
          {isImportingRoster ? 
            <RefreshCw className="h-4 w-4 animate-spin" /> : 
            <Download className="h-4 w-4" />
          }
        </Button>
      </div>
      
      {isLoadingTeams && (
        <p className="text-sm text-muted-foreground">Loading teams from ESPN...</p>
      )}
      
      {!isLoadingTeams && espnTeams.length === 0 && (
        <p className="text-sm text-muted-foreground">Failed to load teams from ESPN. Try refreshing.</p>
      )}
    </div>
  );
};

export default ESPNImport;
