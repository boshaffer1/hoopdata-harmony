
import { useState, useEffect } from "react";
import { TeamRoster, Player } from "@/types/analyzer";
import { toast } from "sonner";

export const useRoster = () => {
  const [rosters, setRosters] = useState<TeamRoster[]>([]);
  
  // Load from localStorage on init
  useEffect(() => {
    const savedRosters = localStorage.getItem('teamRosters');
    if (savedRosters) {
      try {
        const parsedRosters = JSON.parse(savedRosters);
        setRosters(parsedRosters);
      } catch (error) {
        console.error("Error loading rosters from localStorage:", error);
      }
    }
  }, []);
  
  // Save to localStorage whenever rosters change
  useEffect(() => {
    if (rosters.length > 0) {
      localStorage.setItem('teamRosters', JSON.stringify(rosters));
    }
  }, [rosters]);
  
  const addTeam = (teamName: string) => {
    // Check if team already exists
    if (rosters.some(team => team.name.toLowerCase() === teamName.toLowerCase())) {
      toast.error("A team with this name already exists");
      return;
    }
    
    const newTeam: TeamRoster = {
      id: `team-${Date.now()}`,
      name: teamName,
      players: []
    };
    
    setRosters(prev => [...prev, newTeam]);
    toast.success(`Added team: ${teamName}`);
    return newTeam;
  };
  
  const removeTeam = (teamId: string) => {
    setRosters(prev => prev.filter(team => team.id !== teamId));
    toast.success("Team removed");
  };
  
  const addPlayer = (teamId: string, player: Omit<Player, "id">) => {
    setRosters(prev => 
      prev.map(team => {
        if (team.id === teamId) {
          // Check if player already exists
          if (team.players.some(p => p.name.toLowerCase() === player.name.toLowerCase())) {
            toast.error("A player with this name already exists on this team");
            return team;
          }
          
          const newPlayer: Player = {
            ...player,
            id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          
          return {
            ...team,
            players: [...team.players, newPlayer]
          };
        }
        return team;
      })
    );
    
    toast.success(`Added player: ${player.name}`);
  };
  
  const removePlayer = (teamId: string, playerId: string) => {
    setRosters(prev => 
      prev.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.filter(player => player.id !== playerId)
          };
        }
        return team;
      })
    );
    
    toast.success("Player removed");
  };
  
  const importRosters = (rostersData: TeamRoster[]) => {
    setRosters(rostersData);
    toast.success(`Imported ${rostersData.length} teams`);
  };
  
  const exportRosters = () => {
    return rosters;
  };

  return {
    rosters,
    addTeam,
    removeTeam,
    addPlayer,
    removePlayer,
    importRosters,
    exportRosters
  };
};
