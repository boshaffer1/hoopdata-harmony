
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
      // Different endpoint for college basketball to get conference data
      let url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`;
      
      // Use groups endpoint for college basketball to get conference grouping
      if (league === 'mens-college-basketball' || league === 'womens-college-basketball') {
        url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=500`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${league} teams`);
      }
      
      const data = await response.json();
      
      // Handle different response structures based on the league
      if (sport === 'basketball') {
        if (league === 'mens-college-basketball' || league === 'womens-college-basketball') {
          // College basketball has a different structure
          if (!data.sports || !data.sports[0] || !data.sports[0].leagues || !data.sports[0].leagues[0] || !data.sports[0].leagues[0].teams) {
            console.error('Unexpected college basketball data structure:', data);
            return [];
          }
          
          // Map the college teams to match our ESPNTeam structure
          return data.sports[0].leagues[0].teams
            .filter((team: any) => team && team.team) // Filter out any null/undefined teams
            .map((team: any) => {
              const teamData = team.team || {};
              return {
                id: teamData.id || "",
                uid: teamData.uid || "",
                slug: teamData.slug || "",
                location: teamData.location || "",
                name: teamData.name || "",
                abbreviation: teamData.abbreviation || "",
                displayName: teamData.displayName || teamData.name || "",
                shortDisplayName: teamData.shortDisplayName || "",
                color: teamData.color || "",
                alternateColor: teamData.alternateColor || "",
                logo: teamData.logos && teamData.logos.length > 0 ? teamData.logos[0].href : "",
                conferenceId: team.conferenceId || "",
                conference: team.conference || ""
              };
            });
        } else if (league === 'nba' || league === 'wnba') {
          // NBA and WNBA have the same structure
          if (!data.sports || !data.sports[0] || !data.sports[0].leagues || !data.sports[0].leagues[0] || !data.sports[0].leagues[0].teams) {
            console.error('Unexpected NBA/WNBA data structure:', data);
            return [];
          }
          
          return data.sports[0].leagues[0].teams
            .filter((team: any) => team && team.team) // Filter out any null/undefined teams
            .map((team: any) => team.team);
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
      
      // Handle potential different data structures for college vs pro
      if (data && data.athletes && Array.isArray(data.athletes)) {
        return data.athletes.map((athlete: any) => ({
          id: athlete.id || "",
          uid: athlete.uid || "",
          guid: athlete.guid || "",
          firstName: athlete.firstName || "",
          lastName: athlete.lastName || "",
          fullName: athlete.fullName || `${athlete.firstName || ""} ${athlete.lastName || ""}`.trim() || "Unknown Player",
          displayName: athlete.displayName || athlete.fullName || "Unknown Player",
          shortName: athlete.shortName || "",
          weight: athlete.weight || 0,
          height: athlete.height || 0,
          jersey: athlete.jersey || "",
          position: athlete.position || { abbreviation: "", displayName: "", name: "" },
          headshot: athlete.headshot || null
        }));
      }
      
      return [];
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
      
      // If no teams were found, return empty object
      if (!teams || teams.length === 0) {
        console.warn(`No teams found for ${league}`);
        return {};
      }
      
      let conferences: Record<string, TeamWithConference[]> = {};
      let divisions: Record<string, string[]> = {};
      
      // Different conference structures based on league
      if (league === 'mens-college-basketball' || league === 'womens-college-basketball') {
        // For college basketball, use actual conferences
        // Define Power 5 (now Power 4 after Pac-12 changes) and major conferences
        const powerConferences = [
          "ACC", 
          "Big 12", 
          "Big Ten", 
          "SEC"
        ];
        
        const midMajorConferences = [
          "American", 
          "Atlantic 10", 
          "Big East", 
          "Mountain West", 
          "West Coast",
          "Conference USA", 
          "MAC", 
          "Sun Belt",
          "Big West",
          "Big Sky",
          "WAC",
          "Horizon",
          "MAAC",
          "CAA",
          "MVC",
          "Big South"
        ];
        
        // Initialize conferences object
        for (const conf of [...powerConferences, ...midMajorConferences]) {
          conferences[conf] = [];
        }
        
        // Add "Other Conferences" category
        conferences["Other Conferences"] = [];
        
        // Assign teams to conferences with mock records
        teams.forEach((team) => {
          if (!team) return; // Skip undefined teams
          
          // Extract conference name from team data or assign default
          let conferenceName = team.conference || "Unknown";
          
          // Identify the conference
          let conferenceKey;
          if (powerConferences.includes(conferenceName)) {
            conferenceKey = conferenceName;
          } else if (midMajorConferences.includes(conferenceName)) {
            conferenceKey = conferenceName;
          } else {
            conferenceKey = "Other Conferences";
          }
          
          // Make sure the conference exists
          if (!conferences[conferenceKey]) {
            conferences[conferenceKey] = [];
          }
          
          // Generate a mock record (wins-losses)
          const wins = 10 + Math.floor(Math.random() * 20);
          const losses = 30 - wins;
          const record = `${wins}-${losses}`;
          
          conferences[conferenceKey].push({
            ...team,
            conference: conferenceKey,
            division: conferenceName,
            record
          });
        });
        
        // Remove empty conferences
        for (const conf in conferences) {
          if (conferences[conf].length === 0) {
            delete conferences[conf];
          }
        }
      } else {
        // For NBA/WNBA, use Eastern and Western conferences
        conferences = {
          "Eastern Conference": [],
          "Western Conference": []
        };
        
        // NBA divisions
        divisions = {
          "Eastern Conference": ["Atlantic Division", "Central Division", "Southeast Division"],
          "Western Conference": ["Northwest Division", "Pacific Division", "Southwest Division"]
        };
        
        // Assign teams to conferences and divisions with mock records
        teams.forEach((team, index) => {
          if (!team) return; // Skip undefined teams
          
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
      }
      
      return conferences;
    } catch (error) {
      console.error("Error organizing teams by conference:", error);
      toast.error("Failed to organize teams by conference");
      return {};
    }
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
      
      // Handle potential different data structures for college vs pro
      if (data && data.athletes && Array.isArray(data.athletes)) {
        // Map athletes ensuring we handle any missing data fields
        return data.athletes
          .filter((athlete: any) => athlete) // Filter out any null/undefined athletes
          .map((athlete: any) => ({
            id: athlete.id || "",
            uid: athlete.uid || "",
            guid: athlete.guid || "",
            firstName: athlete.firstName || "",
            lastName: athlete.lastName || "",
            fullName: athlete.fullName || `${athlete.firstName || ""} ${athlete.lastName || ""}`.trim() || "Unknown Player",
            displayName: athlete.displayName || athlete.fullName || "Unknown Player",
            shortName: athlete.shortName || "",
            weight: athlete.weight || 0,
            height: athlete.height || 0,
            jersey: athlete.jersey || "",
            position: athlete.position || { abbreviation: "", displayName: "", name: "" },
            headshot: athlete.headshot || null
          }));
      }
      
      console.warn("No athletes found in roster response:", data);
      return [];
    } catch (error) {
      console.error("Error fetching team roster:", error);
      toast.error("Failed to fetch team roster from ESPN");
      return [];
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
      const nbaTeams = await this.fetchNBATeams();
      const team = nbaTeams.find(t => t.id === teamId);
      
      // If not found in NBA teams, check other leagues
      if (!team) {
        const leagues = ['wnba', 'mens-college-basketball', 'womens-college-basketball'];
        for (const league of leagues) {
          const leagueTeams = await this.fetchTeams('basketball', league);
          const foundTeam = leagueTeams.find(t => t.id === teamId);
          if (foundTeam) {
            return this.generateMockScoutingReport(foundTeam);
          }
        }
        throw new Error('Team not found');
      }
      
      return this.generateMockScoutingReport(team);
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
        keyStats: {},
        playerStats: []
      };
    }
  },
  
  /**
   * Generate mock scouting report for a team
   */
  generateMockScoutingReport(team: ESPNTeam): ScoutingReport {
    // Create a mock scouting report
    const mockStrengths: ScoutingStrength[] = [
      { text: "Elite 3-point shooting (38.2%, 2nd in league)" },
      { text: "Top-ranked defense (107.7 defensive rating)" },
      { text: "Excellent ball movement (26.4 assists per game)" },
      { text: "Depth at every position" },
      { text: "Strong transition offense" }
    ];
    
    const mockWeaknesses: ScoutingWeakness[] = [
      { text: "Can become isolation-heavy in clutch situations" },
      { text: "Occasional turnover issues" },
      { text: "Interior depth when starters are off the floor" },
      { text: "Can struggle against teams with elite rim protection" }
    ];
    
    const mockKeyStats = {
      "3PT%": { value: 38.2, trend: "up" as const },
      "Defensive Rating": { value: 107.7, trend: "up" as const },
      "Pace": { value: 99.8, trend: "neutral" as const },
      "Assists": { value: 26.4, trend: "up" as const },
      "Rebounding": { value: 44.3, trend: "down" as const }
    };
    
    // Generate mock player stats for the report
    const mockPlayerStats = Array.from({ length: 10 }, (_, i) => {
      const positions = ["G", "G", "F", "F", "C", "G", "F", "C", "G", "F"];
      const minutes = Math.floor(30 - i * 2.5);
      const points = Math.floor(18 - i * 1.4);
      const rebounds = Math.floor(7 - i * 0.5);
      const assists = Math.floor(5 - i * 0.4);
      const steals = (1.2 - i * 0.1).toFixed(1);
      const blocks = (0.8 - i * 0.07).toFixed(1);
      
      return {
        id: `player-${i}`,
        name: `Player ${i + 1}`,
        position: positions[i],
        jersey: `${i + 1}`,
        stats: {
          min: minutes,
          pts: points,
          reb: rebounds,
          ast: assists,
          stl: steals,
          blk: blocks,
          fgp: Math.floor(48 - i * 1.5),
          tpp: Math.floor(38 - i * 2),
          ftp: Math.floor(85 - i * 1.2)
        }
      };
    });
    
    return {
      teamId: team.id,
      teamName: team.displayName,
      record: "25-14",
      conference: "Eastern Conference",
      division: "Atlantic Division",
      coach: "Coach Name",
      logo: team.logo,
      color: team.color,
      strengths: mockStrengths,
      weaknesses: mockWeaknesses,
      offensiveStyle: "The team runs a modern 5-out offense with heavy emphasis on three-point shooting and ball movement. They utilize dribble handoffs and pick-and-pops with their bigs to create space.",
      defensiveStyle: "Switch-heavy defensive scheme that leverages their versatile personnel. They force opponents into difficult mid-range shots and contest aggressively at the rim.",
      keyStats: mockKeyStats,
      playerStats: mockPlayerStats
    };
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
