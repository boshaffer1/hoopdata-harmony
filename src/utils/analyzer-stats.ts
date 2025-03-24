
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
}

export interface TeamStats {
  teamName: string;
  totalClips: number;
  players: PlayerStats[];
}

export interface AnalyticsData {
  totalClips: number;
  situations: ClipStat[];
  players: PlayerStats[];
  teams: TeamStats[];
}

/**
 * Extract team name from player name (format is usually "Team - Player Name")
 */
const extractTeamName = (playerName: string): string => {
  const parts = playerName.split(" - ");
  return parts.length > 1 ? parts[0] : "Unknown";
};

/**
 * Calculate statistics based on saved clips
 */
export const calculateStats = (clips: SavedClip[]): AnalyticsData => {
  const stats: AnalyticsData = {
    totalClips: clips.length,
    situations: [],
    players: [],
    teams: []
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

  // Process all players in all clips
  clips.forEach(clip => {
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
          actions: {}
        };
      }
      
      // Update player statistics
      playerStats[playerName].totalClips++;
      playerStats[playerName].actions[player.action] = 
        (playerStats[playerName].actions[player.action] || 0) + 1;
      
      // Initialize team record if it doesn't exist
      if (!teamStats[teamName]) {
        teamStats[teamName] = {
          teamName,
          totalClips: 0,
          players: []
        };
      }
      
      // Update team clip count
      teamStats[teamName].totalClips++;
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

  return stats;
};
