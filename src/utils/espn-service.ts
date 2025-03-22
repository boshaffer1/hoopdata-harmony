
import { TeamRoster, Player } from "@/types/analyzer";
import { toast } from "sonner";

interface ESPNTeam {
  id: string;
  uid: string;
  slug: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  logo: string;
}

interface ESPNAthlete {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  weight: number;
  height: number;
  jersey: string;
  position: {
    abbreviation: string;
    displayName: string;
    name: string;
  };
  headshot?: {
    href: string;
    alt: string;
  };
}

export const ESPNService = {
  /**
   * Fetch teams from ESPN
   */
  async fetchNBATeams(): Promise<ESPNTeam[]> {
    try {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      const data = await response.json();
      return data.sports[0].leagues[0].teams.map((team: any) => team.team);
    } catch (error) {
      console.error('Error fetching ESPN teams:', error);
      toast.error('Failed to fetch teams from ESPN');
      return [];
    }
  },
  
  /**
   * Fetch roster for a specific team
   */
  async fetchTeamRoster(teamId: string): Promise<ESPNAthlete[]> {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch team roster');
      }
      
      const data = await response.json();
      return data.athletes;
    } catch (error) {
      console.error('Error fetching team roster:', error);
      toast.error('Failed to fetch team roster from ESPN');
      return [];
    }
  },
  
  /**
   * Convert ESPN team to our TeamRoster format
   */
  convertToTeamRoster(espnTeam: ESPNTeam, athletes: ESPNAthlete[]): TeamRoster {
    const players: Player[] = athletes.map(athlete => ({
      id: `player-${athlete.id}`,
      name: athlete.displayName,
      number: athlete.jersey || "0",
      position: athlete.position.abbreviation,
      notes: `${athlete.position.displayName}`,
    }));
    
    return {
      id: `team-${espnTeam.id}`,
      name: espnTeam.displayName,
      players
    };
  }
};
