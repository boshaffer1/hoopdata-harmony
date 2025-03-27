import React, { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SavedClip, ClipFolder, GameSituation, ExportOptions } from "@/types/analyzer";
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
  CheckSquare,
  SquareCheck,
  Square,
  Share2,
  FolderOutput,
  FolderPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GAME_SITUATIONS } from "@/types/analyzer";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onMoveToFolder: (clipId: string, folderId: string | null) => void;
  onBulkExport?: (clipIds: string[], options?: ExportOptions) => void;
  onBulkMove?: (clipIds: string[], targetFolderId: string | null) => void;
  onCreateFolder?: (name: string, description?: string) => ClipFolder | undefined;
}

export const LibraryClipList: React.FC<LibraryClipListProps> = ({
  clips,
  folders,
  activeFolder,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onMoveToFolder,
  onBulkExport = () => {},
  onBulkMove = () => {},
  onCreateFolder
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [situationFilter, setSituationFilter] = useState<GameSituation | "all">("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [playerFilter, setPlayerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [clipTypeFilter, setClipTypeFilter] = useState<string>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeSubfolders: false
  });
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");

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

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips(prev => 
      prev.includes(clipId)
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  const toggleAllClips = () => {
    if (selectedClips.length === filteredClips.length) {
      setSelectedClips([]);
    } else {
      setSelectedClips(filteredClips.map(clip => clip.id));
    }
  };

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    if (onCreateFolder) {
      const newFolder = onCreateFolder(newFolderName, newFolderDescription);
      
      if (newFolder) {
        setTargetFolder(newFolder.id);
        toast.success(`Created new folder: ${newFolderName}`);
        
        setNewFolderName("");
        setNewFolderDescription("");
        setNewFolderDialogOpen(false);
      }
    }
  };

  const handleBulkExport = () => {
    if (selectedClips.length === 0) {
      toast.error("No clips selected for export");
      return;
    }
    onBulkExport(selectedClips, exportOptions);
    setExportDialogOpen(false);
    setSelectedClips([]);
    setBulkActionMode(false);
  };

  const handleBulkMove = () => {
    if (selectedClips.length === 0) {
      toast.error("No clips selected to move");
      return;
    }
    onBulkMove(selectedClips, targetFolder);
    setMoveDialogOpen(false);
    setSelectedClips([]);
    setBulkActionMode(false);
  };

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

  const cancelBulkMode = () => {
    setBulkActionMode(false);
    setSelectedClips([]);
  };

  const handleClipPlay = (clip: SavedClip, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onPlayClip(clip);
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
          {!bulkActionMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionMode(true)}
              className="whitespace-nowrap"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select Multiple
            </Button>
          ) : (
            <Button
              variant="default" 
              size="sm"
              onClick={cancelBulkMode}
              className="whitespace-nowrap"
            >
              Cancel Selection
            </Button>
          )}
        </div>
      </div>

      {bulkActionMode && (
        <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={selectedClips.length === filteredClips.length && filteredClips.length > 0}
              onCheckedChange={toggleAllClips}
            />
            <Label htmlFor="select-all" className="font-medium">
              {selectedClips.length} of {filteredClips.length} selected
            </Label>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={selectedClips.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export {selectedClips.length} Clips</DialogTitle>
                  <DialogDescription>
                    Choose your export options below
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select 
                      value={exportOptions.format} 
                      onValueChange={(val) => setExportOptions({...exportOptions, format: val as "json" | "mp4" | "webm"})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON (Metadata only)</SelectItem>
                        <SelectItem value="webm">Video clips (WebM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {exportOptions.format !== "json" && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include-subtitles"
                          checked={!!exportOptions.includeSubfolders}
                          onCheckedChange={(checked) => 
                            setExportOptions({...exportOptions, includeSubfolders: !!checked})
                          }
                        />
                        <Label htmlFor="include-subtitles">Preserve folder structure in export</Label>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkExport}>
                    Export {selectedClips.length} Clips
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={selectedClips.length === 0}
                >
                  <FolderOutput className="h-4 w-4 mr-2" />
                  Move to Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move {selectedClips.length} Clips</DialogTitle>
                  <DialogDescription>
                    Select a destination folder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Destination Folder</Label>
                    <Select 
                      value={targetFolder || ""} 
                      onValueChange={(val) => setTargetFolder(val === "root" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Root (No Folder)</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                        
                        <SelectItem value="new-folder" className="text-primary font-medium">
                          <div className="flex items-center">
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Create New Folder
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {targetFolder === "new-folder" && (
                      <Button
                        onClick={() => {
                          setMoveDialogOpen(false);
                          setNewFolderDialogOpen(true);
                        }}
                        variant="outline"
                        className="mt-2 w-full"
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create New Folder
                      </Button>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkMove} disabled={targetFolder === "new-folder"}>
                    Move {selectedClips.length} Clips
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new folder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="My New Folder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-description">Description (Optional)</Label>
                    <Input
                      id="folder-description"
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewFolderDialogOpen(false);
                      setMoveDialogOpen(true);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNewFolder}>
                    Create Folder
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={selectedClips.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedClips.length} Clips</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Are you sure you want to permanently delete 
                    these {selectedClips.length} clips?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      selectedClips.forEach(id => onRemoveClip(id));
                      setSelectedClips([]);
                      setBulkActionMode(false);
                      toast.success(`Deleted ${selectedClips.length} clips`);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

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
                      className={`border rounded-lg p-4 transition-colors ${
                        bulkActionMode && selectedClips.includes(clip.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={bulkActionMode ? () => toggleClipSelection(clip.id) : undefined}
                    >
                      <div className="flex justify-between items-start mb-2">
                        {bulkActionMode ? (
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={selectedClips.includes(clip.id)} 
                              onCheckedChange={() => toggleClipSelection(clip.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <h3 className="font-medium">{clip.label}</h3>
                          </div>
                        ) : (
                          <h3 className="font-medium">{clip.label}</h3>
                        )}
                        
                        {!bulkActionMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Clip Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleClipPlay(clip)}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Play Clip
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onExportClip(clip)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Clip
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Move to Folder</DropdownMenuLabel>
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setNewFolderDialogOpen(true);
                                }}
                                className="border-t border-muted mt-1 pt-1 text-primary"
                              >
                                <FolderPlus className="h-4 w-4 mr-2" />
                                Create New Folder
                              </DropdownMenuItem>
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
                        )}
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
                        
                        {!bulkActionMode && (
                          <div className="flex space-x-1 pt-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="flex-1"
                              onClick={(e) => handleClipPlay(clip, e)}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Play
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportClip(clip);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        )}
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
