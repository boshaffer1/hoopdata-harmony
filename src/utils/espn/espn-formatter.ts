
import { TeamRoster, Player } from "@/types/analyzer";
import { ESPNTeam, ESPNAthlete, ESPNConference } from "./espn-client";

/**
 * Handles formatting and conversion of ESPN data to application models
 */
export class ESPNFormatter {
  // These are the Power conferences in NCAA basketball
  private static readonly powerConferences = [
    "ACC", "Big 12", "Big East", "Big Ten", "Pac-12", "SEC"
  ];
  
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
      
      // Convert to proper Player type with required fields
      return {
        id: `player-${athlete.id}`,
        name: athlete.displayName || `${athlete.firstName} ${athlete.lastName}`,
        number,
        position,
        height: athlete.height ? `${Math.floor(athlete.height / 12)}'${athlete.height % 12}"` : "",
        year: athlete.class || "",
        hometown: athlete.hometown?.name || "",
        notes: notes.trim(),
        headshot: athlete.headshot?.href || "",
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
}
