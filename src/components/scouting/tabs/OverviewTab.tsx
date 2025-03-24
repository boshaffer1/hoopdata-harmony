
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { ScoutingReport } from "@/utils/espn-service";
import { TrendIcon } from "../TrendIcon";

interface OverviewTabProps {
  report: ScoutingReport;
}

export function OverviewTab({ report }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Team Strengths */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Team Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.strengths && report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{strength.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Team Weaknesses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="mr-2 h-5 w-5" />
              Team Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.weaknesses && report.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>{weakness.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Offensive Style */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Offensive Style</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{report.offensiveStyle}</p>
          </CardContent>
        </Card>
        
        {/* Defensive Style */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Defensive Style</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{report.defensiveStyle}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Key Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <span className="inline-flex items-center">
              Key Stats
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {report.keyStats && Object.entries(report.keyStats).map(([key, data]) => (
              <div key={key} className="p-4 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">{key}</div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{data.value}</span>
                  <TrendIcon trend={data.trend} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
