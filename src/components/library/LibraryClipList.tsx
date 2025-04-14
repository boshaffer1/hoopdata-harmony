
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
  Table
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

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onMoveToFolder: (clipId: string, folderId: string | null) => void;
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
  
  // Extract unique teams, players, dates from clips
  const filteredData = useMemo(() => {
    const teams = new Set<string>();
    const players = new Set<string>();
    const dates = new Set<string>();
    const clipTypes = new Set<string>();
    
    clips.forEach(clip => {
      // Extract team names
      if (clip.players) {
        clip.players.forEach(player => {
          // Extract team name from player name if available (format: "Team - Player")
          const playerParts = player.playerName.split(" - ");
          if (playerParts.length > 1) {
            teams.add(playerParts[0]);
            players.add(playerParts[1]);
          } else {
            players.add(player.playerName);
          }
        });
      }
      
      // Extract dates (just the date part of saved timestamp)
      const savedDate = new Date(clip.saved).toLocaleDateString();
      dates.add(savedDate);
      
      // Add clip type
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
  
  // Filter clips based on all criteria
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

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
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

      {/* Expanded Filter panel - Synergy style */}
      {showFilterPanel && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Team Filter */}
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

            {/* Player Filter */}
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

            {/* Situation Filter */}
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

            {/* Date Filter */}
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

            {/* Clip Type Filter */}
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

      {/* Filter stats */}
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
      
      {/* Clips list */}
      {filteredClips.length > 0 ? (
        <>
          {/* Accordion view for grouped clips by date - Synergy style */}
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
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{clip.label}</h3>
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
                        
                        {/* Display player actions */}
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
