
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsData, ClipStat } from "@/utils/analyzer-stats";
import { Progress } from "@/components/ui/progress";
import { BarChart, Users, Layers } from "lucide-react";
import SituationStats from "./SituationStats";
import PlayerStats from "./PlayerStats";
import TeamStats from "./TeamStats";

interface AnalyticsOverviewProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analytics</CardTitle>
          <CardDescription>Calculating statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={65} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalClips === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>Add clips to your library to see analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Statistics will appear here once you have clips in your library</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Clip Analytics</CardTitle>
        <CardDescription>
          Statistics based on {data.totalClips} total clips
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="situations">
          <TabsList className="mb-4">
            <TabsTrigger value="situations" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              Situations
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              Teams
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="situations">
            <SituationStats situations={data.situations} />
          </TabsContent>
          
          <TabsContent value="players">
            <PlayerStats players={data.players} />
          </TabsContent>
          
          <TabsContent value="teams">
            <TeamStats teams={data.teams} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsOverview;
