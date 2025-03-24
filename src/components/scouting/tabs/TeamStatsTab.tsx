
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { ScoutingReport } from "@/utils/espn-service";

interface TeamStatsTabProps {
  report: ScoutingReport;
}

export function TeamStatsTab({ report }: TeamStatsTabProps) {
  // Generate scoring by quarter data
  const scoringByQuarterData = [
    { name: "Q1", value: 6 },
    { name: "Q2", value: 4 },
    { name: "Q3", value: 8 },
    { name: "Q4", value: 4 },
  ];
  
  // Generate shot distribution data for charts
  const shotDistributionData = [
    { name: "Mid-Range", value: 30 },
    { name: "Rim", value: 40 },
    { name: "Three-Point", value: 25 },
  ];
  
  // Colors for the pie charts
  const COLORS = ["#3b82f6", "#34d399", "#f97316", "#f59e0b"];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Scoring by Quarter</h3>
            <ChartContainer config={{ quarter: { color: "#3b82f6" } }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoringByQuarterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Shot Distribution</h3>
            <ChartContainer config={{ 
              "Mid-Range": { color: "#3b82f6" },
              "Rim": { color: "#34d399" },
              "Three-Point": { color: "#f97316" }
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shotDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shotDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
