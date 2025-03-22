
import { TeamRoster, Player } from "@/types/analyzer";

// Extend the ESPN API types
export interface ESPNTeam {
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
  conference?: {
    id: string;
    name: string;
    shortName: string;
  };
  rank?: number;
}

interface ESPNAthlete {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  jersey?: string;
  position?: {
    name: string;
    abbreviation: string;
  };
  headshot?: {
    href: string;
  };
  height?: number;
  weight?: number;
  class?: string;
  hometown?: {
    name: string;
  };
  status?: {
    id: string;
    name: string;
  };
}

// Type for conference data
export interface ESPNConference {
  id: string;
  name: string;
  shortName: string;
  teams: ESPNTeam[];
}

// Use class to organize ESPN-related methods
export class ESPNService {
  // ESPN API base URLs
  private static readonly baseUrl = "https://site.api.espn.com/apis";
  
  // These are the Power conferences in NCAA basketball
  private static readonly powerConferences = [
    "ACC", "Big 12", "Big East", "Big Ten", "Pac-12", "SEC"
  ];
  
  /**
   * Fetch teams from ESPN API
   */
  static async fetchTeams(sport: string, leagueId: string): Promise<ESPNTeam[]> {
    try {
      // Different endpoints for college vs pro
      let url = "";
      if (leagueId.includes("college")) {
        url = `${this.baseUrl}/site/espn/${sport}/collegebasketball/teams?groups=50&limit=500`;
      } else {
        url = `${this.baseUrl}/site/espn/${sport}/teams?limit=50`;
      }
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Handle different response formats
      let teams: ESPNTeam[] = [];
      
      if (leagueId.includes("college")) {
        // College teams are nested under conferences
        if (data.sports?.[0]?.leagues?.[0]?.groups) {
          const groups = data.sports[0].leagues[0].groups;
          
          groups.forEach((group: any) => {
            if (group.teams) {
              group.teams.forEach((teamObj: any) => {
                if (teamObj.team) {
                  // Add conference info to the team object
                  const team = teamObj.team;
                  team.conference = {
                    id: group.id,
                    name: group.name,
                    shortName: group.shortName || group.name
                  };
                  teams.push(team);
                }
              });
            }
          });
        }
      } else {
        // Pro leagues have a different structure
        if (data.sports?.[0]?.leagues?.[0]?.teams) {
          teams = data.sports[0].leagues[0].teams.map((teamObj: any) => teamObj.team);
        }
      }
      
      // Log the number of teams found
      console.log(`Fetched ${teams.length} teams for ${leagueId}`);
      return teams;
    } catch (error) {
      console.error(`Error fetching teams from ESPN API:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch a team's roster from ESPN API
   */
  static async fetchTeamRoster(
    sport: string, 
    leagueId: string, 
    teamId: string
  ): Promise<ESPNAthlete[]> {
    try {
      // Different endpoints for college vs pro
      let url = "";
      if (leagueId.includes("college")) {
        url = `${this.baseUrl}/site/espn/${sport}/collegebasketball/team/roster?team=${teamId}`;
      } else {
        url = `${this.baseUrl}/site/espn/${sport}/team/roster?team=${teamId}`;
      }
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API roster error: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Extract athletes from response
      let athletes: ESPNAthlete[] = [];
      
      if (data?.athletes) {
        athletes = data.athletes;
      }
      
      console.log(`Fetched ${athletes.length} players for team ${teamId}`);
      return athletes;
    } catch (error) {
      console.error(`Error fetching team roster from ESPN API:`, error);
      throw error;
    }
  }
  
  /**
   * Convert ESPN data to our app's TeamRoster format
   */
  static convertToTeamRoster(team: ESPNTeam, athletes: ESPNAthlete[]): TeamRoster {
    // Safely extract conference from team
    const conferenceName = team.conference?.name || "Unknown Conference";
    const isCollegeTeam = !!team.conference;
    
    // Convert ESPN athletes to our Player format
    const players = athletes.map(athlete => {
      // Safe extraction of nullable properties
      const number = athlete.jersey || "";
      const position = athlete.position?.name || "";
      
      // Build player notes with available information
      let notes = "";
      if (athlete.class) notes += `Class: ${athlete.class}. `;
      if (athlete.hometown?.name) notes += `From: ${athlete.hometown.name}. `;
      if (athlete.height) {
        const feet = Math.floor(athlete.height / 12);
        const inches = athlete.height % 12;
        notes += `Height: ${feet}'${inches}". `;
      }
      if (athlete.weight) notes += `Weight: ${athlete.weight} lbs. `;
      
      return {
        name: athlete.displayName || `${athlete.firstName} ${athlete.lastName}`,
        number,
        position,
        notes: notes.trim(),
        // Include headshot URL if available
        headshot: athlete.headshot?.href || "",
        // Include original ESPN data for reference
        espnId: athlete.id
      };
    });
    
    // Create the team roster object
    return {
      id: team.id,
      name: team.displayName,
      abbreviation: team.abbreviation,
      color: team.color || "#000000",
      conference: conferenceName,
      isCollegeTeam,
      players
    };
  }
  
  /**
   * Group teams by conference
   */
  static groupTeamsByConference(teams: ESPNTeam[]): ESPNConference[] {
    const conferenceMap = new Map<string, ESPNConference>();
    
    // Process each team
    teams.forEach(team => {
      if (team.conference) {
        const confId = team.conference.id;
        
        if (!conferenceMap.has(confId)) {
          conferenceMap.set(confId, {
            id: confId,
            name: team.conference.name,
            shortName: team.conference.shortName,
            teams: []
          });
        }
        
        conferenceMap.get(confId)?.teams.push(team);
      }
    });
    
    // Convert map to array and sort conferences
    return Array.from(conferenceMap.values()).sort((a, b) => {
      // Sort Power conferences first
      const aIsPower = this.powerConferences.includes(a.shortName);
      const bIsPower = this.powerConferences.includes(b.shortName);
      
      if (aIsPower && !bIsPower) return -1;
      if (!aIsPower && bIsPower) return 1;
      
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  }
  
  /**
   * Generate an enhanced scouting report for a team
   */
  static generateEnhancedScoutingReport(team: ESPNTeam, athletes: ESPNAthlete[]): any {
    // Extract team info
    const teamInfo = {
      id: team.id,
      name: team.displayName,
      abbreviation: team.abbreviation,
      conference: team.conference?.name || "N/A",
      rank: team.rank || "Unranked",
      color: team.color || "#000000"
    };
    
    // Process roster by position
    const rosterByPosition: Record<string, any[]> = {};
    
    athletes.forEach(athlete => {
      const position = athlete.position?.name || "Unknown";
      
      if (!rosterByPosition[position]) {
        rosterByPosition[position] = [];
      }
      
      rosterByPosition[position].push({
        id: athlete.id,
        name: athlete.displayName,
        number: athlete.jersey || "N/A",
        class: athlete.class || "N/A",
        height: athlete.height 
          ? `${Math.floor(athlete.height / 12)}'${athlete.height % 12}"`
          : "N/A",
        weight: athlete.weight ? `${athlete.weight} lbs` : "N/A",
        hometown: athlete.hometown?.name || "N/A",
        headshot: athlete.headshot?.href || null
      });
    });
    
    // Calculate roster summary
    const totalPlayers = athletes.length;
    const returningPlayers = athletes.filter(a => a.status?.name !== "Transferred").length;
    const freshmen = athletes.filter(a => a.class?.toLowerCase().includes("freshman")).length;
    
    // Calculate size metrics
    let totalHeight = 0;
    let playersWithHeight = 0;
    
    athletes.forEach(athlete => {
      if (athlete.height) {
        totalHeight += athlete.height;
        playersWithHeight++;
      }
    });
    
    const averageHeight = playersWithHeight > 0 
      ? Math.round(totalHeight / playersWithHeight) 
      : 0;
    
    const avgHeightFeet = Math.floor(averageHeight / 12);
    const avgHeightInches = averageHeight % 12;
    
    // Compile report
    return {
      team: teamInfo,
      roster: rosterByPosition,
      summary: {
        totalPlayers,
        returningPlayers,
        freshmen,
        averageHeight: `${avgHeightFeet}'${avgHeightInches}"`,
        starPlayers: athletes
          .filter(a => a.status?.name === "Active" && a.jersey) // Only include active players with jerseys
          .sort((a, b) => (parseInt(a.jersey || "999") - parseInt(b.jersey || "999"))) // Sort by jersey number
          .slice(0, 3) // Take top 3
          .map(p => ({
            name: p.displayName,
            number: p.jersey,
            position: p.position?.name
          }))
      }
    };
  }
}
