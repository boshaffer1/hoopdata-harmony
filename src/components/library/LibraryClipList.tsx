
import React, { useState, useRef } from "react";
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
import { SavedClip, ClipFolder } from "@/types/analyzer";
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
  FolderPlus,
  Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { GameSituation, GAME_SITUATIONS } from "@/types/analyzer";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter clips based on search term and situation filter
  const filteredClips = clips.filter(clip => {
    const matchesSearch = 
      searchTerm === "" || 
      clip.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.players?.some(p => p.playerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesSituation = 
      situationFilter === "all" || 
      clip.situation === situationFilter;
      
    return matchesSearch && matchesSituation;
  });
  
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
        <div className="flex-shrink-0 w-full sm:w-48">
          <Select 
            value={situationFilter} 
            onValueChange={(val) => setSituationFilter(val as GameSituation | "all")}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
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
      </div>
      
      {/* Clips list */}
      {filteredClips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">No clips found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || situationFilter !== "all" 
              ? "No clips match your current filters. Try adjusting your search." 
              : activeFolder 
                ? "This folder doesn't have any clips yet." 
                : "You haven't saved any clips yet."}
          </p>
        </div>
      )}
    </div>
  );
};
