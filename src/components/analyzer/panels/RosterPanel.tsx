
import React from "react";
import RosterView from "@/components/analyzer/teams/RosterView";
import { TeamRoster, Player } from "@/types/analyzer";

interface RosterPanelProps {
  rosters: TeamRoster[];
  onAddTeam: (teamName: string) => TeamRoster | null;
  onRemoveTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, player: Omit<Player, "id">) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
}

const RosterPanel: React.FC<RosterPanelProps> = ({
  rosters,
  onAddTeam,
  onRemoveTeam,
  onAddPlayer,
  onRemovePlayer
}) => {
  return (
    <RosterView 
      rosters={rosters}
      onAddTeam={onAddTeam}
      onRemoveTeam={onRemoveTeam}
      onAddPlayer={onAddPlayer}
      onRemovePlayer={onRemovePlayer}
    />
  );
};

export default RosterPanel;
