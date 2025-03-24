
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

export interface TeamWithConference extends ESPNTeam {
  conference: string;
  division: string;
  record: string;
}

export interface ScoutingStrength {
  text: string;
  value?: number;
  rating?: string;
}

export interface ScoutingWeakness {
  text: string;
}

export interface ScoutingReport {
  teamId: string;
  teamName: string;
  record: string;
  conference: string;
  division: string;
  coach: string;
  logo?: string;
  color?: string;
  strengths: ScoutingStrength[];
  weaknesses: ScoutingWeakness[];
  offensiveStyle: string;
  defensiveStyle: string;
  keyStats: {
    [key: string]: {
      value: number | string;
      trend?: 'up' | 'down' | 'neutral';
    };
  };
  playerStats?: any[];
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
  },

  /**
   * Get teams organized by conference and division with mock records
   */
  async getTeamsByConference(sport: string = 'basketball', league: string = 'nba'): Promise<Record<string, TeamWithConference[]>> {
    try {
      const teams = await this.fetchTeams(sport, league);
      
      // For the NBA, we'll organize into Eastern and Western conferences
      const conferences: Record<string, TeamWithConference[]> = {
        "Eastern Conference": [],
        "Western Conference": []
      };
      
      // NBA divisions
      const divisions = {
        "Eastern Conference": ["Atlantic Division", "Central Division", "Southeast Division"],
        "Western Conference": ["Northwest Division", "Pacific Division", "Southwest Division"]
      };
      
      // Assign teams to conferences and divisions with mock records
      teams.forEach((team, index) => {
        const conference = index % 2 === 0 ? "Eastern Conference" : "Western Conference";
        const divisionIndex = Math.floor(index / 5) % 3;
        const division = divisions[conference][divisionIndex];
        
        // Generate a mock record (wins-losses)
        const wins = 20 + Math.floor(Math.random() * 35);
        const losses = 82 - wins;
        const record = `${wins}-${losses}`;
        
        conferences[conference].push({
          ...team,
          conference,
          division,
          record
        });
      });
      
      return conferences;
    } catch (error) {
      console.error("Error organizing teams by conference:", error);
      toast.error("Failed to organize teams by conference");
      return {
        "Eastern Conference": [],
        "Western Conference": []
      };
    }
  },

  /**
   * Get scouting report for a team
   */
  async getScoutingReport(teamId: string): Promise<ScoutingReport> {
    try {
      // In a real app, this would fetch from a backend API
      // We'll generate mock data for this example
      
      // First try to get the actual team data from ESPN
      const teams = await this.fetchNBATeams();
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      // Create a mock scouting report
      const mockStrengths: ScoutingStrength[] = [
        { text: "Elite 3-point shooting (38.2%, 2nd in NBA)" },
        { text: "Top-ranked defense (107.7 defensive rating)" },
        { text: "Excellent ball movement (26.4 assists per game)" },
        { text: "Depth at every position" },
        { text: "Strong transition offense" }
      ];
      
      const mockWeaknesses: ScoutingWeakness[] = [
        { text: "Can become isolation-heavy in clutch situations" },
        { text: "Occasional turnover issues" },
        { text: "Interior depth when Porzingis is off the floor" },
        { text: "Can struggle against teams with elite rim protection" }
      ];
      
      const mockKeyStats = {
        "3PT%": { value: 38.2, trend: "up" as const },
        "Defensive Rating": { value: 107.7, trend: "up" as const },
        "Pace": { value: 99.8, trend: "neutral" as const },
        "Assists": { value: 26.4, trend: "up" as const },
        "Rebounding": { value: 44.3, trend: "down" as const }
      };
      
      return {
        teamId: team.id,
        teamName: team.displayName,
        record: "55-14",
        conference: "Eastern Conference",
        division: "Atlantic Division",
        coach: "Joe Mazzulla",
        logo: team.logo,
        color: team.color,
        strengths: mockStrengths,
        weaknesses: mockWeaknesses,
        offensiveStyle: "The Celtics run a modern 5-out offense with heavy emphasis on three-point shooting and ball movement. They utilize dribble handoffs and pick-and-pops with their bigs to create space. Tatum and Brown initiate most offensive sets, with Holiday serving as a secondary playmaker.",
        defensiveStyle: "Switch-heavy defensive scheme that leverages their versatile personnel. They force opponents into difficult mid-range shots and contest aggressively at the rim. Holiday and Derrick White are elite perimeter defenders who disrupt opposing guards.",
        keyStats: mockKeyStats
      };
    } catch (error) {
      console.error("Error fetching scouting report:", error);
      toast.error("Failed to fetch scouting report");
      
      // Return a default report with an error message
      return {
        teamId: teamId,
        teamName: "Team Not Found",
        record: "N/A",
        conference: "N/A",
        division: "N/A",
        coach: "N/A",
        strengths: [],
        weaknesses: [{ text: "Error loading team data" }],
        offensiveStyle: "Not available",
        defensiveStyle: "Not available",
        keyStats: {}
      };
    }
  },

  /**
   * Generate a PDF scouting report (mock function)
   */
  async generateScoutingReportPDF(teamId: string): Promise<boolean> {
    // In a real app, this would generate a PDF on the server
    // For this mock, we'll just show a success message
    try {
      toast.success("Scouting report PDF generated successfully!");
      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
      return false;
    }
  }
};
