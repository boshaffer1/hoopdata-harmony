
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { TeamFolderStructure } from "@/components/library/TeamFolderStructure";
import { Button } from "@/components/ui/button";
import { Download, Info, Search, Filter, FolderTree, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { useRoster } from "@/hooks/analyzer/use-roster"; 
import { useAnalyzer } from "@/hooks/analyzer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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
    addGame,
    updateGame,
    deleteGame,
    getStorageInfo
  } = useClipLibrary(undefined);
  
  const { rosters } = useRoster();
  const { handlePlaySavedClip } = useAnalyzer();
  const [showPersistenceInfo, setShowPersistenceInfo] = useState(false);
  const [viewMode, setViewMode] = useState<"classic" | "teams">("classic");
  const [teamSearch, setTeamSearch] = useState("");

  const filteredClips = getClipsByFolder(activeFolder);
  const storageInfo = getStorageInfo();
  const teamFolders = getTeamFolders();
  
  // Handle redirecting to analyzer to play clips
  const handlePlayClip = (clip: any) => {
    handlePlaySavedClip(clip);
    navigate("/analyzer");
  };

  // Filter team folders based on search
  const filteredTeamFolders = teamFolders.filter(folder => 
    folder.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-display font-bold">My Clip Library</h1>
          <div className="flex gap-2">
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
            <LibraryClipList
              clips={filteredClips}
              folders={folders}
              activeFolder={activeFolder}
              onPlayClip={handlePlayClip}
              onExportClip={exportClip}
              onRemoveClip={removeSavedClip}
              onMoveToFolder={moveClipToFolder}
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
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClipLibrary;
