
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/analyzer";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceTrendsProps {
  player: Player;
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ player }) => {
  // Mock game data for the performance chart
  const gameData = [
    { game: "Wake", points: 15, rebounds: 8, assists: 5, minutes: 28 },
    { game: "Florida", points: 12, rebounds: 5, assists: 3, minutes: 25 },
    { game: "Louisville", points: 22, rebounds: 10, assists: 2, minutes: 30 },
    { game: "N. Carolina", points: 18, rebounds: 12, assists: 6, minutes: 32 },
    { game: "Virginia", points: 16, rebounds: 7, assists: 4, minutes: 27 },
    { game: "N. Carolina", points: 24, rebounds: 9, assists: 3, minutes: 35 },
    { game: "Miami", points: 19, rebounds: 11, assists: 7, minutes: 34 },
    { game: "Notre Dame", points: 14, rebounds: 6, assists: 2, minutes: 26 },
    { game: "Virginia", points: 21, rebounds: 8, assists: 5, minutes: 33 },
    { game: "Miami", points: 17, rebounds: 9, assists: 4, minutes: 29 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="rebounds">Rebounds</TabsTrigger>
            <TabsTrigger value="assists">Assists</TabsTrigger>
            <TabsTrigger value="minutes">Minutes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="points">
            <ChartContainer config={{ points: { color: "#0ea5e9" } }} className="h-[300px]">
              <LineChart data={gameData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="var(--color-points)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ChartContainer>
            <p className="text-xs text-center mt-2 text-muted-foreground">Last 10 games • Data from ESPN</p>
          </TabsContent>
          
          <TabsContent value="rebounds">
            <ChartContainer config={{ rebounds: { color: "#f97316" } }} className="h-[300px]">
              <LineChart data={gameData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rebounds" stroke="var(--color-rebounds)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ChartContainer>
            <p className="text-xs text-center mt-2 text-muted-foreground">Last 10 games • Data from ESPN</p>
          </TabsContent>
          
          <TabsContent value="assists">
            <ChartContainer config={{ assists: { color: "#22c55e" } }} className="h-[300px]">
              <LineChart data={gameData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="assists" stroke="var(--color-assists)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ChartContainer>
            <p className="text-xs text-center mt-2 text-muted-foreground">Last 10 games • Data from ESPN</p>
          </TabsContent>
          
          <TabsContent value="minutes">
            <ChartContainer config={{ minutes: { color: "#a855f7" } }} className="h-[300px]">
              <LineChart data={gameData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="var(--color-minutes)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ChartContainer>
            <p className="text-xs text-center mt-2 text-muted-foreground">Last 10 games • Data from ESPN</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
