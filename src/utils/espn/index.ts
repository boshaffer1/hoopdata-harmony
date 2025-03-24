
import { ESPNClient, ESPNTeam } from "./espn-client";
import { ESPNFormatter } from "./espn-formatter";
import { ScoutingReportGenerator, ScoutingReport } from "./scouting-report";
import { TeamRoster } from "@/types/analyzer";

// Export all the types for external use
export type { ESPNTeam, ScoutingReport };

// Export the TeamWithConference interface for use in Scouting.tsx
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
 * Main ESPN Service that coordinates the client, formatter, and report generator
 */
export class ESPNService {
  /**
   * Fetch teams by conference
   */
  static async getTeamsByConference(sport: string, leagueId: string): Promise<Record<string, TeamWithConference[]>> {
    try {
      // Fetch teams first
      const teams = await ESPNClient.fetchTeams(sport, leagueId);
      
      // For college basketball, group by conference
      if (leagueId.includes('college')) {
        const conferencesMap: Record<string, TeamWithConference[]> = {};
        
        // Group teams by conference name
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
      // For pro leagues, group by division or conference
      else {
        const divisionsMap: Record<string, TeamWithConference[]> = {};
        
        // Group teams first by conference/division
        teams.forEach(team => {
          let groupName = "All Teams";
          
          // Try to get division or conference from team data
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
      console.error(`Error grouping teams by conference:`, error);
      throw error;
    }
  }

  /**
   * Get scouting report for a team
   */
  static async getScoutingReport(sport: string, leagueId: string, teamId: string): Promise<ScoutingReport> {
    try {
      // Fetch team data and roster
      const teams = await ESPNClient.fetchTeams(sport, leagueId);
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      const athletes = await ESPNClient.fetchTeamRoster(sport, leagueId, teamId);
      
      // Generate enhanced scouting report
      const scoutingReport = ScoutingReportGenerator.generateReport(team, athletes);
      return scoutingReport;
    } catch (error) {
      console.error(`Error getting scouting report:`, error);
      throw error;
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
    return ESPNClient.fetchTeams(sport, leagueId);
  }
  
  /**
   * Fetch a team's roster from ESPN API - delegated to client
   */
  static async fetchTeamRoster(
    sport: string, 
    leagueId: string, 
    teamId: string
  ) {
    return ESPNClient.fetchTeamRoster(sport, leagueId, teamId);
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
}
