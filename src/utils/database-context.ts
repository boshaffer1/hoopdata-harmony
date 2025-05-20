
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches and formats database information to provide context for the LLM
 */
export async function getDatabaseContext(): Promise<string> {
  const context: string[] = [];

  try {
    // Teams
    const { data: teams, error: teamsError } = await supabase
      .from('Teams')
      .select('*')
      .limit(20);
      
    if (!teamsError && teams && teams.length > 0) {
      const teamInfo = teams.map(team => {
        // Check if team has name and league properties
        if (team && typeof team === 'object' && 'name' in team && 'league' in team) {
          return `${team.name || 'Unknown'} (${team.league || 'Unknown'})`;
        }
        return 'Unknown team';
      }).join(', ');
      context.push(`Teams: ${teamInfo}`);
    }
    
    // Players
    const { data: players, error: playersError } = await supabase
      .from('Players')
      .select('*')
      .limit(20);
      
    if (!playersError && players && players.length > 0) {
      const playerInfo = players.map(player => {
        if (!player || typeof player !== 'object') return '';
        const name = 'name' in player ? player.name : 'Unknown';
        return name;
      }).filter(Boolean).join(', ');
      
      if (playerInfo) {
        context.push(`Players: ${playerInfo}`);
      }
    }
    
    // NBA Players
    const { data: nbaPlayers, error: nbaPlayersError } = await supabase
      .from('NBA Roster')
      .select('*')
      .limit(20);
      
    if (!nbaPlayersError && nbaPlayers && nbaPlayers.length > 0) {
      const nbaPlayerInfo = nbaPlayers.map(player => {
        if (!player || typeof player !== 'object') return '';
        const name = 'name' in player ? player.name : 'Unknown';
        return name;
      }).filter(Boolean).join(', ');
      
      if (nbaPlayerInfo) {
        context.push(`NBA Players: ${nbaPlayerInfo}`);
      }
    }
    
    // Videos
    const { data: videos, error: videosError } = await supabase
      .from('video_files')
      .select('*')
      .limit(10);
      
    if (!videosError && videos && videos.length > 0) {
      const videoInfo = videos.map(video => 
        video.title || video.filename || 'Untitled video').join(', ');
      context.push(`Videos: ${videoInfo}`);
    }
    
    // Stats - example stats for context
    const { data: stats, error: statsError } = await supabase
      .from('nba_player_box_scores')
      .select('*')
      .limit(5);
      
    if (!statsError && stats && stats.length > 0) {
      const statsSample = stats.map(stat => {
        const player = stat.player_name || 'Unknown';
        const points = stat.points || 0;
        const rebounds = stat.rebounds || 0;
        const assists = stat.assists || 0;
        return `${player}: ${points}pts, ${rebounds}reb, ${assists}ast`;
      }).join('; ');
      
      context.push(`Example Stats: ${statsSample}`);
    }
    
  } catch (error) {
    console.error("Error generating database context:", error);
    context.push("Error: Could not fetch complete database information");
  }
  
  // Add database schema info
  context.push(`
    Database Tables:
    - teams (team information)
    - players (player roster data)
    - NBA roster (NBA player data)
    - WNBA roster (WNBA player data)
    - video_files (stored video content)
    - clips (video clips)
    - nba_player_box_scores (game statistics)
    - nba_schedules (game schedules)
  `);
  
  return context.join('\n');
}
