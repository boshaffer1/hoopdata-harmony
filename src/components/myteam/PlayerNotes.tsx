
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/analyzer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface PlayerNotesProps {
  player: Player;
}

export const PlayerNotes: React.FC<PlayerNotesProps> = ({ player }) => {
  // In a real app, this would come from the player's data and be saved to the backend
  const [notes, setNotes] = useState(player.notes || "");
  
  const handleSaveNotes = () => {
    // In a real app, this would save to the backend
    toast.success("Notes saved successfully");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Player Notes</CardTitle>
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleSaveNotes}
        >
          <Save className="h-4 w-4" />
          Save Notes
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea 
          className="min-h-[300px]" 
          placeholder="Add notes about this player's performance, tendencies, improvements, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};
