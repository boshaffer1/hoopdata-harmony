
import { SavedClip, PlayerAction, GameSituation } from "@/types/analyzer";

export interface ClipStat {
  label: string;
  count: number;
  percentage: number;
}

export interface PlayerStats {
  playerName: string;
  totalClips: number;
  actions: {
    [key: string]: number;
  };
  shotTypes?: {
    [key: string]: number;
  };
  shotLocations?: {
    [key: string]: number;
  };
}

export interface TeamStats {
  teamName: string;
  totalClips: number;
  players: PlayerStats[];
  playTypes?: {
    [key: string]: number;
  };
  quarterScoring?: {
    [key: string]: number;
  };
}

export interface AnalyticsData {
  totalClips: number;
  situations: ClipStat[];
  players: PlayerStats[];
  teams: TeamStats[];
  shotDistribution?: {
    paint: number;
    midRange: number;
    threePoint: number;
  };
  playTypeDistribution?: {
    [key: string]: number;
  };
}

/**
 * Extract team name from player name (format is usually "Team - Player Name")
 */
const extractTeamName = (playerName: string): string => {
  const parts = playerName.split(" - ");
  return parts.length > 1 ? parts[0] : "Unknown";
};

/**
 * Map action to shot location (for analytics)
 */
const mapActionToShotLocation = (action: string, notes?: string): string => {
  // This is a simplification - in a real app, you'd determine this from more detailed data
  const lowerNotes = (notes || "").toLowerCase();
  
  if (lowerNotes.includes("three") || lowerNotes.includes("3-point") || lowerNotes.includes("3pt")) {
    return "threePoint";
  } else if (lowerNotes.includes("paint") || lowerNotes.includes("dunk") || lowerNotes.includes("layup")) {
    return "paint";
  } else {
    return "midRange";
  }
};

/**
 * Extract play type from notes or situation (for analytics)
 */
const extractPlayType = (notes?: string, situation?: string): string => {
  const lowerNotes = (notes || "").toLowerCase();
  const lowerSituation = (situation || "").toLowerCase();
  
  // List of common play types to check for
  const playTypes = [
    "isolation", "pick and roll", "spot up", "post up", "transition",
    "handoff", "cut", "off screen", "putback", "pick and pop"
  ];
  
  for (const playType of playTypes) {
    if (lowerNotes.includes(playType) || lowerSituation.includes(playType)) {
      return playType;
    }
  }
  
  // Default play types based on situation
  if (lowerSituation.includes("fast_break")) return "transition";
  if (lowerSituation.includes("zone")) return "zone offense";
  if (lowerSituation.includes("man")) return "man offense";
  
  return "other";
};

/**
 * Calculate statistics based on saved clips
 */
export const calculateStats = (clips: SavedClip[]): AnalyticsData => {
  const stats: AnalyticsData = {
    totalClips: clips.length,
    situations: [],
    players: [],
    teams: [],
    shotDistribution: {
      paint: 0,
      midRange: 0,
      threePoint: 0
    },
    playTypeDistribution: {}
  };

  // Count situation occurrences
  const situationCounts: Record<string, number> = {};
  clips.forEach(clip => {
    if (clip.situation) {
      situationCounts[clip.situation] = (situationCounts[clip.situation] || 0) + 1;
    }
  });

  // Create situation statistics
  stats.situations = Object.entries(situationCounts).map(([situation, count]) => ({
    label: situation,
    count,
    percentage: (count / clips.length) * 100
  })).sort((a, b) => b.count - a.count);

  // Player and team statistics
  const playerStats: Record<string, PlayerStats> = {};
  const teamStats: Record<string, TeamStats> = {};
  const playTypeCounts: Record<string, number> = {};
  const shotLocations: Record<string, number> = {
    paint: 0,
    midRange: 0,
    threePoint: 0
  };

  // Process all players in all clips
  clips.forEach(clip => {
    // Extract play type
    const playType = extractPlayType(clip.notes, clip.situation);
    playTypeCounts[playType] = (playTypeCounts[playType] || 0) + 1;
    
    if (!clip.players) return;
    
    clip.players.forEach(player => {
      // Extract player name and team
      const playerName = player.playerName;
      const teamName = extractTeamName(playerName);
      
      // Initialize player record if it doesn't exist
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          playerName,
          totalClips: 0,
          actions: {},
          shotTypes: {},
          shotLocations: {}
        };
      }
      
      // Update player statistics
      playerStats[playerName].totalClips++;
      playerStats[playerName].actions[player.action] = 
        (playerStats[playerName].actions[player.action] || 0) + 1;
      
      // Track shot locations
      if (player.action === "scored" || player.action === "missed") {
        const shotLocation = mapActionToShotLocation(player.action, clip.notes);
        if (playerStats[playerName].shotLocations) {
          playerStats[playerName].shotLocations[shotLocation] = 
            (playerStats[playerName].shotLocations[shotLocation] || 0) + 1;
        }
        
        // Update overall shot distribution
        shotLocations[shotLocation]++;
      }
      
      // Initialize team record if it doesn't exist
      if (!teamStats[teamName]) {
        teamStats[teamName] = {
          teamName,
          totalClips: 0,
          players: [],
          playTypes: {},
          quarterScoring: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
        };
      }
      
      // Update team clip count
      teamStats[teamName].totalClips++;
      
      // Update team play types
      if (teamStats[teamName].playTypes) {
        teamStats[teamName].playTypes[playType] = 
          (teamStats[teamName].playTypes[playType] || 0) + 1;
      }
      
      // Update quarter scoring (simplified mock data)
      if (player.action === "scored" && teamStats[teamName].quarterScoring) {
        // Random quarter assignment for demo purposes
        const quarter = `Q${Math.floor(Math.random() * 4) + 1}`;
        teamStats[teamName].quarterScoring[quarter] += 2; // simplified scoring
      }
    });
  });

  // Convert player stats to array and sort by total clips
  stats.players = Object.values(playerStats).sort((a, b) => b.totalClips - a.totalClips);
  
  // Update team stats with players and sort by total clips
  stats.teams = Object.values(teamStats).map(team => {
    team.players = stats.players.filter(player => 
      extractTeamName(player.playerName) === team.teamName
    );
    return team;
  }).sort((a, b) => b.totalClips - a.totalClips);
  
  // Calculate overall shot distribution percentages
  const totalShots = Object.values(shotLocations).reduce((sum, count) => sum + count, 0);
  if (totalShots > 0) {
    stats.shotDistribution = {
      paint: shotLocations.paint,
      midRange: shotLocations.midRange,
      threePoint: shotLocations.threePoint
    };
  }
  
  // Calculate play type distribution
  stats.playTypeDistribution = playTypeCounts;

  return stats;
};
