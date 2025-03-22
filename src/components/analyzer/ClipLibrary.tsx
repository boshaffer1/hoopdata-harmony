
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkIcon, Trash2, Download, List, PlayCircle } from "lucide-react";
import { SavedClip, GameData } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";

interface ClipLibraryProps {
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (clip: GameData) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
}

const ClipLibrary: React.FC<ClipLibraryProps> = ({
  savedClips,
  playLabel,
  selectedClip,
  onPlayLabelChange,
  onSaveClip,
  onRemoveClip,
  onExportClip,
  onExportLibrary,
  onPlayClip,
}) => {
  const playSelectedClip = () => {
    if (selectedClip) {
      onSaveClip(selectedClip);
    }
  };

  const handlePlayClip = (clip: SavedClip) => {
    const gameDataClip: GameData = {
      "Start time": clip.startTime.toString(),
      "Duration": clip.duration.toString(),
      Notes: clip.label,
      Timeline: clip.timeline,
    };
    onPlayClip(clip);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Clip Library</CardTitle>
        <CardDescription>
          Save and export video clips
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add to library section */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <h3 className="text-sm font-medium mb-2">Add Current Clip to Library</h3>
          {selectedClip ? (
            <>
              <div className="text-xs mb-3 bg-primary/10 p-2 rounded">
                Selected: {selectedClip.Notes || "Unnamed clip"} ({formatVideoTime(parseFloat(selectedClip["Start time"] || "0"))})
              </div>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={playLabel}
                  onChange={(e) => onPlayLabelChange(e.target.value)}
                  placeholder="Label this play (e.g. 'Goal Kick')"
                  className="flex-1"
                />
              </div>
              <Button onClick={playSelectedClip} className="w-full">
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Save to Library
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Play a clip from the data table and add it to your library
            </p>
          )}
        </div>

        {/* Saved clips library */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Saved Clips</h3>
            {savedClips.length > 0 && (
              <Button variant="outline" size="sm" onClick={onExportLibrary}>
                <Download className="h-4 w-4 mr-2" />
                Export Library
              </Button>
            )}
          </div>

          {savedClips.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <List className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Your clip library is empty
              </p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {savedClips.map((clip) => (
                <li 
                  key={clip.id}
                  className="border rounded-lg p-3 hover:bg-muted/50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{clip.label}</h4>
                      <p className="text-xs text-muted-foreground">
                        {clip.timeline} • {formatVideoTime(clip.startTime)} ({formatVideoTime(clip.duration)})
                      </p>
                      {clip.notes && (
                        <p className="text-xs mt-1">{clip.notes}</p>
                      )}
                    </div>
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePlayClip(clip)}
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onExportClip(clip)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onRemoveClip(clip.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClipLibrary;
