
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/analyzer";

interface PlayerStatsProps {
  player: Player;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  // Mock stats for display
  // In a real app, these stats would be coming from the player's data
  const mockStats = {
    ppg: 18.7,
    rpg: 9.3,
    apg: 2.5,
    fgPercent: 52.3,
    threePointPercent: 33.5,
    ftPercent: 75.8
  };

  const StatBox = ({ label, value, suffix = '' }) => (
    <Card className="border-border/50">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground uppercase mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}{suffix}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center">
          <span className="text-xl">Season Statistics</span>
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatBox label="PPG" value={mockStats.ppg} />
        <StatBox label="RPG" value={mockStats.rpg} />
        <StatBox label="APG" value={mockStats.apg} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox label="FG%" value={mockStats.fgPercent} suffix="%" />
        <StatBox label="3PT%" value={mockStats.threePointPercent} suffix="%" />
        <StatBox label="FT%" value={mockStats.ftPercent} suffix="%" />
      </div>
    </div>
  );
};
