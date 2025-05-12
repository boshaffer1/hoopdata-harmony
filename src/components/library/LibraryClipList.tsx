import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SavedClip, ClipFolder } from "@/types/analyzer";
import { SavedClipItem } from "@/components/analyzer/clips/SavedClipItem";
import { formatVideoTime } from "@/components/video/utils";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, X, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the action interface
export interface ClipAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (clip: SavedClip) => void;
}

interface LibraryClipListProps {
  clips: SavedClip[];
  folders: ClipFolder[];
  activeFolder: string | null;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onMoveToFolder: (clipId: string, folderId: string | null, teamId?: string) => void;
  isLoadingVideo?: boolean;
  extraActions?: ClipAction[];
}

export const LibraryClipList: React.FC<LibraryClipListProps> = ({
  clips,
  folders,
  activeFolder,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onMoveToFolder,
  isLoadingVideo = false,
  extraActions = []
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  
  const handlePlayClip = (clip: SavedClip) => {
    if (isLoadingVideo) return;
    onPlayClip(clip);
  };
  
  const filteredClips = clips.filter(clip => {
    const matchesSearch = searchTerm 
      ? clip.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (clip.notes && clip.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    const matchesFilter = filterType 
      ? clip.situation === filterType
      : true;
      
    return matchesSearch && matchesFilter;
  });
  
  const situations = Array.from(new Set(clips.map(clip => clip.situation).filter(Boolean)));
  
  const activeFolder_ = folders.find(folder => folder.id === activeFolder);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {activeFolder_ ? activeFolder_.name : "All Clips"} 
          <Badge variant="outline" className="ml-2">
            {filteredClips.length}
          </Badge>
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportClip(clips[0])}
          disabled={clips.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setFilterType(null)}
              className={!filterType ? "bg-accent/50" : ""}
            >
              All situations
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {situations.map(situation => (
              <DropdownMenuItem 
                key={situation} 
                onClick={() => setFilterType(situation)}
                className={filterType === situation ? "bg-accent/50" : ""}
              >
                {situation}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isLoadingVideo && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading video...</p>
        </div>
      )}
      
      {filteredClips.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No clips found</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <ul className="space-y-2">
            {filteredClips.map(clip => (
              <SavedClipItem
                key={clip.id}
                clip={clip}
                onPlay={handlePlayClip}
                onExport={onExportClip}
                onRemove={onRemoveClip}
                disabled={isLoadingVideo}
                extraActions={extraActions}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
};
