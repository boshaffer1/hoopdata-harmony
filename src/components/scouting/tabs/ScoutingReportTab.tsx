
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ScoutingReport } from "@/utils/espn-service";

interface ScoutingReportTabProps {
  report: ScoutingReport;
  generateReport: () => void;
}

export function ScoutingReportTab({ report, generateReport }: ScoutingReportTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full Scouting Report</CardTitle>
        <CardDescription>
          Comprehensive breakdown of team tendencies and strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Detailed scouting report will be available soon.
          </p>
          <Button 
            onClick={generateReport} 
            className="mt-4 flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Generate PDF Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
