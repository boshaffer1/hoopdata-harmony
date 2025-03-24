
/**
 * ESPN API Client
 * Handles all direct API communication with ESPN endpoints
 */

// Base types for ESPN API responses
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
  record?: string;
  division?: string;
}

export interface ESPNAthlete {
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

export class ESPNClient {
  // ESPN API base URLs
  private static readonly baseUrl = "https://site.api.espn.com/apis";
  
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
}
