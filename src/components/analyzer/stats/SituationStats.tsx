
import React from "react";
import { ClipStat } from "@/utils/analyzer-stats";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SituationStatsProps {
  situations: ClipStat[];
}

const SituationStats: React.FC<SituationStatsProps> = ({ situations }) => {
  // Function to get situation display name
  const getSituationDisplay = (situation: string) => {
    const situationMap: Record<string, string> = {
      'transition': 'Transition',
      'half_court': 'Half Court',
      'ato': 'After Timeout (ATO)',
      'slob': 'Sideline Out of Bounds',
      'blob': 'Baseline Out of Bounds',
      'press_break': 'Press Break',
      'zone_offense': 'Zone Offense',
      'man_offense': 'Man-to-Man Offense',
      'fast_break': 'Fast Break',
      'other': 'Other'
    };
    
    return situationMap[situation] || situation;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Game Situations</h3>
      
      <div className="space-y-4">
        {situations.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {stat.count}
                </Badge>
                <span>{getSituationDisplay(stat.label)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stat.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={stat.percentage} className="h-2" />
          </div>
        ))}
        
        {situations.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No situation data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SituationStats;
