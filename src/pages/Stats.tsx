
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { useRoster } from "@/hooks/analyzer/use-roster";
import { calculateStats } from "@/utils/analyzer-stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Printer, BarChart2, Users, Target } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const Stats = () => {
  const { savedClips } = useAnalyzer();
  const { rosters } = useRoster();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  
  useEffect(() => {
    if (savedClips.length > 0) {
      const stats = calculateStats(savedClips);
      setAnalyticsData(stats);
    } else {
      setAnalyticsData(null);
    }
  }, [savedClips]);

  useEffect(() => {
    if (rosters.length > 0 && !selectedTeam) {
      setSelectedTeam(rosters[0]?.id || "");
    }
  }, [rosters, selectedTeam]);
  
  const selectedRoster = rosters.find(team => team.id === selectedTeam);
  
  // Mock data for visualizations
  const quarterScoring = [
    { name: "Q1", points: 27 },
    { name: "Q2", points: 24 },
    { name: "Q3", points: 31 },
    { name: "Q4", points: 25 }
  ];
  
  const playerScoring = selectedRoster?.players.slice(0, 5).map((player, index) => ({
    name: player.name.split(" ").pop(),
    points: 22 - index * 2.5,
    rebounds: 8 - index
  })) || [];
  
  const shotDistribution = [
    { name: "Paint", value: 17, color: "#1e40af" },
    { name: "Mid-Range", value: 50, color: "#10b981" },
    { name: "Three-Point", value: 33, color: "#f59e0b" }
  ];
  
  const playTypes = [
    { name: "spot up", value: 22 },
    { name: "pick and roll ball handler", value: 18 },
    { name: "isolation", value: 12 },
    { name: "pick and roll roll man", value: 10 },
    { name: "post up", value: 8 },
    { name: "cut", value: 7 },
    { name: "transition", value: 7 },
    { name: "hand off", value: 6 },
    { name: "off screen", value: 5 },
    { name: "putback", value: 3 }
  ];
  
  const teamStrengths = [
    { subject: "FG%", A: 65, fullMark: 100 },
    { subject: "3P%", A: 70, fullMark: 100 },
    { subject: "FT%", A: 75, fullMark: 100 },
    { subject: "Rebounds", A: 60, fullMark: 100 },
    { subject: "Assists", A: 80, fullMark: 100 },
    { subject: "Steals", A: 55, fullMark: 100 },
    { subject: "Blocks", A: 45, fullMark: 100 }
  ];
  
  const keyPlayers = [
    {
      title: "Top Scorer",
      position: "SG",
      name: selectedRoster?.players[0]?.name || "Player 1",
      stats: [
        { label: "Points", value: 21 },
        { label: "FG%", value: "47.1%" },
        { label: "3P%", value: "50.0%" },
        { label: "Drives Left", value: "55%" },
        { label: "Drives Right", value: "45%" }
      ]
    },
    {
      title: "Top Rebounder",
      position: "C",
      name: selectedRoster?.players[1]?.name || "Player 2",
      stats: [
        { label: "Rebounds", value: 12 },
        { label: "Points", value: 10 },
        { label: "Blocks", value: 1 },
        { label: "Post-Up Freq", value: "65%" },
        { label: "Rim Freq", value: "80%" }
      ]
    },
    {
      title: "Top Playmaker",
      position: "PG",
      name: selectedRoster?.players[2]?.name || "Player 3",
      stats: [
        { label: "Assists", value: 9 },
        { label: "Points", value: 18 },
        { label: "Turnovers", value: 4 },
        { label: "Pull-Up Freq", value: "45%" },
        { label: "C&S Freq", value: "25%" }
      ]
    }
  ];

  return (
    <Layout className="py-6">
      <div className="flex flex-col gap-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and insights for your team
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
        
        {/* Team Selection & Game Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold">Basketball Analytics Dashboard</h2>
                {selectedRoster && <p className="text-muted-foreground">{selectedRoster.name}</p>}
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {rosters.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Analysis Tabs */}
        <Tabs defaultValue="team" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team Analysis
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              Player Analysis
            </TabsTrigger>
            <TabsTrigger value="opponent" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Opponent Scouting
            </TabsTrigger>
          </TabsList>
          
          {/* Team Analysis Tab */}
          <TabsContent value="team">
            {/* Team Stats Overview */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">PTS</p>
                  <p className="text-3xl font-bold">108</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">FG%</p>
                  <p className="text-3xl font-bold">48.2</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">3P%</p>
                  <p className="text-3xl font-bold">38.7</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">REB</p>
                  <p className="text-3xl font-bold">42</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">AST</p>
                  <p className="text-3xl font-bold">24</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Scoring by Quarter */}
              <Card>
                <CardHeader>
                  <CardTitle>Scoring by Quarter</CardTitle>
                  <CardDescription>Points distribution throughout the game</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ points: { color: "#3b82f6" } }} className="h-[300px]">
                    <BarChart data={quarterScoring}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" fill="var(--color-points)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              {/* Play Type Frequency */}
              <Card>
                <CardHeader>
                  <CardTitle>Play Type Frequency</CardTitle>
                  <CardDescription>Percentage of possessions by play type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ playType: { color: "#3b82f6" } }} className="h-[300px]">
                    <BarChart data={playTypes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-playType)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Player Scoring Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Player Scoring Distribution</CardTitle>
                  <CardDescription>Points contribution by player</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ points: { color: "#3b82f6" }, rebounds: { color: "#10b981" } }} className="h-[300px]">
                    <BarChart data={playerScoring}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="points" fill="var(--color-points)" />
                      <Bar dataKey="rebounds" fill="var(--color-rebounds)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              {/* Shot Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Shot Distribution</CardTitle>
                  <CardDescription>Shot attempts by court location</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={shotDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {shotDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Team Comparison */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Team Strengths</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ radar: { color: "#3b82f6" } }} className="h-[400px]">
                  <RadarChart outerRadius={90} width={730} height={250} data={teamStrengths}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Team" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            {/* Key Players Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Key Players Analysis</CardTitle>
                <CardDescription>Top contributors and their statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {keyPlayers.map((player, index) => (
                    <Card key={index} className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{player.title}</CardTitle>
                          <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                            {player.position}
                          </span>
                        </div>
                        <CardDescription className="text-lg font-semibold text-foreground">
                          {player.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {player.stats.map((stat, statIndex) => (
                            <div key={statIndex} className="flex justify-between items-center">
                              <span className="text-muted-foreground">{stat.label}:</span>
                              <span className="font-medium">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Player Analysis Tab */}
          <TabsContent value="player">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Stats</CardTitle>
                  <CardDescription>Select a player to view detailed statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a player from the roster to view detailed analytics</p>
                    <Button className="mt-4">View All Players</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Opponent Scouting Tab */}
          <TabsContent value="opponent">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Opponent Scouting</CardTitle>
                  <CardDescription>Analysis of opponent tendencies and strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Opponent analysis feature coming soon</p>
                    <Button className="mt-4" variant="outline">Request Feature</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Stats;
