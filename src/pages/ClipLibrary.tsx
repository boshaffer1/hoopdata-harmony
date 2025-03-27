import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { TeamFolderStructure } from "@/components/library/TeamFolderStructure";
import { Button } from "@/components/ui/button";
import { Download, Info, Search, Filter, FolderTree, Layers, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { useRoster } from "@/hooks/analyzer/use-roster"; 
import { useAnalyzer } from "@/hooks/analyzer";
import { ExportOptions, SavedClip, PlayerAction, GameSituation, GAME_SITUATIONS, PLAYER_ACTIONS } from "@/types/analyzer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const ClipLibrary = () => {
  const navigate = useNavigate();
  const {
    savedClips,
    folders,
    games,
    activeFolder,
    setActiveFolder,
    exportLibrary,
    exportClip,
    removeSavedClip,
    createFolder,
    createTeamFolder,
    updateFolder,
    deleteFolder,
    moveClipToFolder,
    getClipsByFolder,
    getTeamFolders,
    bulkExportClips,
    bulkMoveClips,
    addGame,
    updateGame,
    deleteGame,
    getStorageInfo,
    importLibrary
  } = useClipLibrary(undefined);
  
  const { rosters } = useRoster();
  const { handlePlaySavedClip } = useAnalyzer();
  const [showPersistenceInfo, setShowPersistenceInfo] = useState(false);
  const [viewMode, setViewMode] = useState<"classic" | "teams">("classic");
  const [teamSearch, setTeamSearch] = useState("");
  const [classicSearch, setClassicSearch] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [selectedSituations, setSelectedSituations] = useState<GameSituation[]>([]);
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [selectedActionTypes, setSelectedActionTypes] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const folderClips = getClipsByFolder(activeFolder);
  
  const allPlayerNames = React.useMemo(() => {
    const playerSet = new Set<string>();
    folderClips.forEach(clip => {
      if (clip.players && Array.isArray(clip.players)) {
        clip.players.forEach(player => {
          if (player.playerName) {
            playerSet.add(player.playerName);
          }
        });
      }
    });
    return Array.from(playerSet).sort();
  }, [folderClips]);
  
  const filteredClips = React.useMemo(() => {
    return folderClips.filter(clip => {
      const matchesSearch = classicSearch.trim() === "" ||
        clip.label.toLowerCase().includes(classicSearch.toLowerCase()) ||
        clip.notes.toLowerCase().includes(classicSearch.toLowerCase()) ||
        (clip.players && clip.players.some(player => 
          player.playerName.toLowerCase().includes(classicSearch.toLowerCase())
        ));
      
      const matchesSituation = selectedSituations.length === 0 ||
        (clip.situation && selectedSituations.includes(clip.situation));
      
      const matchesPlayer = selectedPlayerNames.length === 0 ||
        (clip.players && clip.players.some(player => 
          selectedPlayerNames.includes(player.playerName)
        ));
      
      const matchesAction = selectedActionTypes.length === 0 ||
        (clip.players && clip.players.some(player => 
          selectedActionTypes.includes(player.action)
        ));
      
      return matchesSearch && matchesSituation && matchesPlayer && matchesAction;
    });
  }, [folderClips, classicSearch, selectedSituations, selectedPlayerNames, selectedActionTypes]);
  
  const storageInfo = getStorageInfo();
  const teamFolders = getTeamFolders();
  
  const handlePlayClip = (clip: SavedClip) => {
    handlePlaySavedClip(clip);
    navigate("/analyzer");
  };

  const filteredTeamFolders = teamFolders.filter(folder => 
    folder.name.toLowerCase().includes(teamSearch.toLowerCase())
  );
  
  const handleBulkExport = (clipIds: string[], options?: ExportOptions) => {
    if (!clipIds.length) return;
    
    const clipsToExport = savedClips.filter(clip => clipIds.includes(clip.id));
    
    if (options?.format === "json") {
      bulkExportClips(clipsToExport, options);
      toast.success(`Exported ${clipsToExport.length} clips as JSON`);
    } else {
      toast.loading(`Preparing ${clipsToExport.length} clips for export...`);
      
      const exportSequentially = async () => {
        let exportedCount = 0;
        
        for (const clip of clipsToExport) {
          try {
            await exportClip(clip);
            exportedCount++;
            
            if (exportedCount % 5 === 0 || exportedCount === clipsToExport.length) {
              toast.dismiss();
              toast.success(`Exported ${exportedCount}/${clipsToExport.length} clips`);
            }
          } catch (error) {
            console.error(`Failed to export clip ${clip.id}:`, error);
          }
        }
        
        toast.dismiss();
        toast.success(`Export complete. ${exportedCount} clips exported.`);
      };
      
      exportSequentially();
    }
  };
  
  const handleBulkMove = (clipIds: string[], targetFolderId: string | null) => {
    if (!clipIds.length) return;
    
    bulkMoveClips(clipIds, targetFolderId);
    toast.success(`Moved ${clipIds.length} clips to ${targetFolderId ? folders.find(f => f.id === targetFolderId)?.name : 'root folder'}`);
  };
  
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
  };
  
  const handleImportLibrary = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    
    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);
      
      const success = importLibrary(importData);
      
      if (success) {
        setIsImportDialogOpen(false);
        setImportFile(null);
        toast.success("Successfully imported library data");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import library. Invalid file format.");
    }
  };
  
  useEffect(() => {
    rosters.forEach(roster => {
      const existingTeamFolder = folders.find(
        folder => folder.folderType === 'team' && folder.name === roster.name
      );
      
      if (!existingTeamFolder) {
        const teamFolder = createTeamFolder(roster.name, `Folder for ${roster.name} team`);
        
        if (teamFolder) {
          createFolder("Plays", "Team plays", { 
            parentId: teamFolder.id,
            folderType: "plays",
            teamId: teamFolder.id
          });
          
          createFolder("Games", "Team games", { 
            parentId: teamFolder.id,
            folderType: "games",
            teamId: teamFolder.id
          });
        }
      }
    });
  }, [rosters, folders, createTeamFolder, createFolder]);

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-display font-bold">My Clip Library</h1>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Library
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Clip Library</DialogTitle>
                  <DialogDescription>
                    Upload a previously exported library JSON file
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: This will add to your existing library without overwriting it
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleImportLibrary}>
                    Import Library
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportLibrary}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Library
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export all clips as a JSON file for backup</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/analyzer")}
            >
              Go to Analyzer
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Organize and access your saved video clips
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPersistenceInfo(!showPersistenceInfo)}
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            Storage Info
          </Button>
        </div>
        
        {showPersistenceInfo && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Local Storage Information</AlertTitle>
            <AlertDescription>
              <p>Your clips, folders, and games are automatically saved in your browser's local storage. They will persist even after closing the browser or turning off your device.</p>
              <p className="mt-2 text-sm">To ensure you never lose your data, you can export your library as a JSON file using the "Export Library" button.</p>
              <p className="mt-2 text-sm font-medium">
                Total clips: {savedClips.length} | Total folders: {folders.length} | Total games: {games?.length || 0}
                {storageInfo && ` | Storage used: ${storageInfo.totalSizeKB} KB`}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Tabs defaultValue="classic" className="mb-6">
        <TabsList>
          <TabsTrigger 
            value="classic" 
            onClick={() => setViewMode("classic")}
            className="flex items-center gap-1"
          >
            <Layers className="h-4 w-4" />
            Classic View
          </TabsTrigger>
          <TabsTrigger 
            value="teams" 
            onClick={() => setViewMode("teams")}
            className="flex items-center gap-1"
          >
            <FolderTree className="h-4 w-4" />
            Team Organization
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {viewMode === "classic" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FolderList
              folders={folders}
              activeFolder={activeFolder}
              onCreateFolder={createFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
              onSelectFolder={setActiveFolder}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clips by title, notes, or players..."
                    value={classicSearch}
                    onChange={(e) => setClassicSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={hasActiveFilters ? "default" : "outline"} 
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {hasActiveFilters ? `Filters (${selectedSituations.length + selectedPlayerNames.length + selectedActionTypes.length})` : "Filter"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filter Clips</h4>
                        {hasActiveFilters && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="h-8 text-xs"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <h5 className="mb-2 text-sm font-medium">Situation</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {GAME_SITUATIONS.map((situation) => (
                            <div 
                              key={situation} 
                              className="flex items-center space-x-2"
                            >
                              <Checkbox 
                                id={`situation-${situation}`}
                                checked={selectedSituations.includes(situation)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedSituations([...selectedSituations, situation]);
                                  } else {
                                    setSelectedSituations(selectedSituations.filter(s => s !== situation));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`situation-${situation}`}
                                className="text-sm cursor-pointer"
                              >
                                {situation.replace('_', ' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {allPlayerNames.length > 0 && (
                        <div>
                          <h5 className="mb-2 text-sm font-medium">Players</h5>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {allPlayerNames.map((playerName) => (
                              <div 
                                key={playerName} 
                                className="flex items-center space-x-2"
                              >
                                <Checkbox 
                                  id={`player-${playerName}`}
                                  checked={selectedPlayerNames.includes(playerName)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPlayerNames([...selectedPlayerNames, playerName]);
                                    } else {
                                      setSelectedPlayerNames(selectedPlayerNames.filter(p => p !== playerName));
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`player-${playerName}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {playerName}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="mb-2 text-sm font-medium">Action Types</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {PLAYER_ACTIONS.map((action) => (
                            <div 
                              key={action} 
                              className="flex items-center space-x-2"
                            >
                              <Checkbox 
                                id={`action-${action}`}
                                checked={selectedActionTypes.includes(action)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedActionTypes([...selectedActionTypes, action]);
                                  } else {
                                    setSelectedActionTypes(selectedActionTypes.filter(a => a !== action));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`action-${action}`}
                                className="text-sm cursor-pointer"
                              >
                                {action.replace('_', ' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-2" 
                        onClick={() => setIsFilterOpen(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {classicSearch.trim() !== "" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span>Search: {classicSearch}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setClassicSearch("")}
                      />
                    </Badge>
                  )}
                  
                  {selectedSituations.map(situation => (
                    <Badge key={situation} variant="outline" className="flex items-center gap-1">
                      <span>{situation.replace('_', ' ')}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedSituations(selectedSituations.filter(s => s !== situation))}
                      />
                    </Badge>
                  ))}
                  
                  {selectedPlayerNames.map(player => (
                    <Badge key={player} variant="outline" className="flex items-center gap-1">
                      <span>{player}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedPlayerNames(selectedPlayerNames.filter(p => p !== player))}
                      />
                    </Badge>
                  ))}
                  
                  {selectedActionTypes.map(action => (
                    <Badge key={action} variant="outline" className="flex items-center gap-1">
                      <span>{action}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedActionTypes(selectedActionTypes.filter(a => a !== action))}
                      />
                    </Badge>
                  ))}
                  
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-8 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <LibraryClipList
              clips={filteredClips}
              folders={folders}
              activeFolder={activeFolder}
              onPlayClip={handlePlayClip}
              onExportClip={exportClip}
              onRemoveClip={removeSavedClip}
              onMoveToFolder={moveClipToFolder}
              onBulkExport={handleBulkExport}
              onBulkMove={handleBulkMove}
              onCreateFolder={createFolder}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <TeamFolderStructure
              folders={folders}
              games={games || []}
              activeFolder={activeFolder}
              onSelectFolder={setActiveFolder}
              onCreateTeam={createTeamFolder}
              onCreateFolder={createFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
              onAddGame={addGame}
              onUpdateGame={updateGame}
              onDeleteGame={deleteGame}
            />
          </div>
          
          <div className="lg:col-span-3">
            <LibraryClipList
              clips={filteredClips}
              folders={folders}
              activeFolder={activeFolder}
              onPlayClip={handlePlayClip}
              onExportClip={exportClip}
              onRemoveClip={removeSavedClip}
              onMoveToFolder={moveClipToFolder}
              onBulkExport={handleBulkExport}
              onBulkMove={handleBulkMove}
              onCreateFolder={createFolder}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClipLibrary;
