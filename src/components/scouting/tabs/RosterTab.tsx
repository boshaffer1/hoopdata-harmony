
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScoutingReport } from "@/utils/espn-service";

interface RosterTabProps {
  report: ScoutingReport;
}

export function RosterTab({ report }: RosterTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Roster</CardTitle>
        <CardDescription>
          Coach: {report.coach || 'N/A'}
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
  );
}
