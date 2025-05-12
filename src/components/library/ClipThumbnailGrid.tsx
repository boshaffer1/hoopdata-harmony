import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SavedClip } from "@/types/analyzer";
import { PlayCircle, Loader2, RefreshCw, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSignedUrl, getBestStorageUrl } from "@/utils/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { testVideoAccess } from "@/utils/test-video-access";
import { loadAllSupabaseData } from "@/utils/all-supabase-data";
import VideoPreloader from './VideoPreloader';
import { formatReadableTime } from "@/components/video/utils";

interface ClipThumbnailGridProps {
  clips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
  bucketFilter?: 'clips' | 'all';
}

export const ClipThumbnailGrid = React.memo(({ 
  clips: initialClips,
  onPlayClip,
  bucketFilter = 'all'
}: ClipThumbnailGridProps) => {
  const [supabaseClips, setSupabaseClips] = useState<SavedClip[]>([]);
  const [isLoadingClips, setIsLoadingClips] = useState(false);
  const [hoverClip, setHoverClip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testVideoUrl, setTestVideoUrl] = useState<string | null>(null);
  const [isTestingVideo, setIsTestingVideo] = useState(false);
  const [preloadUrls, setPreloadUrls] = useState<string[]>([]);
  const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string | null>(null);
  
  const testDirectVideoAccess = async () => {
    setIsTestingVideo(true);
    try {
      console.log("Testing direct access to Supabase storage");
      try {
        console.log("Listing available buckets...");
        const { data: bucketList, error: bucketError } = await supabase
          .storage
          .listBuckets();
          
        console.log("Bucket listing result:", bucketList, bucketError);
        
        // Try direct access to the 'videos' bucket
        console.log("Trying to access 'videos' bucket directly...");
        const { data: files, error: listError } = await supabase
          .storage
          .from('videos')
          .list('');
          
        console.log("Videos bucket list result:", files, listError);
      } catch (error) {
        console.error("Error accessing videos bucket:", error);
        toast.error("Failed to access videos bucket");
      }
      
      // First check for any video files
      const { data: videoFiles, error: videoError } = await supabase
        .from('video_files')
        .select('*')
        .limit(1);
        
      if (videoError) {
        console.error("Error fetching video files:", videoError);
        toast.error("Failed to access video files");
        setIsTestingVideo(false);
        return;
      }
      
      if (!videoFiles || videoFiles.length === 0) {
        // Try accessing any clip directly from storage
        const { data: files, error: storageError } = await supabase
          .storage
          .from('videos')
          .list('', { limit: 1 });
          
        if (storageError || !files || files.length === 0) {
          toast.error("No video files found in storage");
          setIsTestingVideo(false);
          return;
        }
        
        // Create signed URL for the first file
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('videos')
          .createSignedUrl(files[0].name, 3600);
          
        if (signedUrlError) {
          console.error("Error creating signed URL:", signedUrlError);
          toast.error("Failed to create signed URL");
          setIsTestingVideo(false);
          return;
        }
        
        setTestVideoUrl(signedUrlData?.signedUrl || null);
        toast.success("Created test URL for video file");
        setIsTestingVideo(false);
        return;
      }
      
      // If we have video files, create a signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(videoFiles[0].file_path, 3600);
        
      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        toast.error("Failed to create signed URL");
        setIsTestingVideo(false);
        return;
      }
      
      setTestVideoUrl(signedUrlData?.signedUrl || null);
      toast.success("Created test URL for video file");
      
    } catch (error) {
      console.error("Error in direct video test:", error);
      toast.error("Failed to test video access");
    } finally {
      setIsTestingVideo(false);
    }
  };
  
  useEffect(() => {
    const fetchSupabaseClips = async () => {
      setIsLoadingClips(true);
      setError(null);
      
      try {
        console.log(`ClipThumbnailGrid: Using data loader for Supabase. Filter: ${bucketFilter}`);
        
        const allData = await loadAllSupabaseData();
        
        let unifiedClips = allData.unified.clips || [];
        
        if (bucketFilter === 'clips') {
          console.log("ClipThumbnailGrid: Filtering for 'clips' bucket items.");
          unifiedClips = unifiedClips.filter(clip => clip.sourceType === 'clips');
          console.log(`ClipThumbnailGrid: After filtering: ${unifiedClips.length} clips from 'clips' bucket.`);
        }
        
        console.log(`ClipThumbnailGrid: Found ${unifiedClips.length} unified clips.`, unifiedClips.slice(0,3));
        
        if (unifiedClips.length > 0) {
          setSupabaseClips(unifiedClips);
        } else {
          console.log("ClipThumbnailGrid: No unified clips found in Supabase.");
          const videoFiles = allData.storage.videos || [];
          const clipFiles = allData.storage.clips || [];
          const fallbackFiles = bucketFilter === 'clips' ? clipFiles : videoFiles;
          
          if (fallbackFiles.length > 0) {
            const videoClips = fallbackFiles.map(file => ({
              id: file.id,
              startTime: 0,
              endTime: 120, 
              duration: 120,
              label: file.name,
              tags: [],
              notes: "",
              timeline: "",
              saved: file.created_at,
              videoId: file.name,
              directVideoUrl: null,
              isSupabaseClip: true,
              sourceType: bucketFilter === 'clips' ? 'clips' : 'videos',
              source: 'storage',
              clipPath: bucketFilter === 'clips' ? file.name : null,
            }) as SavedClip);
            setSupabaseClips(videoClips);
          } else {
            setError("No clips or videos found in your Supabase storage or database.");
          }
        }
      } catch (err) {
        console.error("ClipThumbnailGrid: Error fetching data from Supabase:", err);
        setError(`Error loading data: ${err.message}`);
        toast.error("Failed to load Supabase data");
      } finally {
        setIsLoadingClips(false);
      }
    };
    
    fetchSupabaseClips();
  }, [bucketFilter]);
  
  useEffect(() => {
    const checkVideoAccess = async () => {
      try {
        const result = await testVideoAccess();
        if (result.success) {
          console.log("ClipThumbnailGrid: Video access check successful.");
        } else {
          console.error("ClipThumbnailGrid: Initial video access check failed:", result.error);
        }
      } catch (err) {
        console.error("ClipThumbnailGrid: Error during initial video access check:", err);
      }
    };
    checkVideoAccess();
  }, []);
  
  useEffect(() => {
    if (!supabaseClips || supabaseClips.length === 0) {
      setPreloadUrls([]);
      return;
    }
    
    // Create a list of URLs for next few clips to preload
    const nextClipsToPreload = supabaseClips.slice(0, 3);
    
    // Start preloading URLs in the background
    const preloadUrlList: string[] = [];
    
    for (const clip of nextClipsToPreload) {
      if (clip.directVideoUrl) {
        preloadUrlList.push(clip.directVideoUrl);
      }
    }
    
    // Set the URLs for the preloader
    setPreloadUrls(preloadUrlList);
  }, [supabaseClips]);
  
  // Memoize the combined clips array to prevent unnecessary re-renders
  const allClips = React.useMemo(() => {
    const combined = [...initialClips, ...supabaseClips];
    // Log this only once when the array is created, not on every render
    console.log(`ClipThumbnailGrid: Displaying ${combined.length} total clips. Local: ${initialClips.length}, Supabase: ${supabaseClips.length}`);
    if (combined.length > 0 && (initialClips.length > 0 || supabaseClips.length > 0)) {
      console.log("ClipThumbnailGrid: Sample clips for display: Local: ", initialClips.slice(0,2), " Supabase: ", supabaseClips.slice(0,2));
    }
    return combined;
  }, [initialClips, supabaseClips]);
  
  const areRawVideos = supabaseClips.length > 0 && 
    supabaseClips.every(clip => 
      (clip.startTime === 0 || clip.startTime === undefined) && 
      (clip as any).end_time === 120
    );
  
  const handlePlayClip = async (clip: SavedClip) => {
    console.log("ClipThumbnailGrid: Attempting to play clip:", clip.label, clip.id);
    const toastId = toast.loading("Loading video...");
    
    let videoUrl: string | null = null;
    let clipToPlay = { ...clip };

    if (clip.directVideoUrl) {
      console.log("ClipThumbnailGrid: Using existing directVideoUrl.");
      videoUrl = clip.directVideoUrl;
    } else if ((clip as any).clipPath && clip.sourceType === 'clips') {
      try {
        console.log("ClipThumbnailGrid: Getting URL for clipPath (clips bucket):", (clip as any).clipPath);
        // Use getBestStorageUrl which will try public URL first (much faster)
        videoUrl = await getBestStorageUrl('clips', (clip as any).clipPath);
      } catch (error) {
        console.error("ClipThumbnailGrid: Error with clipPath (clips):", error);
      }
    } else if (clip.videoId && clip.sourceType === 'videos') {
      try {
        console.log("ClipThumbnailGrid: Getting URL for videoId (videos bucket):", clip.videoId);
        // Use getBestStorageUrl which will try public URL first (much faster)
        videoUrl = await getBestStorageUrl('videos', clip.videoId);
      } catch (error) {
        console.error("ClipThumbnailGrid: Error with videoId (videos):", error);
      }
    } else if (clip.videoId) {
      try {
        console.log("ClipThumbnailGrid: Fallback to videoId (videos bucket):", clip.videoId);
        // Use getBestStorageUrl which will try public URL first (much faster)
        videoUrl = await getBestStorageUrl('videos', clip.videoId);
      } catch (error) {
        console.error("ClipThumbnailGrid: Error with fallback videoId (videos):", error);
      }
    } else if ((clip as any).clipPath) {
      try {
        console.log("ClipThumbnailGrid: Fallback to clipPath (clips bucket likely):", (clip as any).clipPath);
        // Use getBestStorageUrl which will try public URL first (much faster)
        videoUrl = await getBestStorageUrl('clips', (clip as any).clipPath);
      } catch (error) {
        console.error("ClipThumbnailGrid: Error with fallback clipPath (clips):", error);
      }
    }

    toast.dismiss(toastId);
    if (videoUrl) {
      console.log("ClipThumbnailGrid: Successfully got URL. Passing to onPlayClip.");
      
      // Check video format and show recommendation for problematic formats
      const fileName = clip.label || (clip as any).clipPath || clip.videoId || '';
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'mov') {
        toast.warning("MOV file format detected - may have limited browser compatibility", {
          description: "Consider converting to MP4 or WebM for better playback",
          duration: 5000
        });
      }
      
      clipToPlay.directVideoUrl = videoUrl;
      setCurrentPlayingUrl(videoUrl);
      onPlayClip(clipToPlay);
    } else {
      console.error("ClipThumbnailGrid: Failed to get any valid URL for clip:", clip);
      toast.error("Failed to get video URL. Check Supabase storage & policies.");
    }
  };
  
  if (isLoadingClips) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading clips from HoopData...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg border-red-200">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-sm mb-4">
          {`Looking for content in the '${bucketFilter === 'clips' ? 'clips' : 'all relevant'}' bucket(s).`}
          <br />
          Make sure Supabase storage policies allow access. Check console for details.
        </p>
        <div className="flex justify-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="default" size="sm" onClick={testDirectVideoAccess} disabled={isTestingVideo}>
            {isTestingVideo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</> : <><RefreshCw className="h-4 w-4 mr-2" />Test Access</>}
          </Button>
        </div>
        {testVideoUrl && (
          <div className="mt-4 mb-4">
            <p className="text-sm mb-2">Test video:</p>
            <video src={testVideoUrl} controls className="max-w-md mx-auto rounded-md border" style={{ maxHeight: "200px" }} />
          </div>
        )}
      </div>
    );
  }
  
  if (allClips.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground mb-2">No clips found</p>
        <p className="text-sm text-muted-foreground mb-4">
          {initialClips.length === 0 && supabaseClips.length === 0 && "No local or cloud clips available."}
          {initialClips.length > 0 && supabaseClips.length === 0 && "No cloud clips found for the current filter."}
          {initialClips.length === 0 && supabaseClips.length > 0 && "No local clips found; showing cloud clips."}
        </p>
        <Button variant="default" size="sm" onClick={testDirectVideoAccess} disabled={isTestingVideo}>
          {isTestingVideo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</> : <><RefreshCw className="h-4 w-4 mr-2" />Test Access</>}
        </Button>
        {testVideoUrl && (
          <div className="mt-4">
            <p className="text-sm mb-2">Test video:</p>
            <video src={testVideoUrl} controls className="max-w-md mx-auto rounded-md border" style={{ maxHeight: "200px" }}/>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {allClips.length} clips {supabaseClips.length > 0 ? `(${supabaseClips.length} from HoopData)` : ''}
        </p>
      </div>
      
      <div className="mb-4 text-xs text-muted-foreground">
        <p>Click on any clip to play automatically in the main player.</p>
      </div>
      
      {areRawVideos && (
        <div className="mb-6 p-3 border-l-4 border-blue-500 bg-blue-50 pl-4">
          <p className="text-sm">
            <strong>Note:</strong> Showing full-length videos from storage. Use analyzer to create shorter clips.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {allClips.map((clip) => (
          <Card 
            key={clip.id || clip.label}
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all border-gray-200 hover:border-primary"
            onClick={() => handlePlayClip(clip)}
            onMouseEnter={() => setHoverClip(clip.id)}
            onMouseLeave={() => setHoverClip(null)}
          >
            <div className="relative aspect-video bg-slate-700 flex items-center justify-center">
              <FileVideo className="h-14 w-14 text-slate-500/50 group-hover:opacity-20 transition-opacity" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
              <div className="z-10 font-semibold text-sm text-white p-2 bg-gradient-to-t from-black/70 to-transparent absolute bottom-0 left-0 right-0 truncate">
                {clip.label}
              </div>
              {(clip as any).isSupabaseClip && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-primary/80 text-white text-[10px] font-bold rounded-sm backdrop-blur-sm">
                  HoopData
                </div>
              )}
            </div>
            <CardContent className="p-2.5">
              <div className="flex justify-between items-center">
                <p className="font-bold text-xs text-slate-700">
                  {clip.duration ? formatReadableTime(clip.duration) : 'N/A'}
                </p>
                {clip.tags && clip.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {clip.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <VideoPreloader 
        videoUrls={preloadUrls}
        currentVideoUrl={currentPlayingUrl || undefined}
        maxPreload={2}
      />
    </div>
  );
});

ClipThumbnailGrid.displayName = "ClipThumbnailGrid";
