
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { User, FileText, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { ScoutingReport } from "@/utils/espn-service";

interface PlayerAnalysisTabProps {
  report: ScoutingReport;
  selectedPlayer: string | null;
  setSelectedPlayer: (id: string) => void;
}

export function PlayerAnalysisTab({ 
  report, 
  selectedPlayer, 
  setSelectedPlayer 
}: PlayerAnalysisTabProps) {
  // Prepare driving tendencies data
  const drivingTendenciesData = [
    { name: "Drives Left", value: 65 },
    { name: "Drives Right", value: 35 },
  ];
  
  // Prepare shot types data
  const shotTypesData = [
    { name: "Pull-Up", value: 40 },
    { name: "Spot-Up", value: 30 },
    { name: "Post-Up", value: 5 },
    { name: "Other", value: 25 },
  ];
  
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

  // Find the selected player
  const playerData = report.playerStats && selectedPlayer 
    ? report.playerStats.find(p => p.id === selectedPlayer) 
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Player Selection */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.playerStats && report.playerStats.length > 0 ? (
            <div className="space-y-1">
              {report.playerStats.map((player) => (
                <Button
                  key={player.id}
                  variant={selectedPlayer === player.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    selectedPlayer === player.id ? "bg-primary" : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedPlayer(player.id)}
                >
                  <span className="truncate">{player.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {player.position} #{player.jersey}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No players available</p>
          )}
        </CardContent>
      </Card>
      
      {/* Player Stats & Analysis */}
      <div className="lg:col-span-3 space-y-6">
        {playerData ? (
          <>
            {/* Player Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {playerData.name}
                      <span className="text-muted-foreground ml-2 text-base">
                        {playerData.position} #{playerData.jersey}
                      </span>
                    </h2>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{playerData.stats.pts}</span>
                        <span className="text-xs uppercase text-muted-foreground">PTS</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{playerData.stats.reb}</span>
                        <span className="text-xs uppercase text-muted-foreground">REB</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{playerData.stats.ast}</span>
                        <span className="text-xs uppercase text-muted-foreground">AST</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{playerData.stats.fgp}%</span>
                        <span className="text-xs uppercase text-muted-foreground">FG%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{playerData.stats.tpp}%</span>
                        <span className="text-xs uppercase text-muted-foreground">3P%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      toast.success(`Detailed report for ${playerData.name} downloaded`);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Player Analysis Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Driving Tendencies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Driving Tendencies</CardTitle>
                  <CardDescription>Left vs Right preference</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    "Drives Left": { color: "#3b82f6" },
                    "Drives Right": { color: "#34d399" }
                  }} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={drivingTendenciesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#34d399" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              {/* Shot Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shot Types</CardTitle>
                  <CardDescription>Shooting style breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    "Pull-Up": { color: "#3b82f6" },
                    "Spot-Up": { color: "#34d399" },
                    "Post-Up": { color: "#f97316" },
                    "Other": { color: "#f59e0b" }
                  }} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shotTypesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {shotTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              {/* Shot Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shot Locations</CardTitle>
                  <CardDescription>Court area preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    "Mid-Range": { color: "#3b82f6" },
                    "Rim": { color: "#34d399" },
                    "Three-Point": { color: "#f97316" }
                  }} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shotDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {shotDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Scoring by Quarter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Scoring by Quarter
                </CardTitle>
                <CardDescription>
                  Points distribution throughout the game
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Select a player to view analysis
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
