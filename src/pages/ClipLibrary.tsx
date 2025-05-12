import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { ClipThumbnailGrid } from "@/components/library/ClipThumbnailGrid";
import { TeamFolderStructure } from "@/components/library/TeamFolderStructure";
import { Button } from "@/components/ui/button";
import { Download, Info, Filter, FolderTree, Layers, Loader2, CheckCircle, FileVideo } from "lucide-react";
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
import { loadAllSupabaseData } from "@/utils/all-supabase-data";
import { createSignedUrl, cleanExpiredSignedUrls, getBestStorageUrl, convertToWebM, uploadFileToSupabase, createWebPThumbnail } from "@/utils/supabase-helpers";
import VideoPreloader from "@/components/video/VideoPreloader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const ClipLibrary = () => {
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
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
    getStorageInfo,
    importLibrary
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
  const [isLoadingSupabaseData, setIsLoadingSupabaseData] = useState(false);
  const [supabaseVideoFiles, setSupabaseVideoFiles] = useState<any[]>([]);
  const [supabaseSyncComplete, setSupabaseSyncComplete] = useState(false);
  const [bucketMode, setBucketMode] = useState<'clips' | 'all'>('clips');
  const [isConvertingVideo, setIsConvertingVideo] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [selectedClipForConversion, setSelectedClipForConversion] = useState<any | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [moveClipModalState, setMoveClipModalState] = useState<{ isOpen: boolean; clipId: string | null }>({
    isOpen: false,
    clipId: null
  });
  const [failedClip, setFailedClip] = useState<any>(null);

  const filteredClips = getClipsByFolder(activeFolder);
  const storageInfo = getStorageInfo();
  const teamFolders = getTeamFolders();
  
  // Simplified handlePlayClip function that only handles playing clips
  const handlePlayClip = async (clip: any) => {
    try {
      console.log("ClipLibrary: handlePlayClip called with clip:", clip);
      setIsLoadingVideo(true);
      setVideoError(null);
      setFailedClip(null); // Reset failed clip
      
      // Create a timeout to prevent UI from being stuck in loading state
      const timeoutId = setTimeout(() => {
        setIsLoadingVideo(false);
        setVideoError("Loading video timed out. Please try again.");
        setFailedClip(clip); // Store the failed clip
      }, 15000);
      
      // Determine which bucket to use based on sourceType
      const bucket = clip.sourceType === 'clips' ? 'clips' : 'videos';
      const path = clip.clipPath || clip.videoId;
      
      if (!path) {
        throw new Error("No valid video path found in clip data");
      }
      
      // Get the best URL for the video (public or signed)
      const videoUrl = await getBestStorageUrl(bucket, path);
      
      if (!videoUrl) {
        throw new Error("Could not generate a video URL");
      }
      
      console.log(`Got video URL: ${videoUrl.substring(0, 50)}...`);
      
      // Set up the video player with the URL
      setCurrentVideoUrl(videoUrl);
      
      // Ensure videoPlayerRef is accessed after it's rendered by using a small delay
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.src = videoUrl;
          videoPlayerRef.current.load();
        }
      }, 100);
      
      // Pass to analyzer for handling as well
      const clipWithUrl = {
        ...clip,
        videoUrl: videoUrl,
        directVideoUrl: videoUrl
      };
      
      await handlePlaySavedClip(clipWithUrl);
      clearTimeout(timeoutId);
      setIsLoadingVideo(false);
    } catch (error) {
      console.error("ClipLibrary: Error in handlePlayClip:", error);
      setVideoError(`Error playing clip: ${error.message}. Try converting the video to WebM format for better compatibility.`);
      setFailedClip(clip); // Store the failed clip for conversion
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const filteredTeamFolders = teamFolders.filter(folder => 
    folder.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // Fetch video files from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      setIsLoadingSupabaseData(true);
      try {
        console.log("Library Page: Using comprehensive data loader for Supabase...");
        
        // Clean expired signed URLs from cache
        cleanExpiredSignedUrls();
        
        // Use the comprehensive data loader
        const allData = await loadAllSupabaseData();
        console.log("Library Page: All Supabase data:", allData);
        
        // Get video files from database results
        const videoFiles = allData.storage.videos || [];
        setSupabaseVideoFiles(videoFiles);
        console.log(`Library Page: Found ${videoFiles.length} video files in storage`);
        
        // Get clips directly from clips bucket
        const clipFiles = allData.storage.clips || [];
        console.log(`Library Page: Found ${clipFiles.length} clip files in storage`);
        
        // Get unified clips that include both database and storage sources
        const unifiedClips = allData.unified.clips || [];
        console.log(`Library Page: Found ${unifiedClips.length} unified clips from database and storage`);
        
        // Check if API access is working correctly
        try {
          // Use the list method instead of countRows which doesn't exist
          const { data, error } = await supabase.storage.from('clips').list('');
          console.log(`Library Page: Clips bucket list result: ${data?.length || 0} files`);
          if (error) console.error("Library Page: Error listing clips:", error);
        } catch (err) {
          console.error("Library Page: Failed to list clips:", err);
        }
        
        // Log videos found for informational purposes only
        const storageVideos = allData.storage.videos || [];
        if (storageVideos.length > 0) {
          console.log(`Found ${storageVideos.length} videos directly in storage`);
        }
        
        // Check for CSV files as well
        const csvFiles = allData.storage.csv_files || [];
        if (csvFiles.length > 0) {
          console.log(`Found ${csvFiles.length} CSV files`);
        }
        
        // SYNC CLOUD CLIPS WITH LOCAL STORAGE
        // This is the critical part that was missing - we need to add cloud clips to local storage
        if (unifiedClips.length > 0) {
          console.log(`Synchronizing ${unifiedClips.length} cloud clips with local storage...`);
          
          // First, convert the unified clips to the local SavedClip format
          const cloudClipsForLocalStorage = unifiedClips.map(cloudClip => ({
            id: cloudClip.id,
            startTime: cloudClip.startTime || 0,
            duration: cloudClip.duration || cloudClip.endTime - cloudClip.startTime || 30,
            label: cloudClip.label,
            notes: cloudClip.notes || "",
            timeline: cloudClip.timeline || "",
            saved: cloudClip.saved || new Date().toISOString(),
            tags: cloudClip.tags || [],
            videoId: cloudClip.videoId || null,
            clipPath: cloudClip.clipPath || null,
            isSupabaseClip: true,
            sourceType: cloudClip.sourceType || 'clips',
            source: 'storage'
          }));
          
          // Since we don't have direct access to setSavedClips, let's use the importLibrary function
          // which is designed to merge external clips with local storage
          const syncData = {
            clips: cloudClipsForLocalStorage,
            folders: [], // We're not importing folders in this sync
            games: []    // We're not importing games in this sync
          };
          
          // Use the importLibrary function from the useClipLibrary hook
          importLibrary(syncData);
        }
        
        setSupabaseSyncComplete(true);
      } catch (error) {
        console.error("Error fetching Supabase data:", error);
        toast.error("Failed to sync with Supabase");
      } finally {
        setIsLoadingSupabaseData(false);
      }
    };
    
    fetchSupabaseData();
  }, []);

  // Add a loading state for when clips are loading
  const isLoading = isLoadingSupabaseData;
  
  // Show a loading state when data is being fetched
  if (isLoading) {
    return (
      <Layout className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">My Clip Library</h1>
          <p className="text-muted-foreground">
            Loading your library...
          </p>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Syncing with HoopData...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
        </div>
      </Layout>
    );
  }

  // Add a function to handle video conversion
  const handleConvertToWebM = async (clip: any) => {
    setSelectedClipForConversion(clip);
    setConvertDialogOpen(true);
  };
  
  // Function to perform the actual conversion
  const performConversion = async () => {
    if (!selectedClipForConversion) return;
    
    try {
      setIsConvertingVideo(true);
      setConversionProgress(0);
      
      const clip = selectedClipForConversion;
      const bucket = clip.sourceType === 'clips' ? 'clips' : 'videos';
      const path = clip.clipPath || clip.videoId;
      
      if (!path) {
        toast.error("No valid video path found");
        return;
      }
      
      // Get the source video URL
      const sourceUrl = await getBestStorageUrl(bucket, path);
      if (!sourceUrl) {
        toast.error("Could not get source video URL");
        return;
      }
      
      // Fetch the video as a blob
      toast.info("Downloading source video...");
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        toast.error(`Failed to fetch source video: ${response.status}`);
        return;
      }
      
      const videoBlob = await response.blob();
      toast.success("Source video downloaded");
      setConversionProgress(10);
      
      // Convert to WebM
      toast.info("Converting to WebM format...");
      const webmBlob = await convertToWebM(videoBlob, (progress) => {
        // Update progress (scale from 10% to 80%)
        setConversionProgress(10 + progress * 70);
      });
      
      if (!webmBlob) {
        toast.error("WebM conversion failed");
        return;
      }
      
      // Generate a WebP thumbnail
      toast.info("Creating WebP thumbnail...");
      const webpThumbnail = await createWebPThumbnail(webmBlob);
      setConversionProgress(85);
      
      // Upload the WebM file
      const webmPath = path.replace(/\.(mp4|mov)$/i, '.webm');
      toast.info("Uploading WebM file...");
      
      await uploadFileToSupabase(
        bucket,
        webmPath,
        new File([webmBlob], webmPath, { type: 'video/webm' }),
        (progress) => {
          // Update progress (scale from 85% to 95%)
          setConversionProgress(85 + progress * 10);
        }
      );
      
      // Upload thumbnail if created
      if (webpThumbnail) {
        const thumbnailPath = webmPath.replace(/\.webm$/i, '.webp');
        await uploadFileToSupabase(
          'thumbnails',
          thumbnailPath,
          new File([webpThumbnail], thumbnailPath, { type: 'image/webp' })
        );
      }
      
      setConversionProgress(100);
      toast.success("Video converted and uploaded successfully");
      
      // Close dialog after a short delay
      setTimeout(() => {
        setConvertDialogOpen(false);
        setSelectedClipForConversion(null);
      }, 1500);
      
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error(`Conversion failed: ${error.message}`);
    } finally {
      setIsConvertingVideo(false);
    }
  };

  return (
    <Layout className="py-6">
      {/* Video player for clip playback */}
      {currentVideoUrl && (
        <div className="mb-6 bg-black rounded-lg overflow-hidden relative">
          <video 
            ref={videoPlayerRef}
            controls
            playsInline
            autoPlay
            preload="auto"
            onTimeUpdate={(e) => console.log("Video time update", e.currentTarget.currentTime)}
            onError={(e) => console.error("Video error:", e)}
            onLoadedData={(e) => {
              // Set initial playback position when video loads
              if (videoPlayerRef.current) {
                const activeClip = failedClip || filteredClips.find(c => 
                  c.clipPath === currentVideoUrl || c.videoId === currentVideoUrl
                );
                if (activeClip?.startTime) {
                  videoPlayerRef.current.currentTime = activeClip.startTime;
                }
                videoPlayerRef.current.play().catch(e => 
                  console.error("Auto-play failed:", e)
                );
              }
            }}
            style={{ width: "100%", height: "auto", maxHeight: "500px" }}
            className="mx-auto"
          >
            <source src={currentVideoUrl} type="video/mp4" />
            <source src={currentVideoUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          {isLoadingVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="bg-black/70 p-4 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            </div>
          )}
        </div>
      )}
      
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
          <div className="flex items-center gap-2">
            {isLoadingSupabaseData && (
              <p className="text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Syncing with HoopData...
              </p>
            )}
            {supabaseSyncComplete && !isLoadingSupabaseData && (
              <p className="text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced with HoopData
              </p>
            )}
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
        </div>
        
        {showPersistenceInfo && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Storage Information</AlertTitle>
            <AlertDescription>
              <p>Your clips, folders, and games are automatically saved in your browser's local storage. They will persist even after closing the browser or turning off your device.</p>
              <p className="mt-2 text-sm">Clips are synchronized with HoopData cloud storage for access across devices. Cloud clips are automatically merged into your local library.</p>
              <p className="mt-2 text-sm font-medium">
                Total local clips: {savedClips.length} | Cloud videos: {supabaseVideoFiles.length} | Total folders: {folders.length} | Total games: {games?.length || 0}
                {storageInfo && ` | Local storage used: ${storageInfo.totalSizeKB} KB`}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Add video preloader to preload upcoming videos */}
      {filteredClips.length > 0 && !isLoadingVideo && currentVideoUrl && (
        <VideoPreloader 
          videoPaths={filteredClips
            // Only preload videos that aren't already loaded and aren't the current one
            .filter(clip => 
              clip.isSupabaseClip && 
              (clip.clipPath || clip.videoId) && 
              (!clip.directVideoUrl || !clip.directVideoUrl.includes(currentVideoUrl))
            )
            // Only preload 1 video to prevent overloading and flickering
            .slice(0, 1)
            .map(clip => ({
              bucket: clip.sourceType === 'clips' ? 'clips' : 'videos',
              path: clip.clipPath || clip.videoId
            }))}
          maxPreload={1} // Only preload one at a time
          currentVideoUrl={currentVideoUrl} // Don't preload the current video
        />
      )}
      
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
          <AlertTitle>Video Playback Error</AlertTitle>
          <AlertDescription>
            <p>{videoError}</p>
            <div className="mt-2 space-y-2 text-sm">
              <p>Possible solutions:</p>
              <ul className="list-disc pl-5">
                <li>Convert the video to WebM format using the "Convert to WebM" option (recommended)</li>
                <li>Try a different browser (Chrome works best)</li>
                <li>Check that your Supabase storage is configured correctly and accessible</li>
                <li>Ensure the clip file exists in the Supabase storage bucket</li>
              </ul>
            </div>
            {failedClip && (
              <div className="mt-3">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    handleConvertToWebM(failedClip);
                    setVideoError(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileVideo className="h-4 w-4" />
                  Convert This Video to WebM
                </Button>
              </div>
            )}
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
                extraActions={[
                  {
                    label: "Convert to WebM",
                    icon: <FileVideo className="h-4 w-4 mr-2" />,
                    onClick: handleConvertToWebM
                  }
                ]}
              />
            ) : (
              <ClipThumbnailGrid
                clips={filteredClips}
                onPlayClip={handlePlayClip}
                bucketFilter={bucketMode}
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
      
      {/* Add the conversion dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Video to WebM Format</DialogTitle>
            <DialogDescription>
              Converting to WebM format improves playback performance and reduces loading times.
            </DialogDescription>
          </DialogHeader>
          
          {isConvertingVideo ? (
            <div className="py-6">
              <Progress value={conversionProgress} className="h-2 mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                {conversionProgress < 10 && "Preparing..."}
                {conversionProgress >= 10 && conversionProgress < 80 && "Converting video..."}
                {conversionProgress >= 80 && conversionProgress < 95 && "Uploading..."}
                {conversionProgress >= 95 && "Finalizing..."}
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="mb-4">
                Convert "{selectedClipForConversion?.play_name}" to WebM format?
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                This process will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-4">
                <li>Convert the MP4 video to WebM format</li>
                <li>Create a WebP thumbnail</li>
                <li>Upload both to Supabase storage</li>
                <li>The original file will remain untouched</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Note: Conversion happens in your browser and may take several minutes depending on the video length.
              </p>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConvertDialogOpen(false)}
              disabled={isConvertingVideo}
            >
              Cancel
            </Button>
            <Button 
              onClick={performConversion}
              disabled={isConvertingVideo || !selectedClipForConversion}
            >
              {isConvertingVideo ? "Converting..." : "Convert to WebM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClipLibrary;
