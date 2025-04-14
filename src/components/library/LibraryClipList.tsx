import React, { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedClip, ClipFolder, GameSituation } from "@/types/analyzer";
import { PlayerActionBadge } from "../analyzer/clips/PlayerActionBadge";
import { formatVideoTime } from "@/components/video/utils";
import { 
  PlayCircle, 
  Download, 
  Trash2, 
  FolderIcon, 
  Flag, 
  Filter, 
  Search, 
  MoreVertical, 
  User,
  Users,
  SlidersHorizontal,
  Clock,
  Calendar,
  Table,
  Check,
  MoveRight,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { GAME_SITUATIONS } from "@/types/analyzer";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onMoveToFolder: (clipId: string, folderId: string | null, teamId?: string) => void;
}

export const LibraryClipList: React.FC<LibraryClipListProps> = ({
  clips,
  folders,
  activeFolder,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onMoveToFolder
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [situationFilter, setSituationFilter] = useState<GameSituation | "all">("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [playerFilter, setPlayerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [clipTypeFilter, setClipTypeFilter] = useState<string>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<string | null>(null);
  const [moveDialogTab, setMoveDialogTab] = useState<"folders" | "teams">("folders");
  
  const filteredData = useMemo(() => {
    const teams = new Set<string>();
    const players = new Set<string>();
    const dates = new Set<string>();
    const clipTypes = new Set<string>();
    
    clips.forEach(clip => {
      if (clip.players) {
        clip.players.forEach(player => {
          const playerParts = player.playerName.split(" - ");
          if (playerParts.length > 1) {
            teams.add(playerParts[0]);
            players.add(playerParts[1]);
          } else {
            players.add(player.playerName);
          }
        });
      }
      
      const savedDate = new Date(clip.saved).toLocaleDateString();
      dates.add(savedDate);
      
      if (clip.clipType) {
        clipTypes.add(clip.clipType);
      } else {
        clipTypes.add("other");
      }
    });
    
    return {
      teams: Array.from(teams).sort(),
      players: Array.from(players).sort(),
      dates: Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
      clipTypes: Array.from(clipTypes).sort()
    };
  }, [clips]);
  
  const filteredClips = useMemo(() => {
    return clips.filter(clip => {
      const matchesSearch = 
        searchTerm === "" || 
        clip.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.players?.some(p => p.playerName.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesSituation = 
        situationFilter === "all" || 
        clip.situation === situationFilter;
        
      const matchesTeam = 
        teamFilter === "all" || 
        clip.teamId === teamFilter ||
        clip.players?.some(p => {
          const playerParts = p.playerName.split(" - ");
          return playerParts.length > 1 && playerParts[0] === teamFilter;
        });
        
      const matchesPlayer = 
        playerFilter === "all" || 
        clip.players?.some(p => {
          const playerParts = p.playerName.split(" - ");
          if (playerParts.length > 1) {
            return playerParts[1] === playerFilter;
          }
          return p.playerName === playerFilter;
        });
        
      const clipDate = new Date(clip.saved).toLocaleDateString();
      const matchesDate = 
        dateFilter === "all" || 
        clipDate === dateFilter;
        
      const matchesClipType = 
        clipTypeFilter === "all" || 
        (clip.clipType ? clip.clipType === clipTypeFilter : clipTypeFilter === "other");
        
      return matchesSearch && matchesSituation && matchesTeam && 
             matchesPlayer && matchesDate && matchesClipType;
    });
  }, [
    clips, 
    searchTerm, 
    situationFilter, 
    teamFilter, 
    playerFilter, 
    dateFilter, 
    clipTypeFilter
  ]);
  
  const getSituationLabel = (situation: GameSituation): string => {
    const labels: Record<GameSituation, string> = {
      transition: "Transition",
      half_court: "Half Court",
      ato: "After Timeout (ATO)",
      slob: "Sideline Out of Bounds (SLOB)",
      blob: "Baseline Out of Bounds (BLOB)",
      press_break: "Press Break",
      zone_offense: "Zone Offense",
      man_offense: "Man Offense",
      fast_break: "Fast Break",
      other: "Other"
    };
    
    return labels[situation] || situation;
  };
  
  const getTeamFolders = () => {
    return folders.filter(folder => folder.folderType === "team");
  };

  const getSubFolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const getFolderName = (folderId: string | undefined): string => {
    if (!folderId) return "None";
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : "Unknown";
  };

  const resetFilters = () => {
    setSituationFilter("all");
    setTeamFilter("all");
    setPlayerFilter("all");
    setDateFilter("all");
    setClipTypeFilter("all");
    setSearchTerm("");
    toast.success("Filters reset");
  };

  const toggleClipSelection = (clipId: string) => {
    setSelectedClipIds(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId) 
        : [...prev, clipId]
    );
  };
  
  const selectAllFilteredClips = () => {
    if (selectedClipIds.length === filteredClips.length) {
      setSelectedClipIds([]);
    } else {
      setSelectedClipIds(filteredClips.map(clip => clip.id));
    }
  };
  
  const moveSelectedClips = () => {
    if (selectedClipIds.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    if (moveDialogTab === "folders" && targetFolderId === undefined) {
      toast.error("Please select a destination folder");
      return;
    }
    
    if (moveDialogTab === "teams" && targetTeamId === undefined) {
      toast.error("Please select a destination team");
      return;
    }
    
    selectedClipIds.forEach(clipId => {
      if (moveDialogTab === "folders") {
        onMoveToFolder(clipId, targetFolderId, undefined);
      } else {
        const teamFolder = folders.find(f => f.id === targetTeamId);
        if (!teamFolder) {
          toast.error(`Team folder not found`);
          return;
        }
        
        const playsFolder = folders.find(f => 
          f.parentId === targetTeamId && 
          f.folderType === "plays"
        );
        
        if (!playsFolder) {
          toast.error(`Plays folder not found for team ${teamFolder.name}`);
          return;
        }
        
        onMoveToFolder(clipId, playsFolder.id, targetTeamId);
      }
    });
    
    const destinationName = moveDialogTab === "folders" 
      ? targetFolderId ? getFolderName(targetFolderId) : "root" 
      : getFolderName(targetTeamId);
    
    toast.success(`Moved ${selectedClipIds.length} clips to ${destinationName}`);
    setSelectedClipIds([]);
    setShowMoveDialog(false);
    setTargetFolderId(null);
    setTargetTeamId(null);
  };
  
  const deleteSelectedClips = () => {
    if (selectedClipIds.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedClipIds.length} clips?`)) {
      selectedClipIds.forEach(clipId => {
        onRemoveClip(clipId);
      });
      
      toast.success(`Deleted ${selectedClipIds.length} clips`);
      setSelectedClipIds([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by clip name, notes, or player"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant={showFilterPanel ? "default" : "outline"} 
            size="icon" 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            title="Toggle advanced filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetFilters}
            title="Reset all filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilterPanel && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Select 
                value={teamFilter} 
                onValueChange={setTeamFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <SelectValue placeholder="Filter by team" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {filteredData.teams.map(team => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={playerFilter} 
                onValueChange={setPlayerFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <SelectValue placeholder="Filter by player" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  {filteredData.players.map(player => (
                    <SelectItem key={player} value={player}>
                      {player}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={situationFilter} 
                onValueChange={(val) => setSituationFilter(val as GameSituation | "all")}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <SelectValue placeholder="Filter by situation" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Situations</SelectItem>
                  {GAME_SITUATIONS.map(situation => (
                    <SelectItem key={situation} value={situation}>
                      {getSituationLabel(situation)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={dateFilter} 
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Filter by date" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  {filteredData.dates.map(date => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select 
                value={clipTypeFilter} 
                onValueChange={setClipTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    <SelectValue placeholder="Filter by clip type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clip Types</SelectItem>
                  <SelectItem value="play">Plays</SelectItem>
                  <SelectItem value="possession">Possessions</SelectItem>
                  <SelectItem value="full_game">Full Games</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {(situationFilter !== "all" || teamFilter !== "all" || playerFilter !== "all" || 
        dateFilter !== "all" || clipTypeFilter !== "all" || searchTerm) && (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {filteredClips.length} / {clips.length} clips
          </Badge>
          
          <div className="flex gap-2 text-xs text-muted-foreground">
            {teamFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Users className="h-3 w-3" /> 
                {teamFilter}
              </Badge>
            )}
            {playerFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <User className="h-3 w-3" /> 
                {playerFilter}
              </Badge>
            )}
            {situationFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Flag className="h-3 w-3" /> 
                {getSituationLabel(situationFilter)}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {filteredClips.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center border-b pb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllFilteredClips}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            {selectedClipIds.length === filteredClips.length ? "Deselect All" : "Select All"}
          </Button>
          
          <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={selectedClipIds.length === 0}
                className="flex items-center gap-1"
              >
                <MoveRight className="h-4 w-4" />
                Move Selected ({selectedClipIds.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Move Clips</DialogTitle>
                <DialogDescription>
                  Move {selectedClipIds.length} selected clips to a folder or team
                </DialogDescription>
              </DialogHeader>
              
              <Tabs 
                defaultValue="folders" 
                value={moveDialogTab} 
                onValueChange={(value) => setMoveDialogTab(value as "folders" | "teams")}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="folders" className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    Folders
                  </TabsTrigger>
                  <TabsTrigger value="teams" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Teams
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="folders" className="py-4">
                  <Select onValueChange={(value) => setTargetFolderId(value === "root" ? null : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root (No Folder)</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                
                <TabsContent value="teams" className="py-4">
                  <Select onValueChange={setTargetTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTeamFolders().map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clips will be moved to the team's Plays folder
                  </p>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={moveSelectedClips}>
                  Move Clips
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedClipIds.length === 0}
            className="flex items-center gap-1 text-destructive hover:text-destructive"
            onClick={deleteSelectedClips}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
          
          {selectedClipIds.length > 0 && (
            <Badge variant="outline">
              {selectedClipIds.length} selected
            </Badge>
          )}
        </div>
      )}
      
      {filteredClips.length > 0 ? (
        <>
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-2"
            defaultValue="clips" // start expanded
          >
            <AccordionItem value="clips" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50 font-semibold">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>All Clips ({filteredClips.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-2">
                  {filteredClips.map((clip) => (
                    <div 
                      key={clip.id}
                      className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                        selectedClipIds.includes(clip.id) ? 'bg-primary/10 border-primary/30' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-2">
                          <Checkbox 
                            checked={selectedClipIds.includes(clip.id)}
                            onCheckedChange={() => toggleClipSelection(clip.id)}
                            id={`select-clip-${clip.id}`}
                            className="mt-1"
                          />
                          <h3 className="font-medium">{clip.label}</h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Clip Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onPlayClip(clip)}>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Play Clip
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExportClip(clip)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export Clip
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuGroup>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <FolderIcon className="h-4 w-4 mr-2" />
                                  Move to Folder
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => onMoveToFolder(clip.id, null)}>
                                    <FolderIcon className="h-4 w-4 mr-2" />
                                    None (Root)
                                  </DropdownMenuItem>
                                  {folders.map(folder => (
                                    <DropdownMenuItem 
                                      key={folder.id} 
                                      onClick={() => onMoveToFolder(clip.id, folder.id)}
                                      disabled={clip.folderId === folder.id}
                                    >
                                      <FolderIcon className="h-4 w-4 mr-2" />
                                      {folder.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuGroup>
                            
                            <DropdownMenuGroup>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  Move to Team
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {getTeamFolders().map(team => {
                                    const playsFolder = folders.find(f => 
                                      f.parentId === team.id && 
                                      f.folderType === "plays"
                                    );
                                    
                                    return (
                                      <DropdownMenuItem 
                                        key={team.id} 
                                        onClick={() => {
                                          if (playsFolder) {
                                            onMoveToFolder(clip.id, playsFolder.id, team.id);
                                          } else {
                                            toast.error(`No Plays folder found for team ${team.name}`);
                                          }
                                        }}
                                        disabled={clip.teamId === team.id}
                                      >
                                        <Users className="h-4 w-4 mr-2" />
                                        {team.name}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuGroup>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onRemoveClip(clip.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Clip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatVideoTime(clip.startTime)} ({formatVideoTime(clip.duration)})</span>
                          <span>
                            {new Date(clip.saved).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {clip.notes && (
                          <p className="text-sm line-clamp-2">{clip.notes}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {clip.situation && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Flag className="h-3 w-3" />
                              {getSituationLabel(clip.situation)}
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-xs gap-1">
                            <FolderIcon className="h-3 w-3" />
                            {getFolderName(clip.folderId)}
                          </Badge>
                        </div>
                        
                        {clip.players && clip.players.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {clip.players.map((player, idx) => (
                              <PlayerActionBadge
                                key={idx}
                                player={player}
                                size="sm"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex space-x-1 pt-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="flex-1"
                            onClick={() => onPlayClip(clip)}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => onExportClip(clip)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">No clips found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || situationFilter !== "all" || teamFilter !== "all" || playerFilter !== "all" || dateFilter !== "all" || clipTypeFilter !== "all"
              ? "No clips match your current filters. Try adjusting your search or filters." 
              : activeFolder 
                ? "This folder doesn't have any clips yet." 
                : "You haven't saved any clips yet."}
          </p>
        </div>
      )}
    </div>
  );
};
