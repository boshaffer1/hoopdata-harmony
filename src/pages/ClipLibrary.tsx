import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { TeamFolderStructure } from "@/components/library/TeamFolderStructure";
import { Button } from "@/components/ui/button";
import { Download, Info, Search, Filter, FolderTree, Layers, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { useRoster } from "@/hooks/analyzer/use-roster"; 
import { useAnalyzer } from "@/hooks/analyzer";
import { ExportOptions, SavedClip } from "@/types/analyzer";
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

  // Get clips based on active folder
  const filteredClips = getClipsByFolder(activeFolder);
  
  // Apply search filter to clips in classic view
  const searchFilteredClips = classicSearch.trim() 
    ? filteredClips.filter(clip => 
        clip.label.toLowerCase().includes(classicSearch.toLowerCase()) ||
        clip.notes.toLowerCase().includes(classicSearch.toLowerCase()) ||
        (clip.players && clip.players.some(player => 
          player.playerName.toLowerCase().includes(classicSearch.toLowerCase())
        ))
      )
    : filteredClips;
    
  const storageInfo = getStorageInfo();
  const teamFolders = getTeamFolders();
  
  // Handle redirecting to analyzer to play clips
  const handlePlayClip = (clip: SavedClip) => {
    handlePlaySavedClip(clip);
    navigate("/analyzer");
  };

  // Filter team folders based on search
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
      // For video exports
      toast.loading(`Preparing ${clipsToExport.length} clips for export...`);
      
      // Run exports sequentially to avoid overwhelming the browser
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
  
  // Create initial team folder structure if not exists
  useEffect(() => {
    // For each roster, ensure there's a corresponding team folder with subfolders
    rosters.forEach(roster => {
      const existingTeamFolder = folders.find(
        folder => folder.folderType === 'team' && folder.name === roster.name
      );
      
      if (!existingTeamFolder) {
        // Create team folder
        const teamFolder = createTeamFolder(roster.name, `Folder for ${roster.name} team`);
        
        if (teamFolder) {
          // Create default subfolders
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
      
      {/* View Mode Tabs */}
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
          {/* Left sidebar - Folders */}
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
          
          {/* Main content - Clips */}
          <div className="lg:col-span-3">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clips by title, notes, or players..."
                value={classicSearch}
                onChange={(e) => setClassicSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <LibraryClipList
              clips={searchFilteredClips}
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
          {/* Left sidebar - Team Folders */}
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
          
          {/* Main content - Clips for selected folder/team */}
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
