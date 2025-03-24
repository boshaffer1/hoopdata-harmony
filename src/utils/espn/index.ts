import { ESPNClient, ESPNTeam } from "./espn-client";
import { ESPNFormatter } from "./espn-formatter";
import { ScoutingReportGenerator, ScoutingReport } from "./scouting-report";
import { TeamRoster } from "@/types/analyzer";
import { mockNBATeams, mockNCAATeams, mockWNBATeams, mockScoutingReport } from "./mock-data";

export { ESPNService };
export type { ESPNTeam, TeamWithConference, ScoutingReport };

export interface TeamWithConference extends ESPNTeam {
  conference?: {
    id: string;
    name: string;
    shortName: string;
  };
  record?: string;
  division?: string;
}

/**
 * Main ESPN service file that re-exports from the modular structure
 * This maintains backward compatibility with the rest of the codebase
 */
export class ESPNService {
  private static useMockData = false;

  /**
   * Fetch teams by conference
   */
  static async getTeamsByConference(sport: string, leagueId: string): Promise<Record<string, TeamWithConference[]>> {
    try {
      if (this.useMockData) {
        return this.getMockTeams(leagueId);
      }

      try {
        const teams = await ESPNClient.fetchTeams(sport, leagueId);
        
        if (leagueId.includes('college')) {
          const conferencesMap: Record<string, TeamWithConference[]> = {};
          
          teams.forEach(team => {
            if (team.conference) {
              const conferenceName = team.conference.name;
              
              if (!conferencesMap[conferenceName]) {
                conferencesMap[conferenceName] = [];
              }
              
              conferencesMap[conferenceName].push(team);
            }
          });
          
          return conferencesMap;
        } 
        else {
          const divisionsMap: Record<string, TeamWithConference[]> = {};
          
          teams.forEach(team => {
            let groupName = "All Teams";
            
            if (team.division) {
              groupName = team.division;
            } else if (team.conference && team.conference.name) {
              groupName = team.conference.name;
            }
            
            if (!divisionsMap[groupName]) {
              divisionsMap[groupName] = [];
            }
            
            divisionsMap[groupName].push(team);
          });
          
          return divisionsMap;
        }
      } catch (error) {
        console.error(`Error fetching real data, falling back to mock data:`, error);
        return this.getMockTeams(leagueId);
      }
    } catch (error) {
      console.error(`Error grouping teams by conference:`, error);
      return this.getMockTeams(leagueId);
    }
  }

  /**
   * Get mock teams based on league ID
   */
  private static getMockTeams(leagueId: string): Record<string, TeamWithConference[]> {
    console.log(`Using mock data for ${leagueId}`);
    
    if (leagueId === 'nba') {
      return mockNBATeams;
    } else if (leagueId === 'wnba') {
      return mockWNBATeams;
    } else if (leagueId.includes('college')) {
      return mockNCAATeams;
    }
    
    return mockNBATeams;
  }

  /**
   * Get scouting report for a team
   */
  static async getScoutingReport(sport: string, leagueId: string, teamId: string): Promise<ScoutingReport> {
    try {
      if (this.useMockData) {
        return { ...mockScoutingReport, id: teamId };
      }
      
      try {
        const teams = await ESPNClient.fetchTeams(sport, leagueId);
        const team = teams.find(t => t.id === teamId);
        
        if (!team) {
          throw new Error(`Team with ID ${teamId} not found`);
        }
        
        const athletes = await ESPNClient.fetchTeamRoster(sport, leagueId, teamId);
        
        const scoutingReport = ScoutingReportGenerator.generateReport(team, athletes);
        return scoutingReport;
      } catch (error) {
        console.error(`Error fetching real data, falling back to mock report:`, error);
        return { ...mockScoutingReport, id: teamId };
      }
    } catch (error) {
      console.error(`Error getting scouting report:`, error);
      return { ...mockScoutingReport, id: teamId };
    }
  }

  /**
   * Generate PDF of scouting report
   */
  static async generateScoutingReportPDF(report: ScoutingReport): Promise<string> {
    return ScoutingReportGenerator.generatePDF(report);
  }
  
  /**
   * Fetch teams from ESPN API - delegated to client
   */
  static async fetchTeams(sport: string, leagueId: string): Promise<ESPNTeam[]> {
    try {
      if (this.useMockData) {
        const mockData = this.getMockTeams(leagueId);
        return Object.values(mockData).flat();
      }
      
      return await ESPNClient.fetchTeams(sport, leagueId);
    } catch (error) {
      console.error(`Error fetching teams, using mock data:`, error);
      const mockData = this.getMockTeams(leagueId);
      return Object.values(mockData).flat();
    }
  }
  
  /**
   * Fetch a team's roster from ESPN API - delegated to client
   */
  static async fetchTeamRoster(
    sport: string, 
    leagueId: string, 
    teamId: string
  ) {
    try {
      if (this.useMockData) {
        return [];
      }
      
      return await ESPNClient.fetchTeamRoster(sport, leagueId, teamId);
    } catch (error) {
      console.error(`Error fetching team roster, using empty array:`, error);
      return [];
    }
  }
  
  /**
   * Convert ESPN data to our app's TeamRoster format - delegated to formatter
   */
  static convertToTeamRoster(team: ESPNTeam, athletes: any[]): TeamRoster {
    return ESPNFormatter.convertToTeamRoster(team, athletes);
  }
  
  /**
   * Group teams by conference - delegated to formatter
   */
  static groupTeamsByConference(teams: ESPNTeam[]) {
    return ESPNFormatter.groupTeamsByConference(teams);
  }
  
  /**
   * Generate an enhanced scouting report for a team - delegated to generator
   */
  static generateEnhancedScoutingReport(team: ESPNTeam, athletes: any[]) {
    return ScoutingReportGenerator.generateReport(team, athletes);
  }
  
  /**
   * Toggle mock data mode (useful for testing or when API is unreliable)
   */
  static setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    console.log(`ESPN Service mock data mode ${useMock ? 'enabled' : 'disabled'}`);
  }
}
