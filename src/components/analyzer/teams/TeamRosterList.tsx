
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { TeamRoster } from "@/types/analyzer";

interface TeamRosterListProps {
  rosters: TeamRoster[];
}

const TeamRosterList: React.FC<TeamRosterListProps> = ({ rosters }) => {
  return (
    <TabsList className="mb-4 overflow-x-auto flex w-full h-auto flex-wrap">
      {rosters.map(team => (
        <TabsTrigger key={team.id} value={team.id} className="flex items-center gap-1">
          {team.name}
        </TabsTrigger>
      ))}
      <TabsTrigger value="add" className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        Add Team
      </TabsTrigger>
    </TabsList>
  );
};

export default TeamRosterList;
