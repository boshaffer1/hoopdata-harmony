
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameSituation, GAME_SITUATIONS } from "@/types/analyzer";

interface SituationSelectProps {
  value: GameSituation | "";
  onValueChange: (value: GameSituation) => void;
}

const SituationSelect: React.FC<SituationSelectProps> = ({ value, onValueChange }) => {
  const getSituationLabel = (situation: GameSituation): string => {
    const labels: Record<GameSituation, string> = {
      transition: "Transition",
      half_court: "Half Court",
      ato: "After Timeout (ATO)",
      slob: "Sideline Out of Bounds (SLOB)",
      blob: "Baseline Out of Bounds (BLOB)",
      press_break: "Press Break",
      zone_offense: "Zone Offense",
      man_offense: "Man Offense",
      fast_break: "Fast Break",
      other: "Other"
    };
    
    return labels[situation] || situation;
  };

  return (
    <div className="mb-3">
      <label className="text-sm font-medium mb-2 block">Game Situation</label>
      <Select value={value} onValueChange={(value) => onValueChange(value as GameSituation)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a situation" />
        </SelectTrigger>
        <SelectContent>
          {GAME_SITUATIONS.map(situation => (
            <SelectItem key={situation} value={situation}>
              {getSituationLabel(situation)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SituationSelect;
