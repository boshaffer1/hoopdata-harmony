
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import FileUploader from "@/components/data/FileUploader";
import { GameData } from "@/types/analyzer";

interface GameDataSectionProps {
  data: GameData[];
  videoUrl?: string;
  selectedClip: GameData | null;
  onFileLoaded: (loadedData: any) => void;
  onPlayClip: (item: GameData) => void;
}

const GameDataSection: React.FC<GameDataSectionProps> = ({
  data,
  videoUrl,
  selectedClip,
  onFileLoaded,
  onPlayClip,
}) => {
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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
              (Start: {formatTime(parseFloat(selectedClip["Start time"] || "0"))}, 
              Duration: {formatTime(parseFloat(selectedClip["Duration"] || "0"))})
            </div>
          )}
        </div>
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Play</th>
                <th className="px-4 py-2">Timeline</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-t hover:bg-muted/50 ${selectedClip === item ? 'bg-primary/10' : ''}`}
                >
                  <td className="px-4 py-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onPlayClip(item)}
                      disabled={!videoUrl}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-2">{item.Timeline || '-'}</td>
                  <td className="px-4 py-2">{formatTime(parseFloat(item["Start time"] || "0"))}</td>
                  <td className="px-4 py-2">{formatTime(parseFloat(item["Duration"] || "0"))}</td>
                  <td className="px-4 py-2">{item.Notes || '-'}</td>
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
