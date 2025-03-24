
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
  // Extended fields needed by the UI
  teamName?: string;
  logo?: string;
  conference?: string;
  division?: string;
  record?: string;
  color?: string;
  coach?: string;
  strengths?: { text: string }[];
  weaknesses?: { text: string }[];
  offensiveStyle?: string;
  defensiveStyle?: string;
  keyStats?: Record<string, { value: string | number; trend?: 'up' | 'down' | 'neutral' }>;
  playerStats?: {
    id: string;
    name: string;
    position: string;
    jersey: string;
    stats: {
      pts: number;
      reb: number;
      ast: number;
      fgp: number;
      tpp: number;
    };
  }[];
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
    
    // Generate mock player stats
    const playerStats = athletes.slice(0, 10).map(athlete => ({
      id: athlete.id,
      name: athlete.displayName,
      position: athlete.position?.name || "Unknown",
      jersey: athlete.jersey || "00",
      stats: {
        pts: Math.floor(Math.random() * 20) + 2,  // 2-22 points
        reb: Math.floor(Math.random() * 10) + 1,  // 1-11 rebounds
        ast: Math.floor(Math.random() * 8) + 1,   // 1-9 assists
        fgp: Math.floor(Math.random() * 30) + 40, // 40-70 FG%
        tpp: Math.floor(Math.random() * 25) + 25  // 25-50 3P%
      }
    }));

    // Generate mock key stats
    const keyStats = {
      'PPG': { value: Math.floor(Math.random() * 30) + 65, trend: 'up' as const },
      'RPG': { value: Math.floor(Math.random() * 15) + 30, trend: 'down' as const },
      'APG': { value: Math.floor(Math.random() * 10) + 15, trend: 'neutral' as const },
      'FG%': { value: Math.floor(Math.random() * 10) + 40, trend: 'up' as const },
      '3P%': { value: Math.floor(Math.random() * 10) + 30, trend: 'down' as const }
    };
    
    // Generate mock strengths and weaknesses
    const strengths = [
      { text: "Strong perimeter defense" },
      { text: "Efficient 3-point shooting" },
      { text: "Excellent ball movement" }
    ];
    
    const weaknesses = [
      { text: "Vulnerable in transition" },
      { text: "Poor free throw shooting" },
      { text: "Limited frontcourt depth" }
    ];
    
    // Compile report with extended data for the UI
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
      },
      // Extended properties for UI
      teamName: team.displayName,
      logo: team.logos?.[0]?.href || null,
      conference: team.conference?.name || "N/A",
      division: team.groups?.name || "N/A",
      record: team.record?.items?.[0]?.summary || "N/A",
      color: team.color || "#000000",
      coach: team.coach?.name || "N/A",
      strengths,
      weaknesses,
      offensiveStyle: "Uptempo offense focused on creating open three-point opportunities and attacking the rim.",
      defensiveStyle: "Man-to-man defense with aggressive ball pressure and help rotation.",
      keyStats,
      playerStats
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
