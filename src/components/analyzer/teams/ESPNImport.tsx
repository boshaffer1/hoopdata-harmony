
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { ESPNService } from "@/utils/espn-service";
import { toast } from "sonner";
import { TeamRoster, Player } from "@/types/analyzer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ESPNImportProps {
  onTeamCreated: (team: TeamRoster | null) => void;
  onAddTeam: (teamName: string) => TeamRoster | null;
  onAddPlayer: (teamId: string, player: Omit<Player, "id">) => void;
}

// Available leagues in ESPN
const LEAGUES = [
  { id: 'nba', name: 'NBA', sport: 'basketball' },
  { id: 'wnba', name: 'WNBA', sport: 'basketball' },
  { id: 'mens-college-basketball', name: 'NCAA Men', sport: 'basketball' },
  { id: 'womens-college-basketball', name: 'NCAA Women', sport: 'basketball' }
];

const ESPNImport: React.FC<ESPNImportProps> = ({ 
  onTeamCreated, 
  onAddTeam, 
  onAddPlayer 
}) => {
  const [espnTeams, setEspnTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isImportingRoster, setIsImportingRoster] = useState(false);
  const [selectedESPNTeam, setSelectedESPNTeam] = useState<string>("");
  const [selectedLeague, setSelectedLeague] = useState<string>("nba");

  // Fetch ESPN teams when league changes
  useEffect(() => {
    if (selectedLeague) {
      fetchESPNTeams(selectedLeague);
    }
  }, [selectedLeague]);

  const fetchESPNTeams = async (leagueId: string) => {
    setIsLoadingTeams(true);
    try {
      const league = LEAGUES.find(l => l.id === leagueId);
      if (!league) {
        throw new Error("League not found");
      }
      
      const teams = await ESPNService.fetchTeams(league.sport, leagueId);
      console.log(`Fetched ${teams.length} teams for ${leagueId}`);
      setEspnTeams(teams);
      setSelectedESPNTeam(""); // Reset team selection when league changes
    } catch (error) {
      console.error(`Error fetching ${leagueId} teams from ESPN:`, error);
      toast.error(`Failed to fetch teams from ESPN (${leagueId})`);
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

      const league = LEAGUES.find(l => l.id === selectedLeague);
      if (!league) {
        throw new Error("League not found");
      }

      // Show loading toast for better UX
      const loadingToast = toast.loading(`Importing ${selectedTeam.displayName} roster...`);
      
      // Fetch the team roster
      const athletes = await ESPNService.fetchTeamRoster(league.sport, selectedLeague, selectedESPNTeam);
      
      if (!athletes || athletes.length === 0) {
        toast.dismiss(loadingToast);
        toast.warning(`No players found for ${selectedTeam.displayName}. This can happen with some NCAA teams.`);
        return;
      }
      
      // Convert ESPN data to our format
      const teamRoster = ESPNService.convertToTeamRoster(selectedTeam, athletes);
      toast.dismiss(loadingToast);
      
      // Create the team
      const newTeam = onAddTeam(teamRoster.name);
      
      // Add all players if team was created
      if (newTeam) {
        // Track how many players were successfully added
        let playersAdded = 0;
        
        for (const player of teamRoster.players) {
          if (player && player.name) {
            onAddPlayer(newTeam.id, {
              name: player.name,
              number: player.number || "0",
              position: player.position || "N/A",
              height: player.height || "",
              year: player.year || "",
              hometown: player.hometown || "",
              notes: player.notes || ""
            });
            playersAdded++;
          }
        }
        
        // Set as active team
        onTeamCreated(newTeam);
        toast.success(`Imported ${teamRoster.name} with ${playersAdded} players`);
        
        if (playersAdded === 0) {
          toast.warning("No valid players were found in the roster data");
        } else if (playersAdded < teamRoster.players.length) {
          toast.info(`Note: ${teamRoster.players.length - playersAdded} players were skipped due to missing data`);
        }
      }
    } catch (error) {
      console.error("Error importing ESPN roster:", error);
      toast.error("Failed to import roster from ESPN");
    } finally {
      setIsImportingRoster(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {/* League selector */}
        <Select value={selectedLeague} onValueChange={setSelectedLeague}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a league" />
          </SelectTrigger>
          <SelectContent>
            {LEAGUES.map(league => (
              <SelectItem key={league.id} value={league.id}>
                {league.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          {/* Team selector */}
          <select 
            className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
            value={selectedESPNTeam}
            onChange={(e) => setSelectedESPNTeam(e.target.value)}
            disabled={isLoadingTeams || espnTeams.length === 0}
          >
            <option value="">Select a Team</option>
            {espnTeams
              .filter(team => team && team.displayName) // Filter out invalid teams
              .sort((a, b) => a.displayName.localeCompare(b.displayName)) // Sort alphabetically
              .map(team => (
                <option key={team.id} value={team.id}>
                  {team.displayName}
                </option>
              ))
            }
          </select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchESPNTeams(selectedLeague)} 
            disabled={isLoadingTeams}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingTeams ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={importESPNRoster} 
            disabled={isImportingRoster || !selectedESPNTeam}
          >
            {isImportingRoster ? 
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 
              <Download className="h-4 w-4 mr-2" />
            }
            Import
          </Button>
        </div>
      </div>
      
      {isLoadingTeams && (
        <p className="text-sm text-muted-foreground">Loading teams from ESPN...</p>
      )}
      
      {!isLoadingTeams && espnTeams.length === 0 && (
        <p className="text-sm text-muted-foreground">No teams found. Try selecting a different league or refresh.</p>
      )}
    </div>
  );
};

export default ESPNImport;
