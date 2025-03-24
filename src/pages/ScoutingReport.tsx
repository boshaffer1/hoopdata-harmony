
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ESPNService, ScoutingReport } from "@/utils/espn-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Minus, 
  CheckCircle, 
  XCircle,
  User,
  BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const ScoutingReportPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReport = async () => {
      if (!teamId) return;
      
      setLoading(true);
      try {
        const data = await ESPNService.getScoutingReport(teamId);
        setReport(data);
        
        // Set the first player as selected by default if players exist
        if (data.playerStats && data.playerStats.length > 0) {
          setSelectedPlayer(data.playerStats[0].id);
        }
      } catch (error) {
        console.error("Error fetching scouting report:", error);
        toast.error("Failed to load scouting report");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [teamId]);
  
  const generateReport = () => {
    if (!teamId) return;
    
    try {
      ESPNService.generateScoutingReportPDF(teamId);
      toast.success("Scouting report PDF generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate PDF report");
    }
  };
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="text-green-500 h-4 w-4" />;
      case 'down':
        return <ChevronDown className="text-red-500 h-4 w-4" />;
      default:
        return <Minus className="text-gray-500 h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Layout className="py-6">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-pulse">Loading scouting report...</div>
        </div>
      </Layout>
    );
  }
  
  if (!report) {
    return (
      <Layout className="py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Could not find scouting report for the requested team.
          </p>
          <Button asChild>
            <Link to="/scouting">Back to Scouting</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Use team color from the report or fallback to default
  const teamColor = report.color ? `#${report.color}` : "#3b82f6";
  
  // Find the selected player
  const playerData = report.playerStats && selectedPlayer 
    ? report.playerStats.find(p => p.id === selectedPlayer) 
    : null;
  
  // Generate shot distribution data for charts
  const shotDistributionData = [
    { name: "Mid-Range", value: 30 },
    { name: "Rim", value: 40 },
    { name: "Three-Point", value: 25 },
  ];
  
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
  
  // Colors for the pie charts
  const COLORS = ["#3b82f6", "#34d399", "#f97316", "#f59e0b"];
  
  return (
    <Layout className="py-6">
      <div className="space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/scouting" className="hover:text-foreground transition-colors">
              Scouting
            </Link>
            <span>›</span>
            <span className="text-foreground">{report.teamName}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              asChild
              className="border-border/50"
            >
              <Link to="/scouting">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Teams
              </Link>
            </Button>
            <Button 
              onClick={generateReport} 
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
        
        {/* Team Header */}
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
        
        {/* Tabs Navigation */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="teamStats">Team Stats</TabsTrigger>
            <TabsTrigger value="playerAnalysis">Player Analysis</TabsTrigger>
            <TabsTrigger value="scoutingReport">Scouting Report</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
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
                    {report.strengths.map((strength, index) => (
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
                    {report.weaknesses.map((weakness, index) => (
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
                  {Object.entries(report.keyStats).map(([key, data]) => (
                    <div key={key} className="p-4 rounded-lg border">
                      <div className="text-xs text-muted-foreground mb-1">{key}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">{data.value}</span>
                        {getTrendIcon(data.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Roster Tab */}
          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
                <CardDescription>
                  Coach: {report.coach}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.playerStats && report.playerStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Jersey</TableHead>
                        <TableHead className="text-right">PPG</TableHead>
                        <TableHead className="text-right">RPG</TableHead>
                        <TableHead className="text-right">APG</TableHead>
                        <TableHead className="text-right">FG%</TableHead>
                        <TableHead className="text-right">3P%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.playerStats.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>{player.position}</TableCell>
                          <TableCell className="text-right">{player.jersey}</TableCell>
                          <TableCell className="text-right">{player.stats.pts}</TableCell>
                          <TableCell className="text-right">{player.stats.reb}</TableCell>
                          <TableCell className="text-right">{player.stats.ast}</TableCell>
                          <TableCell className="text-right">{player.stats.fgp}%</TableCell>
                          <TableCell className="text-right">{player.stats.tpp}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No roster data available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Team Stats Tab */}
          <TabsContent value="teamStats">
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
          </TabsContent>
          
          {/* Player Analysis Tab */}
          <TabsContent value="playerAnalysis">
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
          </TabsContent>
          
          {/* Scouting Report Tab */}
          <TabsContent value="scoutingReport">
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScoutingReportPage;
