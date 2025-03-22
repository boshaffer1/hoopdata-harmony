
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookmarkIcon, Trash2, Download, List, PlayCircle, PlusCircle, User, XCircle } from "lucide-react";
import { SavedClip, GameData, PlayerAction, PlayerActionType, PLAYER_ACTIONS } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";
import { Badge } from "@/components/ui/badge";

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
  const [playerName, setPlayerName] = useState("");
  const [playerAction, setPlayerAction] = useState<PlayerActionType>("scored");
  const [activePlayers, setActivePlayers] = useState<PlayerAction[]>([]);

  const addPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: PlayerAction = {
      playerId: Date.now().toString(),
      playerName: playerName.trim(),
      action: playerAction
    };
    
    setActivePlayers([...activePlayers, newPlayer]);
    setPlayerName("");
  };
  
  const removePlayer = (playerId: string) => {
    setActivePlayers(activePlayers.filter(p => p.playerId !== playerId));
  };

  const playSelectedClip = () => {
    if (selectedClip) {
      const clipWithPlayers = {
        ...selectedClip,
        Players: JSON.stringify(activePlayers)
      };
      onSaveClip(clipWithPlayers);
      setActivePlayers([]);
    }
  };

  const handlePlayClip = (clip: SavedClip) => {
    onPlayClip(clip);
  };

  const getActionColor = (action: PlayerActionType): string => {
    const colors: Record<PlayerActionType, string> = {
      scored: "bg-green-500",
      missed: "bg-red-500",
      assist: "bg-blue-500",
      rebound: "bg-purple-500",
      block: "bg-yellow-500",
      steal: "bg-indigo-500",
      turnover: "bg-orange-500",
      foul: "bg-pink-500",
      other: "bg-gray-500"
    };
    
    return colors[action] || "bg-gray-500";
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
              
              {/* Player tracking section */}
              <div className="mt-4 mb-3 border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Player Actions</h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Player name"
                    className="flex-1"
                  />
                  <Select value={playerAction} onValueChange={(value) => setPlayerAction(value as PlayerActionType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAYER_ACTIONS.map(action => (
                        <SelectItem key={action} value={action}>
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={addPlayer}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display active players */}
                {activePlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {activePlayers.map(player => (
                      <Badge key={player.playerId} variant="outline" className="flex items-center gap-1 px-2 py-1">
                        <User className="h-3 w-3" />
                        <span>{player.playerName}</span>
                        <span className={`w-2 h-2 rounded-full ${getActionColor(player.action)}`} />
                        <span className="text-xs">{player.action}</span>
                        <button onClick={() => removePlayer(player.playerId)} className="ml-1">
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
                      
                      {/* Display player actions */}
                      {clip.players && clip.players.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {clip.players.map((player, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${getActionColor(player.action)} mr-1`} />
                              {player.playerName}: {player.action}
                            </Badge>
                          ))}
                        </div>
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
