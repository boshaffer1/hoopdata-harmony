
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamRoster } from "@/types/analyzer";

interface TeamFormProps {
  onAddTeam: (teamName: string) => TeamRoster | null;
}

const TeamForm: React.FC<TeamFormProps> = ({ onAddTeam }) => {
  const [newTeamName, setNewTeamName] = useState("");

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    onAddTeam(newTeamName);
    setNewTeamName("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add Team Manually</h3>
      <form onSubmit={handleAddTeam} className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <Input 
            className="col-span-3"
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;
