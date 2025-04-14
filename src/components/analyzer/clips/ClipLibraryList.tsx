import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Download, Building2, Users, ChevronDown, FolderTree } from "lucide-react";
import { SavedClip, ClipFolder, ClipType } from "@/types/analyzer";
import { SavedClipItem } from "./SavedClipItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ClipLibraryListProps {
  savedClips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
  onExportLibrary: () => void;
  selectable?: boolean;
  selectedClipIds?: string[];
  onToggleSelection?: (id: string) => void;
}

export const ClipLibraryList: React.FC<ClipLibraryListProps> = ({
  savedClips,
  onPlayClip,
  onExportClip,
  onRemoveClip,
  onExportLibrary,
  selectable = false,
  selectedClipIds = [],
  onToggleSelection = () => {},
}) => {
  const [showMoveToOptions, setShowMoveToOptions] = useState(false);
  
  // Get folders from localStorage
  const getFolders = (): ClipFolder[] => {
    try {
      const foldersData = localStorage.getItem('clipFolders');
      if (foldersData) {
        return JSON.parse(foldersData);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
    return [];
  };
  
  const folders = getFolders();
  const teamFolders = folders.filter(folder => folder.folderType === "team");
  
  const moveSelectedClipsToFolder = (folderId: string, teamId?: string) => {
    if (selectedClipIds.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    try {
      const updatedClips = savedClips.map(clip => 
        selectedClipIds.includes(clip.id) 
          ? { ...clip, folderId, teamId: teamId || clip.teamId } 
          : clip
      );
      
      localStorage.setItem('savedClips', JSON.stringify(updatedClips));
      
      toast.success(`Moved ${selectedClipIds.length} clips to folder`);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error moving clips:", error);
      toast.error("Failed to move clips");
    }
  };
  
  const moveSelectedClipsToTeam = (teamId: string) => {
    if (selectedClipIds.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    try {
      const updatedClips = savedClips.map(clip => 
        selectedClipIds.includes(clip.id) 
          ? { ...clip, teamId } 
          : clip
      );
      
      localStorage.setItem('savedClips', JSON.stringify(updatedClips));
      
      toast.success(`Moved ${selectedClipIds.length} clips to team`);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error moving clips:", error);
      toast.error("Failed to move clips");
    }
  };
  
  const deleteSelectedClips = () => {
    if (selectedClipIds.length === 0) {
      toast.error("No clips selected");
      return;
    }
    
    try {
      const remainingClips = savedClips.filter(clip => !selectedClipIds.includes(clip.id));
      localStorage.setItem('savedClips', JSON.stringify(remainingClips));
      
      toast.success(`Deleted ${selectedClipIds.length} clips`);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error deleting clips:", error);
      toast.error("Failed to delete clips");
    }
  };
  
  // Function to automatically organize clips into teams, plays, and games folders
  const autoOrganizeClips = () => {
    // Get the auto-organize function from localStorage
    try {
      const foldersData = localStorage.getItem('clipFolders');
      const clipsData = localStorage.getItem('savedClips');
      
      if (!foldersData || !clipsData) {
        toast.error("No folders or clips data found");
        return;
      }
      
      // Use the hook's auto-organize function
      const organizeClips = () => {
        // Find or create team folder
        let teamFolder = folders.find(f => f.folderType === "team");
        
        if (!teamFolder) {
          teamFolder = {
            id: `folder-team-${Date.now()}`,
            name: "My Team",
            description: "Default team",
            folderType: "team",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          folders.push(teamFolder);
        }
        
        // Find or create plays and games folders
        let playsFolder = folders.find(f => 
          f.parentId === teamFolder.id && 
          f.folderType === "plays"
        );
        
        let gamesFolder = folders.find(f => 
          f.parentId === teamFolder.id && 
          f.folderType === "games"
        );
        
        if (!playsFolder) {
          playsFolder = {
            id: `folder-plays-${Date.now()}`,
            name: "Plays",
            description: "Team plays and possessions",
            parentId: teamFolder.id,
            teamId: teamFolder.id,
            folderType: "plays",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          folders.push(playsFolder);
        }
        
        if (!gamesFolder) {
          gamesFolder = {
            id: `folder-games-${Date.now()}`,
            name: "Games",
            description: "Full game recordings",
            parentId: teamFolder.id,
            teamId: teamFolder.id,
            folderType: "games",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          folders.push(gamesFolder);
        }
        
        // Group clips by name
        const clipsByName: Record<string, SavedClip[]> = {};
        const fullGameClips: SavedClip[] = [];
        
        savedClips.forEach(clip => {
          // Skip clips that are already organized
          if (clip.folderId && clip.teamId) {
            return;
          }
          
          if (clip.duration > 60) {
            fullGameClips.push(clip);
          } else {
            const name = clip.label || "Unnamed Clip";
            if (!clipsByName[name]) {
              clipsByName[name] = [];
            }
            clipsByName[name].push(clip);
          }
        });
        
        // Create play subfolders and assign clips to them
        const updatedFolders = [...folders];
        const playSubfolders: Record<string, ClipFolder> = {};
        
        Object.entries(clipsByName).forEach(([name, clips]) => {
          if (clips.length > 0 && playsFolder) {
            // Create a subfolder for each distinct play name
            const playSubfolder: ClipFolder = {
              id: `folder-play-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
              name,
              description: `Clips for ${name}`,
              parentId: playsFolder.id,
              teamId: teamFolder?.id,
              folderType: "other",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            updatedFolders.push(playSubfolder);
            playSubfolders[name] = playSubfolder;
          }
        });
        
        // Update clips with folder and team IDs
        const updatedClips = savedClips.map(clip => {
          // Skip clips that are already organized
          if (clip.folderId && clip.teamId) {
            return clip;
          }
          
          if (clip.duration > 60 && gamesFolder) {
            // Place full games in the Games folder
            return {
              ...clip,
              folderId: gamesFolder.id,
              teamId: teamFolder?.id,
              clipType: "full_game" as ClipType
            };
          } else {
            const subfolder = playSubfolders[clip.label];
            if (subfolder) {
              // Place in play subfolder
              return {
                ...clip,
                folderId: subfolder.id,
                teamId: teamFolder?.id,
                clipType: "play" as ClipType
              };
            } else if (playsFolder) {
              // Fallback to main plays folder
              return {
                ...clip,
                folderId: playsFolder.id,
                teamId: teamFolder?.id,
                clipType: "play" as ClipType
              };
            }
          }
          return clip;
        });
        
        // Save updated folders and clips
        localStorage.setItem('clipFolders', JSON.stringify(updatedFolders));
        localStorage.setItem('savedClips', JSON.stringify(updatedClips));
        
        toast.success("Clips organized into team folders");
        
        // Reload the page to reflect changes
        window.location.reload();
      };
      
      organizeClips();
    } catch (error) {
      console.error("Error auto-organizing clips:", error);
      toast.error("Failed to organize clips");
    }
  };

  if (savedClips.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <List className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          Your clip library is empty
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Saved Clips</h3>
        <div className="flex gap-2">
          {selectable && selectedClipIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Move To <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select destination</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {teamFolders.length > 0 ? (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Teams</DropdownMenuLabel>
                      {teamFolders.map(team => (
                        <DropdownMenuSub key={team.id}>
                          <DropdownMenuSubTrigger>
                            <Building2 className="h-4 w-4 mr-2" />
                            <span>{team.name}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-48">
                            <DropdownMenuItem onClick={() => moveSelectedClipsToTeam(team.id)}>
                              <Users className="h-4 w-4 mr-2" />
                              <span>Team root</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {/* Team folders */}
                            {folders
                              .filter(folder => folder.parentId === team.id)
                              .map(folder => (
                                <DropdownMenuSub key={folder.id}>
                                  <DropdownMenuSubTrigger>
                                    <FolderTree className="h-4 w-4 mr-2" />
                                    <span>{folder.name}</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    <DropdownMenuItem onClick={() => moveSelectedClipsToFolder(folder.id, team.id)}>
                                      <span>Folder root</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    
                                    {/* Subfolders */}
                                    {folders
                                      .filter(subfolder => subfolder.parentId === folder.id)
                                      .map(subfolder => (
                                        <DropdownMenuItem 
                                          key={subfolder.id}
                                          onClick={() => moveSelectedClipsToFolder(subfolder.id, team.id)}
                                        >
                                          {subfolder.name}
                                        </DropdownMenuItem>
                                      ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ))}
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    No teams available
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Other folders</DropdownMenuLabel>
                  {folders
                    .filter(folder => !folder.parentId && folder.folderType !== "team")
                    .map(folder => (
                      <DropdownMenuItem 
                        key={folder.id}
                        onClick={() => moveSelectedClipsToFolder(folder.id)}
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  
                  {folders.filter(folder => !folder.parentId && folder.folderType !== "team").length === 0 && (
                    <DropdownMenuItem disabled>
                      No other folders available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {selectable && selectedClipIds.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deleteSelectedClips}
              className="text-destructive hover:text-destructive"
            >
              Delete Selected
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={autoOrganizeClips}
          >
            Auto-Organize
          </Button>
          
          <Button variant="outline" size="sm" onClick={onExportLibrary}>
            <Download className="h-4 w-4 mr-2" />
            Export Library
          </Button>
        </div>
      </div>

      <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 mt-4">
        {savedClips.map((clip) => (
          <SavedClipItem
            key={clip.id}
            clip={clip}
            onPlay={onPlayClip}
            onExport={onExportClip}
            onRemove={onRemoveClip}
            selectable={selectable}
            isSelected={selectedClipIds.includes(clip.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </ul>
    </>
  );
};
