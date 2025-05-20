import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { toast } from "sonner";
import { Marker } from "@/types/analyzer";
import { formatTime } from "@/hooks/video-player/utils";
import { supabase } from "@/integrations/supabase/client";
import { loadAllSupabaseData } from "@/utils/all-supabase-data";

interface VideoSectionProps {
  videoUrl?: string;
  currentTime: number;
  newMarkerLabel: string;
  markers: Marker[];
  videoPlayerRef: React.RefObject<any>;
  onTimeUpdate: (time: number) => void;
  onVideoFileChange: (e: File | string | React.ChangeEvent<HTMLInputElement>) => void;
  onNewMarkerLabelChange: (value: string) => void;
  onAddMarker: () => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoUrl,
  currentTime,
  newMarkerLabel,
  markers,
  videoPlayerRef,
  onTimeUpdate,
  onVideoFileChange,
  onNewMarkerLabelChange,
  onAddMarker,
}) => {
  // const [supabaseClips, setSupabaseClips] = useState<any[]>([]);
  // const [isLoadingClips, setIsLoadingClips] = useState(false);

  // Log when videoUrl changes
  useEffect(() => {
    console.log("VideoSection received videoUrl:", videoUrl);
    if (videoUrl && videoPlayerRef.current) {
      // Attempt to play the video when the URL changes and the player is available
      // Mute by default for autoplay policies, then unmute
      videoPlayerRef.current.muted = true;
      videoPlayerRef.current.play()
        .then(() => {
          console.log("VideoSection: Autoplay started");
          if (videoPlayerRef.current) {
            videoPlayerRef.current.muted = false; // Unmute after successful play
          }
        })
        .catch(error => {
          console.error("VideoSection: Autoplay failed", error);
          // Potentially show a toast or UI indication that autoplay was blocked
          toast.info("Click play if video doesn't start automatically.");
        });
    }
  }, [videoUrl, videoPlayerRef]);

  // Fetch clips from Supabase when component mounts
  // useEffect(() => {
  //   const fetchClips = async () => {
  //     setIsLoadingClips(true);
  //     try {
  //       console.log("Loading clips from Supabase storage");
        
  //       // Use the comprehensive data loader instead of direct database query
  //       const allData = await loadAllSupabaseData();
        
  //       // Get clips from the unified clips array
  //       const unifiedClips = allData.unified.clips || [];
        
  //       // Filter to only show clips from the 'clips' bucket
  //       const clipsOnly = unifiedClips.filter(clip => 
  //         clip.sourceType === 'clips'
  //       ).slice(0, 5); // Limit to 5 clips
        
  //       console.log(`Found ${clipsOnly.length} clips in the clips bucket`);
        
  //       // Convert to format expected by this component
  //       const formattedClips = clipsOnly.map(clip => ({
  //         id: clip.id,
  //         play_name: clip.label || "Unnamed Clip",
  //         start_time: clip.startTime || 0,
  //         end_time: (clip.startTime || 0) + (clip.duration || 30),
  //         video_id: clip.videoId || "",
  //         video_url: clip.videoUrl || clip.directVideoUrl || null,
  //         clip_path: clip.clipPath || null,
  //         tags: clip.tags || []
  //       }));
        
  //       setSupabaseClips(formattedClips);
  //     } catch (error) {
  //       console.error("Error fetching clips:", error);
  //       toast.error("Failed to load clips from database");
  //     } finally {
  //       setIsLoadingClips(false);
  //     }
  //   };
    
  //   fetchClips();
  // }, []);

  // Prepare markers for the video player in the expected format
  const formattedMarkers = markers.map(m => ({
    time: m.time,
    label: m.label,
    color: m.color
  }));

  const handleAddMarker = () => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    onAddMarker();
  };

  const playSupabaseClip = async (clip: any) => {
    if (!clip.video_url && !clip.clip_path) {
      toast.error("No video URL available for this clip");
      return;
    }
    
    try {
      // Show loading toast
      toast.loading("Loading clip...");
      
      let clipUrl = clip.video_url;
      
      // If no direct video_url but we have a clip_path, create a signed URL
      if (!clipUrl && clip.clip_path) {
        console.log(`Creating signed URL for clip: ${clip.clip_path} from clips bucket`);
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('clips')
          .createSignedUrl(clip.clip_path, 3600);
          
        if (signedUrlError) {
          console.error("Error creating signed URL:", signedUrlError);
          
          // Check for common policy issues
          if (signedUrlError.message.includes('permission denied') || 
              signedUrlError.message.includes('denied by policy')) {
            console.error(`
            POLICY ERROR: Permission denied accessing clips/${clip.clip_path}
            
            Ensure you have the following policy in your Supabase project:
            
            CREATE POLICY "Public can view clips" ON storage.objects
              FOR SELECT
              TO anon
              USING (bucket_id = 'clips');
            `);
            toast.dismiss();
            toast.error("Permission denied - check Supabase policies");
            return;
          }
          
          if (signedUrlError.message.includes('Not Found')) {
            toast.dismiss();
            toast.error("Clip not found in storage");
            return;
          }
          
          toast.dismiss();
          toast.error("Failed to create secure URL for clip");
          return;
        }
          
        if (signedUrlData?.signedUrl) {
          console.log("Successfully created signed URL for clip");
          clipUrl = signedUrlData.signedUrl;
        }
      }
      
      if (clipUrl) {
        // Use the video URL to play the clip
        toast.dismiss();
        toast.success(`Playing clip: ${clip.play_name}`);
        console.log("Passing clip URL to video player:", clipUrl.substring(0, 50) + '...');
        onVideoFileChange(clipUrl);
      } else {
        toast.dismiss();
        toast.error("Could not generate video URL - check Supabase storage permissions");
      }
    } catch (error) {
      console.error("Error playing clip:", error);
      toast.dismiss();
      toast.error("Failed to play clip - check console for details");
    }
  };

  const fetchRecentClips = async () => {
    try {
      // Use the correct table name with proper case - "Clips" instead of "clips"
      const { data, error } = await supabase
        .from("Clips")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Found recent clips:", data.length);
        // Use most recent clip
        const recentClip = data[0];
        
        if (recentClip.video_url) {
          console.log("Setting video URL from recent clip:", recentClip.video_url);
          onVideoFileChange(recentClip.video_url);
        }
      }
    } catch (error) {
      console.error("Error fetching recent clips:", error);
    }
  };

  return (
    <>
      {/* Video Player */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {videoUrl ? (
            <VideoPlayer 
              ref={videoPlayerRef}
              src={videoUrl} 
              onTimeUpdate={onTimeUpdate}
              markers={formattedMarkers}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-muted">
              <div className="text-center p-6">
                <FilePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No video selected</p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={onVideoFileChange}
                  className="max-w-sm mx-auto"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Current Time and Marker Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2">Current Time</h3>
            <div className="text-2xl font-mono">{formatTime(currentTime)}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2">Add Marker</h3>
            <div className="flex space-x-2">
              <Input
                value={newMarkerLabel}
                onChange={(e) => onNewMarkerLabelChange(e.target.value)}
                placeholder="Marker label"
                className="flex-1"
              />
              <Button onClick={handleAddMarker} disabled={!videoUrl}>
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Mark
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VideoSection;
