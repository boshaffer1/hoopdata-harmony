
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FolderTree,
  Folder,
  FileVideo,
  Plus,
  Files,
  Edit,
  Trash2,
  PlayCircle,
  Database,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { SavedClip, ClipFolder, Game } from "@/types/analyzer";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/video/VideoPlayer";

interface TeamFolderStructureProps {
  folders: ClipFolder[];
  games: Game[];
  savedClips: SavedClip[];
  activeFolder: string | null;
  videoUrl: string | undefined;
  onSelectFolder: (folderId: string) => void;
  onCreateTeam: (name: string, description: string) => ClipFolder | undefined;
  onCreateFolder: (name: string, description: string, options: any) => ClipFolder | undefined;
  onUpdateFolder: (id: string, updates: Partial<ClipFolder>) => void;
  onDeleteFolder: (id: string) => void;
  onAddGame: (gameData: Omit<Game, "id" | "createdAt" | "updatedAt">) => Game | undefined;
  onUpdateGame: (id: string, updates: Partial<Game>) => void;
  onDeleteGame: (id: string) => void;
  onPlayClip: (clip: SavedClip) => void;
}

export const TeamFolderStructure: React.FC<TeamFolderStructureProps> = ({
  folders,
  games,
  savedClips,
  activeFolder,
  videoUrl,
  onSelectFolder,
  onCreateTeam,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onPlayClip,
}) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [editFolder, setEditFolder] = useState<ClipFolder | null>(null);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  
  // Game management state
  const [newGameTitle, setNewGameTitle] = useState("");
  const [newGameDate, setNewGameDate] = useState("");
  const [newGameHome, setNewGameHome] = useState("");
  const [newGameAway, setNewGameAway] = useState("");
  const [newGameTeamId, setNewGameTeamId] = useState<string | null>(null);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [showEditGameDialog, setShowEditGameDialog] = useState(false);
  
  // Video playback state
  const [selectedClip, setSelectedClip] = useState<SavedClip | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Get team folders (root folders with folderType = "team")
  const teamFolders = folders.filter(folder => folder.folderType === "team");
  
  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };
  
  const getTeamClips = (teamId: string) => {
    return savedClips.filter(clip => clip.teamId === teamId);
  };
  
  const getFolderClips = (folderId: string) => {
    return savedClips.filter(clip => clip.folderId === folderId);
  };
  
  const getClipsInPlayFolder = (parentId: string) => {
    // Find plays folder first
    const playsFolder = folders.find(f => f.parentId === parentId && f.folderType === "plays");
    if (!playsFolder) return [];
    
    // Get all clips in any subfolder of the plays folder
    const playFolderIds = getSubfolders(playsFolder.id).map(f => f.id);
    return savedClips.filter(clip => playFolderIds.includes(clip.folderId || ''));
  };
  
  const getTeamGames = (teamId: string) => {
    return games.filter(game => game.teamId === teamId);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    onCreateTeam(newTeamName, newTeamDescription);
    setNewTeamName("");
    setNewTeamDescription("");
    setShowNewTeamDialog(false);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    if (!newFolderParent) {
      toast.error("Parent folder is required");
      return;
    }

    const folder = onCreateFolder(newFolderName, newFolderDescription, {
      parentId: newFolderParent,
      teamId: newFolderParent // In this case we're setting the teamId to be the parent
    });

    if (folder) {
      setNewFolderName("");
      setNewFolderDescription("");
      setNewFolderParent(null);
      setShowNewFolderDialog(false);
    }
  };

  const handleUpdateFolder = () => {
    if (!editFolder) return;
    
    if (!editFolder.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    onUpdateFolder(editFolder.id, {
      name: editFolder.name,
      description: editFolder.description
    });

    setEditFolder(null);
    setShowEditFolderDialog(false);
  };
  
  const handleAddGame = () => {
    if (!newGameTitle.trim()) {
      toast.error("Game title is required");
      return;
    }
    
    if (!newGameDate.trim()) {
      toast.error("Game date is required");
      return;
    }
    
    if (!newGameHome.trim() || !newGameAway.trim()) {
      toast.error("Home and away teams are required");
      return;
    }
    
    if (!newGameTeamId) {
      toast.error("Team is required");
      return;
    }
    
    const gameData = {
      title: newGameTitle,
      date: newGameDate,
      homeTeam: newGameHome,
      awayTeam: newGameAway,
      teamId: newGameTeamId
    };
    
    const game = onAddGame(gameData);
    
    if (game) {
      setNewGameTitle("");
      setNewGameDate("");
      setNewGameHome("");
      setNewGameAway("");
      setNewGameTeamId(null);
      setShowNewGameDialog(false);
    }
  };
  
  const handleUpdateGame = () => {
    if (!editGame) return;
    
    if (!editGame.title.trim()) {
      toast.error("Game title is required");
      return;
    }
    
    onUpdateGame(editGame.id, {
      title: editGame.title,
      date: editGame.date,
      homeTeam: editGame.homeTeam,
      awayTeam: editGame.awayTeam
    });
    
    setEditGame(null);
    setShowEditGameDialog(false);
  };
  
  const handlePlayClip = (clip: SavedClip) => {
    setSelectedClip(clip);
    setShowVideoPlayer(true);
    onPlayClip(clip);
  };
  
  // Group clips by their names to make sub-folders
  const groupClipsByName = (clips: SavedClip[]) => {
    const groupedClips: Record<string, SavedClip[]> = {};
    
    clips.forEach(clip => {
      const name = clip.label;
      if (!groupedClips[name]) {
        groupedClips[name] = [];
      }
      groupedClips[name].push(clip);
    });
    
    return groupedClips;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teams & Folders</h2>
        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to organize your game clips and data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Chicago Bulls"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description (optional)</Label>
                <Textarea
                  id="team-description"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Team notes or description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teamFolders.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <FolderTree className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No teams created yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowNewTeamDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Team
          </Button>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {teamFolders.map((team) => {
            const teamGames = getTeamGames(team.id);
            const teamClips = getTeamClips(team.id);
            const playFolders = getSubfolders(team.id).filter(f => f.folderType === "plays");
            const gameFolders = getSubfolders(team.id).filter(f => f.folderType === "games");
            const playsClips = getClipsInPlayFolder(team.id);
            
            return (
              <AccordionItem 
                key={team.id} 
                value={team.id}
                className="border rounded-md overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span>{team.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {teamClips.length} clips
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <div className="space-y-4">
                    {team.description && (
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setNewFolderParent(team.id);
                          setShowNewFolderDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Folder
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setNewGameTeamId(team.id);
                          setShowNewGameDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Game
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditFolder(team);
                          setShowEditFolderDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteFolder(team.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                    
                    {/* Plays Section */}
                    {playFolders.length > 0 && (
                      <div className="border rounded-md p-3 bg-muted/30">
                        <Accordion type="multiple" className="space-y-1">
                          {playFolders.map(playsFolder => {
                            const subfolders = getSubfolders(playsFolder.id);
                            const allPlays = subfolders.flatMap(subfolder => 
                              getFolderClips(subfolder.id)
                            );
                            
                            // Group plays by name to make "virtual subfolders"
                            const groupedPlays = groupClipsByName(allPlays);
                            
                            return (
                              <AccordionItem 
                                key={playsFolder.id} 
                                value={playsFolder.id}
                                className="border rounded-md overflow-hidden bg-background"
                              >
                                <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Files className="h-4 w-4" />
                                    <span>{playsFolder.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {allPlays.length} clips
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-2">
                                  {Object.keys(groupedPlays).length > 0 ? (
                                    <Accordion type="single" collapsible className="space-y-1">
                                      {Object.entries(groupedPlays).map(([name, clips]) => (
                                        <AccordionItem 
                                          key={name} 
                                          value={name}
                                          className="border rounded-md overflow-hidden"
                                        >
                                          <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                                            <div className="flex items-center gap-2">
                                              <FileVideo className="h-4 w-4" />
                                              <span>{name}</span>
                                              <Badge variant="outline" className="ml-2">
                                                {clips.length} clips
                                              </Badge>
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <div className="space-y-2 p-2">
                                              {clips.map(clip => (
                                                <div 
                                                  key={clip.id}
                                                  className="border rounded p-2 hover:bg-muted/50 cursor-pointer"
                                                  onClick={() => handlePlayClip(clip)}
                                                >
                                                  <div className="flex items-start justify-between">
                                                    <div>
                                                      <div className="flex items-center gap-1">
                                                        <PlayCircle className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">{clip.label}</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">
                                                        {clip.startTime.toFixed(1)}s ({clip.duration.toFixed(1)}s)
                                                      </p>
                                                      {clip.notes && (
                                                        <p className="text-xs mt-1">{clip.notes}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                  ) : (
                                    <div className="text-center py-4">
                                      <p className="text-sm text-muted-foreground">No plays in this folder</p>
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </div>
                    )}
                    
                    {/* Games Section */}
                    {gameFolders.length > 0 && (
                      <div className="border rounded-md p-3 bg-muted/30">
                        <Accordion type="multiple" className="space-y-1">
                          {gameFolders.map(gamesFolder => (
                            <AccordionItem 
                              key={gamesFolder.id} 
                              value={gamesFolder.id}
                              className="border rounded-md overflow-hidden bg-background"
                            >
                              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{gamesFolder.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {teamGames.length} games
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-2">
                                {teamGames.length > 0 ? (
                                  <div className="space-y-2">
                                    {teamGames.map(game => (
                                      <div 
                                        key={game.id}
                                        className="border rounded p-3 hover:bg-muted/50"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h4 className="font-medium">{game.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                              {game.date} • {game.homeTeam} vs {game.awayTeam}
                                            </p>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-8 w-8"
                                              onClick={() => {
                                                setEditGame(game);
                                                setShowEditGameDialog(true);
                                              }}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() => onDeleteGame(game.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">No games added yet</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-2"
                                      onClick={() => {
                                        setNewGameTeamId(team.id);
                                        setShowNewGameDialog(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add Game
                                    </Button>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      
      {/* VideoPlayer for selected clip */}
      {showVideoPlayer && selectedClip && videoUrl && (
        <div className="mt-6 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{selectedClip.label}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowVideoPlayer(false)}
            >
              Close Player
            </Button>
          </div>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer 
              src={videoUrl} 
              onTimeUpdate={() => {}}
              markers={[{ time: selectedClip.startTime, label: "Start", color: "#10b981" }]}
            />
          </div>
          
          {selectedClip.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Notes</h4>
              <p className="text-sm">{selectedClip.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your clips.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Offensive Plays"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-description">Description (optional)</Label>
              <Textarea
                id="folder-description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Folder description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={editFolder?.name || ""}
                onChange={(e) => setEditFolder(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Folder name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-folder-description">Description (optional)</Label>
              <Textarea
                id="edit-folder-description"
                value={editFolder?.description || ""}
                onChange={(e) => setEditFolder(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Folder description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder}>Update Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Game Dialog */}
      <Dialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Add a new game to your team's schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="game-title">Game Title</Label>
              <Input
                id="game-title"
                value={newGameTitle}
                onChange={(e) => setNewGameTitle(e.target.value)}
                placeholder="e.g., Regular Season Game 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="game-date">Date</Label>
              <Input
                id="game-date"
                type="date"
                value={newGameDate}
                onChange={(e) => setNewGameDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-team">Home Team</Label>
                <Input
                  id="home-team"
                  value={newGameHome}
                  onChange={(e) => setNewGameHome(e.target.value)}
                  placeholder="Home Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-team">Away Team</Label>
                <Input
                  id="away-team"
                  value={newGameAway}
                  onChange={(e) => setNewGameAway(e.target.value)}
                  placeholder="Away Team"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGame}>Add Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Game Dialog */}
      <Dialog open={showEditGameDialog} onOpenChange={setShowEditGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>
              Update game details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-game-title">Game Title</Label>
              <Input
                id="edit-game-title"
                value={editGame?.title || ""}
                onChange={(e) => setEditGame(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Game title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-game-date">Date</Label>
              <Input
                id="edit-game-date"
                type="date"
                value={editGame?.date || ""}
                onChange={(e) => setEditGame(prev => prev ? { ...prev, date: e.target.value } : null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-home-team">Home Team</Label>
                <Input
                  id="edit-home-team"
                  value={editGame?.homeTeam || ""}
                  onChange={(e) => setEditGame(prev => prev ? { ...prev, homeTeam: e.target.value } : null)}
                  placeholder="Home Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-away-team">Away Team</Label>
                <Input
                  id="edit-away-team"
                  value={editGame?.awayTeam || ""}
                  onChange={(e) => setEditGame(prev => prev ? { ...prev, awayTeam: e.target.value } : null)}
                  placeholder="Away Team"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGame}>Update Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
