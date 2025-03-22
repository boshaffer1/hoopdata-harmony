
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/analyzer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface GameLogProps {
  player: Player;
}

export const GameLog: React.FC<GameLogProps> = ({ player }) => {
  // Mock game log data
  const gameLogData = [
    { 
      date: "2023-02-15", 
      opponent: "Miami", 
      result: "W 78-72", 
      minutes: 29, 
      points: 17, 
      rebounds: 9, 
      assists: 4, 
      steals: 1, 
      blocks: 0, 
      turnovers: 2, 
      fouls: 3 
    },
    { 
      date: "2023-02-10", 
      opponent: "Virginia", 
      result: "W 65-58", 
      minutes: 33, 
      points: 21, 
      rebounds: 8, 
      assists: 5, 
      steals: 2, 
      blocks: 1, 
      turnovers: 1, 
      fouls: 2 
    },
    { 
      date: "2023-02-05", 
      opponent: "Notre Dame", 
      result: "L 68-72", 
      minutes: 26, 
      points: 14, 
      rebounds: 6, 
      assists: 2, 
      steals: 0, 
      blocks: 0, 
      turnovers: 3, 
      fouls: 4 
    },
    { 
      date: "2023-01-30", 
      opponent: "Miami", 
      result: "W 82-74", 
      minutes: 34, 
      points: 19, 
      rebounds: 11, 
      assists: 7, 
      steals: 3, 
      blocks: 2, 
      turnovers: 2, 
      fouls: 1 
    },
    { 
      date: "2023-01-25", 
      opponent: "North Carolina", 
      result: "W 88-81", 
      minutes: 35, 
      points: 24, 
      rebounds: 9, 
      assists: 3, 
      steals: 1, 
      blocks: 1, 
      turnovers: 4, 
      fouls: 3 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>MIN</TableHead>
              <TableHead>PTS</TableHead>
              <TableHead>REB</TableHead>
              <TableHead>AST</TableHead>
              <TableHead>STL</TableHead>
              <TableHead>BLK</TableHead>
              <TableHead>TO</TableHead>
              <TableHead>PF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameLogData.map((game, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{game.date}</TableCell>
                <TableCell>{game.opponent}</TableCell>
                <TableCell>
                  <Badge variant={game.result.startsWith('W') ? 'default' : 'destructive'}>
                    {game.result}
                  </Badge>
                </TableCell>
                <TableCell>{game.minutes}</TableCell>
                <TableCell className="font-bold">{game.points}</TableCell>
                <TableCell>{game.rebounds}</TableCell>
                <TableCell>{game.assists}</TableCell>
                <TableCell>{game.steals}</TableCell>
                <TableCell>{game.blocks}</TableCell>
                <TableCell>{game.turnovers}</TableCell>
                <TableCell>{game.fouls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
