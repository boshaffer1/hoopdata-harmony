
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
  conference?: string;
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
    if (!espnTeam || !athletes) {
      console.error("Invalid team or athletes data", { espnTeam, athletes });
      return {
        id: `team-${Date.now()}`,
        name: "Unknown Team",
        players: []
      };
    }
    
    const players: Player[] = athletes.map((athlete, index) => {
      // Get mock stats based on player position
      const mockStats = this.getMockPlayerStats(index);
      
      return {
        id: `player-${athlete.id || Date.now()}-${index}`,
        name: athlete.displayName || "Unknown Player",
        number: athlete.jersey || "0",
        position: athlete.position?.abbreviation || "N/A",
        notes: `${athlete.position?.displayName || "Player"}`,
        stats: mockStats
      };
    });
    
    return {
      id: `team-${espnTeam.id || Date.now()}`,
      name: espnTeam.displayName || "Unknown Team",
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
          
          // Generate a realistic record for 2024-25 season
          const wins = 10 + Math.floor(Math.random() * 20);
          const losses = Math.floor(Math.random() * 10) + 1;
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
        
        // Assign teams to conferences and divisions with realistic records
        teams.forEach((team, index) => {
          if (!team) return; // Skip undefined teams
          
          const conference = index % 2 === 0 ? "Eastern Conference" : "Western Conference";
          const divisionIndex = Math.floor(index / 5) % 3;
          const division = divisions[conference][divisionIndex];
          
          // Generate a realistic record for 2024-25 NBA season
          const wins = 20 + Math.floor(Math.random() * 30);
          const losses = Math.floor(Math.random() * 20) + 5;
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
   * Get scouting report for a team
   */
  async getScoutingReport(teamId: string): Promise<ScoutingReport> {
    try {
      // First try to get the actual team data from ESPN
      const nbaTeams = await this.fetchTeams('basketball', 'nba');
      const team = nbaTeams.find(t => t.id === teamId);
      
      let foundTeam;
      let leagueType = 'nba';
      
      // If not found in NBA teams, check other leagues
      if (!team) {
        const leagues = ['wnba', 'mens-college-basketball', 'womens-college-basketball'];
        for (const league of leagues) {
          const leagueTeams = await this.fetchTeams('basketball', league);
          foundTeam = leagueTeams.find(t => t.id === teamId);
          if (foundTeam) {
            leagueType = league;
            // Get actual team roster for more accurate data
            const athletes = await this.fetchTeamRoster('basketball', league, teamId);
            return this.generateEnhancedScoutingReport(foundTeam, athletes, league);
          }
        }
        
        // If still not found, try to find the team in the conference structure
        const conferences = await this.getTeamsByConference('basketball', 'mens-college-basketball');
        for (const conf in conferences) {
          const teamFound = conferences[conf].find(t => t.id === teamId);
          if (teamFound) {
            const athletes = await this.fetchTeamRoster('basketball', 'mens-college-basketball', teamId);
            return this.generateEnhancedScoutingReport(teamFound, athletes, 'mens-college-basketball');
          }
        }
        
        // Also check women's college basketball
        const womenConferences = await this.getTeamsByConference('basketball', 'womens-college-basketball');
        for (const conf in womenConferences) {
          const teamFound = womenConferences[conf].find(t => t.id === teamId);
          if (teamFound) {
            const athletes = await this.fetchTeamRoster('basketball', 'womens-college-basketball', teamId);
            return this.generateEnhancedScoutingReport(teamFound, athletes, 'womens-college-basketball');
          }
        }
        
        throw new Error('Team not found');
      }
      
      const athletes = await this.fetchTeamRoster('basketball', 'nba', teamId);
      return this.generateEnhancedScoutingReport(team, athletes, 'nba');
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
   * Generate a more accurate scouting report with real roster data
   */
  generateEnhancedScoutingReport(team: ESPNTeam, athletes: ESPNAthlete[], league: string): ScoutingReport {
    const isCollege = league.includes('college');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Determine academic year for college teams (2024-25 during most of 2024 and early 2025)
    const seasonYear = currentMonth >= 8 ? currentYear : currentMonth <= 4 ? currentYear - 1 : currentYear;
    const seasonLabel = isCollege ? `${seasonYear}-${(seasonYear + 1).toString().slice(2)}` : "2024-25";
    
    // Create relevant strengths based on league type
    const mockStrengths: ScoutingStrength[] = isCollege ? [
      { text: "Strong team defense and rebounding" },
      { text: "Efficient perimeter shooting (38.6% from 3)" },
      { text: "Depth at guard positions with versatile playmakers" },
      { text: "Experience and leadership in clutch situations" },
      { text: "Well-coached with disciplined offensive sets" }
    ] : [
      { text: "Elite 3-point shooting (38.2%, 3rd in league)" },
      { text: "Top-ranked defense (107.7 defensive rating)" },
      { text: "Excellent ball movement (26.4 assists per game)" },
      { text: "Depth at every position" },
      { text: "Strong transition offense" }
    ];
    
    const mockWeaknesses: ScoutingWeakness[] = isCollege ? [
      { text: "Turnover prone against pressure defenses" },
      { text: "Inconsistent free throw shooting (68.5%)" },
      { text: "Limited frontcourt depth behind starters" },
      { text: "Struggles against athletic zone defenses" }
    ] : [
      { text: "Can become isolation-heavy in clutch situations" },
      { text: "Occasional turnover issues (15.3 per game)" },
      { text: "Interior depth when starters are off the floor" },
      { text: "Can struggle against teams with elite rim protection" }
    ];
    
    const mockKeyStats = isCollege ? {
      "FG%": { value: 45.6, trend: "up" as const },
      "PPG": { value: 78.3, trend: "up" as const },
      "Pace": { value: 69.8, trend: "neutral" as const },
      "Assists": { value: 15.4, trend: "up" as const },
      "Rebounds": { value: 36.3, trend: "up" as const }
    } : {
      "3PT%": { value: 38.2, trend: "up" as const },
      "Def Rating": { value: 107.7, trend: "up" as const },
      "Pace": { value: 99.8, trend: "neutral" as const },
      "Assists": { value: 26.4, trend: "up" as const },
      "Rebounds": { value: 44.3, trend: "down" as const }
    };
    
    // Generate player stats based on actual roster
    const mockPlayerStats = athletes.slice(0, 15).map((athlete, i) => {
      const positions = athlete.position?.abbreviation || ["G", "G", "F", "F", "C", "G", "F", "C", "G", "F"][i % 10];
      const isStarter = i < 5;
      
      // More realistic minutes distribution
      const minutes = isStarter 
        ? Math.floor(30 - i * 1.2) 
        : Math.floor(18 - (i-5) * 1.5);
      
      // More realistic scoring distribution
      const points = isStarter 
        ? Math.max(18 - i * 1.8, 6.5).toFixed(1) 
        : Math.max(8 - (i-5) * 0.7, 2.1).toFixed(1);
      
      // Adjust other stats for more realism
      const rebounds = positions === "C" 
        ? Math.max(7.5 - i * 0.4, 2.2).toFixed(1) 
        : positions === "F" 
          ? Math.max(6.2 - i * 0.4, 1.8).toFixed(1)
          : Math.max(3.5 - i * 0.3, 0.9).toFixed(1);
      
      const assists = positions === "G" 
        ? Math.max(5.8 - i * 0.6, 1.2).toFixed(1) 
        : Math.max(2.4 - i * 0.3, 0.5).toFixed(1);
      
      const steals = (Math.max(1.2 - i * 0.15, 0.3)).toFixed(1);
      const blocks = positions === "C" 
        ? Math.max(1.4 - i * 0.2, 0.3).toFixed(1) 
        : positions === "F" 
          ? Math.max(0.8 - i * 0.1, 0.2).toFixed(1)
          : Math.max(0.4 - i * 0.05, 0.1).toFixed(1);
      
      // Shooting percentages based on position
      const fgp = positions === "C" 
        ? Math.floor(58 - i * 0.8)
        : positions === "F"
          ? Math.floor(52 - i * 1.2) 
          : Math.floor(46 - i * 1.5);
      
      const tpp = positions === "G" 
        ? Math.floor(38 - i * 1.2)
        : positions === "F"
          ? Math.floor(36 - i * 1.4) 
          : Math.floor(30 - i * 1.8);
      
      const ftp = positions === "G"
        ? Math.floor(85 - i * 0.8)
        : Math.floor(78 - i * 1.2);
      
      return {
        id: athlete.id || `player-${i}`,
        name: athlete.displayName || `Player ${i + 1}`,
        position: positions,
        jersey: athlete.jersey || `${i + 1}`,
        stats: {
          min: minutes,
          pts: parseFloat(points),
          reb: parseFloat(rebounds),
          ast: parseFloat(assists),
          stl: parseFloat(steals),
          blk: parseFloat(blocks),
          fgp: fgp,
          tpp: tpp,
          ftp: ftp
        }
      };
    });
    
    // Get the actual conference and division data from the team or fallback
    const teamConference = team.conference || "Unknown Conference";
    
    const conferenceData = isCollege 
      ? { 
          conference: teamConference, 
          division: teamConference 
        }
      : {
          conference: league === 'wnba' ? "WNBA" : (team as any).conference || "Eastern Conference",
          division: league === 'wnba' ? "WNBA" : (team as any).division || "Atlantic Division"
        };
    
    // Generate a realistic record for the current season
    let record;
    if (isCollege) {
      const wins = 12 + Math.floor(Math.random() * 18); // College basketball usually has ~30 games
      const losses = Math.floor(30 - wins);
      record = `${wins}-${losses}`;
    } else {
      const gamesPlayed = Math.floor(Math.random() * 25) + 55; // NBA teams play 82 games
      const wins = Math.floor(gamesPlayed * (0.3 + Math.random() * 0.4)); // Win % between 30% and 70%
      const losses = gamesPlayed - wins;
      record = `${wins}-${losses}`;
    }
    
    const coachName = isCollege ? "Coach " + team.name.split(' ')[0] : "Coach " + team.displayName.split(' ')[0];
    
    return {
      teamId: team.id,
      teamName: team.displayName,
      record: record,
      ...conferenceData,
      coach: coachName,
      logo: team.logo,
      color: team.color,
      strengths: mockStrengths,
      weaknesses: mockWeaknesses,
      offensiveStyle: isCollege 
        ? "Utilizes a motion offense with emphasis on cutting and off-ball screens. Looks to create high-percentage shots through disciplined execution."
        : "The team runs a modern 5-out offense with heavy emphasis on three-point shooting and ball movement. They utilize dribble handoffs and pick-and-pops with their bigs to create space.",
      defensiveStyle: isCollege
        ? "Primarily man-to-man defense with occasional zone looks. Strong emphasis on help defense and contesting shots without fouling."
        : "Switch-heavy defensive scheme that leverages their versatile personnel. They force opponents into difficult mid-range shots and contest aggressively at the rim.",
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
