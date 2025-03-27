import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ClipFolder, Game } from "@/types/analyzer";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDown, 
  ChevronRight, 
  FolderIcon, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Video, 
  Play, 
  FileVideo, 
  FileBarChart2,
  Files
} from "lucide-react";

interface TeamFolderStructureProps {
  folders: ClipFolder[];
  games: Game[];
  activeFolder: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateTeam: (name: string, description: string) => void;
  onCreateFolder: (name: string, description: string, options: any) => void;
  onUpdateFolder: (id: string, updates: Partial<ClipFolder>) => void;
  onDeleteFolder: (id: string) => void;
  onAddGame: (gameData: any) => void;
  onUpdateGame: (id: string, updates: any) => void;
  onDeleteGame: (id: string) => void;
}

export const TeamFolderStructure: React.FC<TeamFolderStructureProps> = ({
  folders,
  games,
  activeFolder,
  onSelectFolder,
  onCreateTeam,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAddGame,
  onUpdateGame,
  onDeleteGame
}) => {
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isAddGameDialogOpen, setIsAddGameDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [gameData, setGameData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    homeTeam: '',
    awayTeam: '',
    videoUrl: '',
    dataUrl: ''
  });

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      onCreateTeam(newTeamName, newTeamDescription);
      setNewTeamName('');
      setNewTeamDescription('');
      setIsCreateTeamDialogOpen(false);
    }
  };

  const handleAddGame = () => {
    if (gameData.title && gameData.homeTeam && gameData.awayTeam && selectedTeamId) {
      const newGame = onAddGame({
        ...gameData,
        teamId: selectedTeamId
      });
      
      // Find the Games folder for this team
      const gamesFolder = folders.find(f => 
        f.teamId === selectedTeamId && f.folderType === 'games'
      );
      
      if (gamesFolder) {
        // Save the game full video as a clip in the library
        // This would typically call the saveClipToLibrary function
        // We'd implement this in a real-world scenario
      }
      
      setGameData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        homeTeam: '',
        awayTeam: '',
        videoUrl: '',
        dataUrl: ''
      });
      setIsAddGameDialogOpen(false);
    }
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const buildFolderTree = () => {
    const teamFolders = folders.filter(folder => folder.folderType === 'team');
    
    return teamFolders.map(teamFolder => {
      const isExpanded = expandedFolders[teamFolder.id] || false;
      const childFolders = folders.filter(folder => folder.parentId === teamFolder.id);
      
      return (
        <div key={teamFolder.id} className="mb-2">
          <div 
            className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
              activeFolder === teamFolder.id ? 'bg-primary/10 border border-primary/30' : 'border border-transparent'
            }`}
          >
            <div 
              className="flex items-center gap-2 flex-1"
              onClick={() => toggleFolderExpanded(teamFolder.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <FolderIcon className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{teamFolder.name}</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTeamId(teamFolder.id);
                  setIsAddGameDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFolder(teamFolder.id);
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {childFolders.map(childFolder => {
                const isChildExpanded = expandedFolders[childFolder.id] || false;
                const folderGames = childFolder.folderType === 'games' 
                  ? games.filter(game => game.homeTeam === teamFolder.name || game.awayTeam === teamFolder.name)
                  : [];
                
                return (
                  <div key={childFolder.id}>
                    <div 
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
                        activeFolder === childFolder.id ? 'bg-primary/10 border border-primary/30' : 'border border-transparent'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-2 flex-1"
                        onClick={() => {
                          toggleFolderExpanded(childFolder.id);
                          onSelectFolder(childFolder.id);
                        }}
                      >
                        {childFolder.folderType === 'games' && folderGames.length > 0 && (
                          isChildExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        )}
                        {!isChildExpanded && childFolder.folderType === 'games' && folderGames.length === 0 && (
                          <div className="w-4" />
                        )}
                        
                        {childFolder.folderType === 'plays' ? (
                          <FileBarChart2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Video className="h-5 w-5 text-amber-500" />
                        )}
                        <span>{childFolder.name}</span>
                      </div>
                    </div>
                    
                    {isChildExpanded && childFolder.folderType === 'games' && folderGames.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {folderGames.map(game => (
                          <div 
                            key={game.id}
                            className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer`}
                            onClick={() => {
                              // Handle game selection - this would navigate to a game view
                              // or select a folder containing game possessions
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <FileVideo className="h-5 w-5 text-blue-400" />
                              <span>{game.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(game.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Teams</h2>
        <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team folder to organize clips and games
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {folders.some(f => f.folderType === 'team') ? (
          buildFolderTree()
        ) : (
          <div className="text-center py-8">
            <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No teams yet. Create a team to organize your clips.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isAddGameDialogOpen} onOpenChange={setIsAddGameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Add a new game recording to your library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gameTitle">Game Title</Label>
              <Input
                id="gameTitle"
                value={gameData.title}
                onChange={(e) => setGameData({...gameData, title: e.target.value})}
                placeholder="e.g., Season Opener 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameDate">Date</Label>
              <Input
                id="gameDate"
                type="date"
                value={gameData.date}
                onChange={(e) => setGameData({...gameData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeam">Home Team</Label>
                <Input
                  id="homeTeam"
                  value={gameData.homeTeam}
                  onChange={(e) => setGameData({...gameData, homeTeam: e.target.value})}
                  placeholder="Home Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayTeam">Away Team</Label>
                <Input
                  id="awayTeam"
                  value={gameData.awayTeam}
                  onChange={(e) => setGameData({...gameData, awayTeam: e.target.value})}
                  placeholder="Away Team"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                value={gameData.videoUrl}
                onChange={(e) => setGameData({...gameData, videoUrl: e.target.value})}
                placeholder="Video file URL"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you'll upload the video later
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataUrl">Data CSV URL (optional)</Label>
              <Input
                id="dataUrl"
                value={gameData.dataUrl}
                onChange={(e) => setGameData({...gameData, dataUrl: e.target.value})}
                placeholder="Game data CSV URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGame}>Add Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
