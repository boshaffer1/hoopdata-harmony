
import React from "react";
import { ScoutingReport } from "@/utils/espn-service";

interface TeamHeaderProps {
  report: ScoutingReport;
}

export function TeamHeader({ report }: TeamHeaderProps) {
  // Use team color from the report or fallback to default
  const teamColor = report.color ? report.color : "#3b82f6";

  return (
    <div 
      className="rounded-lg p-6" 
      style={{ background: `${teamColor}25` }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {report.logo && (
            <img 
              src={report.logo} 
              alt={report.teamName} 
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-display font-bold">{report.teamName}</h1>
            <p className="text-muted-foreground">
              {report.conference} • {report.division} • {report.record}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
