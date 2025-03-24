
import { ESPNTeam, ESPNAthlete } from "./espn-client";

// Type for scouting report
export interface ScoutingReport {
  team: {
    id: string;
    name: string;
    abbreviation: string;
    conference: string;
    rank: string | number;
    color: string;
  };
  roster: Record<string, any[]>;
  summary: {
    totalPlayers: number;
    returningPlayers: number;
    freshmen: number;
    averageHeight: string;
    starPlayers: {
      name: string;
      number?: string;
      position?: string;
    }[];
  };
}

export class ScoutingReportGenerator {  
  /**
   * Generate an enhanced scouting report for a team
   */
  static generateReport(team: ESPNTeam, athletes: ESPNAthlete[]): ScoutingReport {
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
  
  /**
   * Generate PDF of scouting report (mock implementation)
   */
  static async generatePDF(report: ScoutingReport): Promise<string> {
    // In a real implementation, this would generate a PDF
    // For now, we'll just return a mock URL
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`https://example.com/reports/${report.team.id}_scouting_report.pdf`);
      }, 1500);
    });
  }
}
