
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/analyzer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useRoster } from "@/hooks/analyzer/use-roster";

interface PlayerNotesProps {
  player: Player;
  teamId: string;
}

export const PlayerNotes: React.FC<PlayerNotesProps> = ({ player, teamId }) => {
  const [notes, setNotes] = useState(player.notes || "");
  const [saved, setSaved] = useState(true);
  
  // We need to access the roster functionality to save notes
  const { updatePlayerNotes } = useRoster();
  
  // Update notes when player changes
  useEffect(() => {
    setNotes(player.notes || "");
    setSaved(true);
  }, [player.id, player.notes]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaved(false);
  };
  
  const handleSaveNotes = () => {
    updatePlayerNotes(teamId, player.id, notes);
    setSaved(true);
    toast.success("Notes saved successfully");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Player Notes</CardTitle>
        <Button 
          variant={saved ? "outline" : "default"}
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleSaveNotes}
          disabled={saved}
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved" : "Save Notes"}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea 
          className="min-h-[300px]" 
          placeholder="Add notes about this player's performance, tendencies, improvements, etc."
          value={notes}
          onChange={handleChange}
        />
      </CardContent>
    </Card>
  );
};
