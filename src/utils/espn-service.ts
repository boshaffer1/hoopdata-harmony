
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

interface PlayerStats {
  ppg?: number;
  rpg?: number;
  apg?: number;
  spg?: number;
  bpg?: number;
  fgPercent?: number;
  threePointPercent?: number;
  ftPercent?: number;
}

export const ESPNService = {
  /**
   * Fetch teams from ESPN for a specific sport and league
   */
  async fetchTeams(sport: string, league: string): Promise<ESPNTeam[]> {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${league} teams`);
      }
      
      const data = await response.json();
      
      // Handle different response structures based on the league
      if (sport === 'basketball') {
        if (league === 'mens-college-basketball' || league === 'womens-college-basketball') {
          // College basketball has a different structure
          return data.sports[0].leagues[0].teams;
        } else {
          // NBA and WNBA have the same structure
          return data.sports[0].leagues[0].teams.map((team: any) => team.team);
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ESPN ${league} teams:`, error);
      toast.error(`Failed to fetch teams from ESPN (${league})`);
      return [];
    }
  },
  
  /**
   * Fetch NBA teams (legacy method, kept for backward compatibility)
   */
  async fetchNBATeams(): Promise<ESPNTeam[]> {
    return this.fetchTeams('basketball', 'nba');
  },
  
  /**
   * Fetch roster for a specific team
   */
  async fetchTeamRoster(sport: string, league: string, teamId: string): Promise<ESPNAthlete[]> {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/roster`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch team roster');
      }
      
      const data = await response.json();
      return data.athletes;
    } catch (error) {
      console.error("Error fetching team roster:", error);
      toast.error("Failed to fetch team roster from ESPN");
      return [];
    }
  },
  
  /**
   * Fetch team statistics
   */
  async fetchTeamStats(sport: string, league: string, teamId: string): Promise<any> {
    try {
      // This endpoint is theoretical - ESPN API doesn't have a direct stats endpoint in their public API
      // In a real app, you'd either use their paid API or a different data provider
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/statistics`);
      
      if (!response.ok) {
        console.warn('Stats API not available, using mock data');
        return this.getMockTeamStats();
      }
      
      return await response.json();
    } catch (error) {
      console.warn("Using mock team stats:", error);
      return this.getMockTeamStats();
    }
  },
  
  /**
   * Get mock team statistics for development
   */
  getMockTeamStats(): any {
    return {
      ppg: 105.4,
      oppg: 98.7,
      rpg: 42.3,
      apg: 23.5,
      spg: 7.8,
      bpg: 5.2,
      fgPercent: 46.3,
      threePointPercent: 35.8,
      ftPercent: 77.2,
      topf: 13.1
    };
  },
  
  /**
   * Get mock player statistics for development
   */
  getMockPlayerStats(playerIndex: number = 0): PlayerStats {
    const statProfiles = [
      // Star player
      {
        ppg: 24.5,
        rpg: 6.8,
        apg: 5.2,
        spg: 1.7,
        bpg: 0.5,
        fgPercent: 48.3,
        threePointPercent: 37.9,
        ftPercent: 86.5
      },
      // Big man
      {
        ppg: 16.8,
        rpg: 10.9,
        apg: 2.1,
        spg: 0.6,
        bpg: 1.9,
        fgPercent: 59.7,
        threePointPercent: 25.3,
        ftPercent: 68.2
      },
      // Point guard
      {
        ppg: 18.1,
        rpg: 3.5,
        apg: 8.7,
        spg: 1.8,
        bpg: 0.2,
        fgPercent: 44.1,
        threePointPercent: 39.8,
        ftPercent: 89.1
      },
      // Role player
      {
        ppg: 11.3,
        rpg: 4.2,
        apg: 1.8,
        spg: 0.9,
        bpg: 0.4,
        fgPercent: 45.7,
        threePointPercent: 38.2,
        ftPercent: 79.6
      }
    ];
    
    const index = playerIndex % statProfiles.length;
    return statProfiles[index];
  },
  
  /**
   * Convert ESPN team to our TeamRoster format with mock stats
   */
  convertToTeamRoster(espnTeam: ESPNTeam, athletes: ESPNAthlete[]): TeamRoster {
    const players: Player[] = athletes.map((athlete, index) => {
      // Get mock stats based on player position
      const mockStats = this.getMockPlayerStats(index);
      
      return {
        id: `player-${athlete.id}`,
        name: athlete.displayName,
        number: athlete.jersey || "0",
        position: athlete.position?.abbreviation || "N/A",
        notes: `${athlete.position?.displayName || "Player"}`,
        stats: mockStats
      };
    });
    
    return {
      id: `team-${espnTeam.id}`,
      name: espnTeam.displayName,
      players
    };
  }
};
