
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, User, Flag } from "lucide-react";
import FileUploader from "@/components/data/FileUploader";
import { GameData, GameSituation, PlayerAction } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GameDataSectionProps {
  data: GameData[];
  videoUrl?: string;
  selectedClip: GameData | null;
  onFileLoaded: (loadedData: any) => void;
  onPlayClip: (item: GameData) => void;
  onExportClip: (item: GameData) => void;
}

const GameDataSection: React.FC<GameDataSectionProps> = ({
  data,
  videoUrl,
  selectedClip,
  onFileLoaded,
  onPlayClip,
  onExportClip,
}) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Data</CardTitle>
          <CardDescription>
            Upload your game data CSV file with play details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader onFileLoaded={onFileLoaded} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Data</CardTitle>
        <CardDescription>
          {data.length} plays loaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actions</TableHead>
                <TableHead>Play Name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Situation</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow 
                  key={index}
                  className={selectedClip === item ? "bg-primary/10" : ""}
                >
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlayClip(item)}
                        disabled={!videoUrl}
                        title="Play clip"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onExportClip(item)}
                        disabled={!videoUrl}
                        title="Export clip"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{item["Play Name"]}</TableCell>
                  <TableCell>{formatVideoTime(parseFloat(item["Start time"] || "0"))}</TableCell>
                  <TableCell>{formatVideoTime(parseFloat(item["Duration"] || "0"))}</TableCell>
                  <TableCell>
                    {item.Situation && (
                      <Badge variant="outline">
                        <Flag className="h-3 w-3 mr-1" />
                        {item.Situation}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.Outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.Players && JSON.parse(item.Players).map((player: PlayerAction, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {player.playerName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.Notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameDataSection;
