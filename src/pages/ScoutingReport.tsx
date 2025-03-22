
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ESPNService, ScoutingReport } from "@/utils/espn-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, ChevronUp, ChevronDown, Minus, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ScoutingReportPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReport = async () => {
      if (!teamId) return;
      
      setLoading(true);
      try {
        const data = await ESPNService.getScoutingReport(teamId);
        setReport(data);
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Full roster details coming soon.
                  </p>
                </div>
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Detailed team statistics coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
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
