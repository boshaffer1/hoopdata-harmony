
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamRoster } from "@/types/analyzer";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopPlayers } from "./TopPlayers";

interface TeamStatsProps {
  rosters: TeamRoster[];
}

export const TeamStats: React.FC<TeamStatsProps> = ({ rosters }) => {
  // Use the first team in the rosters for now
  const team = rosters[0];
  
  // Example stat distributions
  const pointsDistribution = [
    { name: "P1", value: 15.2 },
    { name: "P2", value: 12.8 },
    { name: "P3", value: 10.5 },
    { name: "P4", value: 9.3 },
    { name: "P5", value: 8.1 },
    { name: "P6", value: 6.7 },
    { name: "P7", value: 4.2 },
    { name: "P8", value: 3.5 },
  ];
  
  const teamOverview = {
    record: "15-8",
    conference: "7-5",
    ppg: 78.2,
    oppg: 72.5,
    rpg: 36.8,
    apg: 14.2,
    spg: 6.3,
    bpg: 4.1,
    topf: 12.5,
    fgp: 45.3,
    tpp: 34.8,
    ftp: 72.6
  };
  
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Team Overview</TabsTrigger>
        <TabsTrigger value="players">Players</TabsTrigger>
        <TabsTrigger value="distribution">Stat Distribution</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>{team ? team.name : "Team"} Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Record</p>
                <p className="text-2xl font-bold">{teamOverview.record}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conf. Record</p>
                <p className="text-2xl font-bold">{teamOverview.conference}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Points Per Game</p>
                <p className="text-2xl font-bold">{teamOverview.ppg}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Opp. Points</p>
                <p className="text-2xl font-bold">{teamOverview.oppg}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rebounds</p>
                <p className="text-2xl font-bold">{teamOverview.rpg}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assists</p>
                <p className="text-2xl font-bold">{teamOverview.apg}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Steals</p>
                <p className="text-2xl font-bold">{teamOverview.spg}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Blocks</p>
                <p className="text-2xl font-bold">{teamOverview.bpg}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">FG%</p>
                <p className="text-2xl font-bold">{teamOverview.fgp}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">3P%</p>
                <p className="text-2xl font-bold">{teamOverview.tpp}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">FT%</p>
                <p className="text-2xl font-bold">{teamOverview.ftp}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Turnovers</p>
                <p className="text-2xl font-bold">{teamOverview.topf}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <TopPlayers team={team} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="players">
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Pos</TableHead>
                  <TableHead className="text-right">PPG</TableHead>
                  <TableHead className="text-right">RPG</TableHead>
                  <TableHead className="text-right">APG</TableHead>
                  <TableHead className="text-right">FG%</TableHead>
                  <TableHead className="text-right">3P%</TableHead>
                  <TableHead className="text-right">FT%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team && team.players.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      {player.name} <span className="text-muted-foreground">#{player.number}</span>
                    </TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell className="text-right">{(15 - index * 1.5).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{(8 - index * 0.7).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{(5 - index * 0.5).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{(48 - index * 2).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{(38 - index * 2).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{(80 - index * 3).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="distribution">
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ points: { color: "#0ea5e9" } }} className="h-[400px]">
              <BarChart data={pointsDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-points)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
