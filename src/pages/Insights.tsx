
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, BarChart, PieChart } from "lucide-react";

const Insights = () => {
  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Insights</h1>
        <p className="text-muted-foreground">
          Visualize performance data and uncover actionable insights
        </p>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shooting Performance</CardTitle>
                <CardDescription>
                  Field goal percentages across different game scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-primary/60 mb-2 mx-auto" />
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Points Distribution</CardTitle>
                <CardDescription>
                  Breakdown of scoring by player position and quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-primary/60 mb-2 mx-auto" />
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  Track team performance metrics across the season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[2/1] bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-primary/60 mb-2 mx-auto" />
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="players" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Player Analysis</CardTitle>
              <CardDescription>
                Individual player performance metrics and comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Coming Soon
                </div>
                <p className="text-muted-foreground mb-6">
                  We're building advanced player analytics features. Check back soon!
                </p>
                <Progress value={60} className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Long-term trends and pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Coming Soon
                </div>
                <p className="text-muted-foreground mb-6">
                  Our trend analysis features are under development. Stay tuned!
                </p>
                <Progress value={40} className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Insights;
