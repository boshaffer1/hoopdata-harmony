import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { ClipThumbnailGrid } from "@/components/library/ClipThumbnailGrid";
import { TeamFolderStructure } from "@/components/library/TeamFolderStructure";
import { Button } from "@/components/ui/button";
import { Download, Info, Filter, FolderTree, Layers } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { handlePlaySavedClip, videoUrl } = useAnalyzer();
  const [showPersistenceInfo, setShowPersistenceInfo] = useState(false);
  const [viewMode, setViewMode] = useState<"classic" | "teams">("classic");
  const [teamSearch, setTeamSearch] = useState("");
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');

  const filteredClips = getClipsByFolder(activeFolder);
  const storageInfo = getStorageInfo();
  const teamFolders = getTeamFolders();
  
  const handlePlayClip = async (clip: any) => {
    try {
      setIsLoadingVideo(true);
      setVideoError(null);
      
      if (videoUrl) {
        handlePlaySavedClip(clip);
        setCurrentVideoUrl(videoUrl);
        setIsLoadingVideo(false);
        return;
      }
      
      if (clip.gameId) {
        const game = games.find(g => g.id === clip.gameId);
        if (game && game.videoUrl) {
          console.log("Loading video from game record:", game.videoUrl);
          await handlePlaySavedClip({
            ...clip,
            videoUrl: game.videoUrl
          });
          setCurrentVideoUrl(game.videoUrl);
          setIsLoadingVideo(false);
          return;
        }
      }
      
      try {
        const { data: videoFiles, error } = await supabase
          .from('video_files')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (videoFiles && videoFiles.length > 0) {
          const videoFile = videoFiles[0];
          
          const { data } = await supabase
            .storage
            .from('videos')
            .getPublicUrl(videoFile.file_path);
            
          if (data && data.publicUrl) {
            console.log("Loading video from Supabase:", data.publicUrl);
            await handlePlaySavedClip({
              ...clip,
              videoUrl: data.publicUrl
            });
            setCurrentVideoUrl(data.publicUrl);
          } else {
            throw new Error("Failed to get public URL for video");
          }
        } else {
          throw new Error("No videos found in database");
        }
      } catch (storageError) {
        console.error("Error fetching video from Supabase:", storageError);
        setVideoError("Could not find a suitable video to play this clip. Please upload a video in the Analyzer page first.");
        toast.error("Video not found. Please upload a video first.");
      }
    } catch (error) {
      console.error("Error playing clip:", error);
      setVideoError("Failed to play clip. Please try again or upload a video in the Analyzer page.");
      toast.error("Failed to play clip");
    } finally {
      setIsLoadingVideo(false);
    }
  };

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
          <div className="ml-auto flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={displayMode === 'list' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setDisplayMode('list')}
                  >
                    List View
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View clips in a detailed list</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={displayMode === 'grid' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setDisplayMode('grid')}
                  >
                    Grid View
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View clips as thumbnails</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TabsList>
      </Tabs>
      
      {videoError && (
        <Alert className="mb-4" variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Video Error</AlertTitle>
          <AlertDescription>
            {videoError}
          </AlertDescription>
        </Alert>
      )}
      
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
            {displayMode === 'list' ? (
              <LibraryClipList
                clips={filteredClips}
                folders={folders}
                activeFolder={activeFolder}
                onPlayClip={handlePlayClip}
                onExportClip={exportClip}
                onRemoveClip={removeSavedClip}
                onMoveToFolder={moveClipToFolder}
                isLoadingVideo={isLoadingVideo}
              />
            ) : (
              <ClipThumbnailGrid
                clips={filteredClips}
                onPlayClip={handlePlayClip}
              />
            )}
          </div>
        </div>
      ) : (
        <div>
          <TeamFolderStructure
            folders={folders}
            games={games || []}
            savedClips={savedClips}
            activeFolder={activeFolder}
            videoUrl={currentVideoUrl || videoUrl}
            onSelectFolder={setActiveFolder}
            onCreateTeam={createTeamFolder}
            onCreateFolder={createFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
            onAddGame={addGame}
            onUpdateGame={updateGame}
            onDeleteGame={deleteGame}
            onPlayClip={handlePlayClip}
          />
        </div>
      )}
    </Layout>
  );
};

export default ClipLibrary;
