
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, User } from "lucide-react";
import FileUploader from "@/components/data/FileUploader";
import { GameData } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";
import { Badge } from "@/components/ui/badge";

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
  const renderDataTable = () => {
    if (data.length === 0) {
      return <FileUploader onFileLoaded={onFileLoaded} />;
    }
    
    return (
      <div>
        <div className="mb-4 bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">CSV Data Preview</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Click the play button on any row to play that specific clip from the video.
          </p>
          {selectedClip && (
            <div className="bg-primary/10 p-2 rounded text-xs">
              <span className="font-medium">Currently selected: </span>
              {selectedClip.Notes || selectedClip.Timeline || "Unnamed clip"} 
              (Start: {formatVideoTime(parseFloat(selectedClip["Start time"] || "0"))}, 
              Duration: {formatVideoTime(parseFloat(selectedClip["Duration"] || "0"))})
              
              {selectedClip.Players && (
                <div className="mt-1 flex gap-1 flex-wrap">
                  <span className="font-medium">Players: </span>
                  {(() => {
                    try {
                      const players = JSON.parse(selectedClip.Players);
                      return players.map((player: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" /> 
                          {player.playerName}: {player.action}
                        </Badge>
                      ));
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Actions</th>
                <th className="px-4 py-2">Timeline</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Players</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-t hover:bg-muted/50 ${selectedClip === item ? 'bg-primary/10' : ''}`}
                >
                  <td className="px-4 py-2">
                    <div className="flex space-x-1">
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
                  </td>
                  <td className="px-4 py-2">{item.Timeline || '-'}</td>
                  <td className="px-4 py-2">{formatVideoTime(parseFloat(item["Start time"] || "0"))}</td>
                  <td className="px-4 py-2">{formatVideoTime(parseFloat(item["Duration"] || "0"))}</td>
                  <td className="px-4 py-2">{item.Notes || '-'}</td>
                  <td className="px-4 py-2">
                    {item.Players ? (
                      <div className="flex gap-1 flex-wrap">
                        {(() => {
                          try {
                            const players = JSON.parse(item.Players);
                            return players.map((player: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {player.playerName}: {player.action}
                              </Badge>
                            ));
                          } catch (e) {
                            return '-';
                          }
                        })()}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Data</CardTitle>
        <CardDescription>
          Upload and view your game data CSV file
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderDataTable()}
      </CardContent>
    </Card>
  );
};

export default GameDataSection;
