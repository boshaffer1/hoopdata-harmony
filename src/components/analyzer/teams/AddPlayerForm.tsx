
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/analyzer";

interface AddPlayerFormProps {
  teamId: string;
  onAddPlayer: (teamId: string, player: Omit<Player, "id">) => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ teamId, onAddPlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("");

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !newPlayerName.trim()) return;
    
    onAddPlayer(teamId, {
      name: newPlayerName,
      number: newPlayerNumber || "0",
      position: newPlayerPosition || "N/A",
      height: "",
      year: "",
      hometown: ""
    });
    
    setNewPlayerName("");
    setNewPlayerNumber("");
    setNewPlayerPosition("");
  };

  return (
    <form onSubmit={handleAddPlayer} className="space-y-2 p-3 border rounded-md">
      <h4 className="text-sm font-medium">Add New Player</h4>
      <div className="grid grid-cols-12 gap-2">
        <Input 
          className="col-span-6"
          placeholder="Player Name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <Input 
          className="col-span-2"
          placeholder="#"
          value={newPlayerNumber}
          onChange={(e) => setNewPlayerNumber(e.target.value)}
        />
        <Input 
          className="col-span-2"
          placeholder="POS"
          value={newPlayerPosition}
          onChange={(e) => setNewPlayerPosition(e.target.value)}
        />
        <Button type="submit" className="col-span-2">Add</Button>
      </div>
    </form>
  );
};

export default AddPlayerForm;
