
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Search } from "lucide-react";
import { ESPNService, TeamWithConference } from "@/utils/espn-service";

const Scouting = () => {
  const [teamsData, setTeamsData] = useState<Record<string, TeamWithConference[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nba");

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const data = await ESPNService.getTeamsByConference('basketball', activeTab);
        setTeamsData(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [activeTab]);

  const filteredTeams = Object.entries(teamsData).reduce((acc, [conference, teams]) => {
    // Add null checks to prevent "toLowerCase is not a function" errors
    const filtered = teams.filter(team => 
      team.displayName && team.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[conference] = filtered;
    }
    
    return acc;
  }, {} as Record<string, TeamWithConference[]>);

  return (
    <Layout className="py-6">
      <div className="flex flex-col gap-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Team Scouting</h1>
            <p className="text-muted-foreground">
              View detailed information and scouting reports for all teams.
            </p>
          </div>
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/stats">
              <FileText className="h-4 w-4" />
              Generate Report
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search teams..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="nba" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="nba">NBA</TabsTrigger>
                  <TabsTrigger value="wnba">WNBA</TabsTrigger>
                  <TabsTrigger value="mens-college-basketball">NCAAM</TabsTrigger>
                  <TabsTrigger value="womens-college-basketball">NCAAW</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Teams by Conference */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-pulse">Loading teams...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredTeams).map(([conference, teams]) => (
              <div key={conference}>
                <h2 className="text-xl font-semibold mb-4">{conference}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map(team => {
                    // Get team colors or use defaults
                    const teamColor = team.color ? `#${team.color}` : "#3b82f6";
                    const borderColorStyle = { borderLeftColor: teamColor };
                    
                    return (
                      <Link to={`/scouting/${team.id}`} key={team.id}>
                        <Card 
                          className="transition-all hover:shadow-md border-l-4"
                          style={borderColorStyle}
                        >
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {team.logo && (
                                <img 
                                  src={team.logo} 
                                  alt={team.displayName || "Team logo"} 
                                  className="w-10 h-10 object-contain"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold">{team.displayName || "Unknown Team"}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{team.record || "N/A"}</span>
                                  <span>•</span>
                                  <span>{team.division || "Division"}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {Object.keys(filteredTeams).length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teams found matching your search criteria.</p>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    className="mt-2"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scouting;
