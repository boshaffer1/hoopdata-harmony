
import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useScoutingReport } from "@/hooks/use-scouting-report";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Import our new components
import { TeamHeader } from "@/components/scouting/TeamHeader";
import { NavigationBar } from "@/components/scouting/NavigationBar";
import { NotFound } from "@/components/scouting/NotFound";
import { OverviewTab } from "@/components/scouting/tabs/OverviewTab";
import { RosterTab } from "@/components/scouting/tabs/RosterTab";
import { TeamStatsTab } from "@/components/scouting/tabs/TeamStatsTab";
import { PlayerAnalysisTab } from "@/components/scouting/tabs/PlayerAnalysisTab";
import { ScoutingReportTab } from "@/components/scouting/tabs/ScoutingReportTab";

const ScoutingReportPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { report, loading, selectedPlayer, setSelectedPlayer, generateReport } = useScoutingReport(teamId);
  
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
        <NotFound />
      </Layout>
    );
  }
  
  return (
    <Layout className="py-6">
      <div className="space-y-6">
        {/* Breadcrumb & Actions */}
        <NavigationBar teamName={report.teamName || ''} generateReport={generateReport} />
        
        {/* Team Header */}
        <TeamHeader report={report} />
        
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
            <OverviewTab report={report} />
          </TabsContent>
          
          {/* Roster Tab */}
          <TabsContent value="roster">
            <RosterTab report={report} />
          </TabsContent>
          
          {/* Team Stats Tab */}
          <TabsContent value="teamStats">
            <TeamStatsTab report={report} />
          </TabsContent>
          
          {/* Player Analysis Tab */}
          <TabsContent value="playerAnalysis">
            <PlayerAnalysisTab 
              report={report} 
              selectedPlayer={selectedPlayer} 
              setSelectedPlayer={setSelectedPlayer!} 
            />
          </TabsContent>
          
          {/* Scouting Report Tab */}
          <TabsContent value="scoutingReport">
            <ScoutingReportTab report={report} generateReport={generateReport} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScoutingReportPage;
