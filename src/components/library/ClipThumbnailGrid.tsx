
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SavedClip } from "@/types/analyzer";
import { PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ClipThumbnailGridProps {
  clips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
}

export const ClipThumbnailGrid = React.memo(({ 
  clips, 
  onPlayClip 
}: ClipThumbnailGridProps) => {
  const [supabaseClips, setSupabaseClips] = useState<any[]>([]);
  const [isLoadingClips, setIsLoadingClips] = useState(false);
  const [hoverClip, setHoverClip] = useState<string | null>(null);
  
  // Fetch clips from Supabase table
  useEffect(() => {
    const fetchSupabaseClips = async () => {
      setIsLoadingClips(true);
      try {
        const { data, error } = await supabase
          .from('clips')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          console.log("Fetched clips from Supabase:", data);
          
          // Convert Supabase clips to the SavedClip format
          const convertedClips = data.map(clip => ({
            id: clip.id,
            startTime: clip.start_time,
            duration: clip.end_time - clip.start_time,
            label: clip.play_name,
            notes: "",
            timeline: "",
            saved: new Date().toISOString(),
            tags: clip.tags || [],
            videoId: clip.video_id,
            videoUrl: clip.video_url,
            clipPath: clip.clip_path
          }));
          
          setSupabaseClips(convertedClips);
        }
      } catch (error) {
        console.error("Error fetching clips from Supabase:", error);
      } finally {
        setIsLoadingClips(false);
      }
    };
    
    fetchSupabaseClips();
  }, []);
  
  // Combine local clips and Supabase clips
  const allClips = [...clips, ...supabaseClips];
  
  const handlePlayClip = async (clip: SavedClip) => {
    // For Supabase clips, we need to get the signed URL before playing
    if ((clip as any).clipPath) {
      try {
        const { data } = await supabase
          .storage
          .from('clips')
          .createSignedUrl((clip as any).clipPath, 3600);
          
        if (data?.signedUrl) {
          const clipWithUrl = {
            ...clip,
            directVideoUrl: data.signedUrl
          };
          onPlayClip(clipWithUrl);
          return;
        }
      } catch (error) {
        console.error("Error creating signed URL for clip:", error);
      }
    }
    
    // For clips with videoId, we need to get the signed URL for the video
    if (clip.videoId && !clip.directVideoUrl) {
      try {
        const { data } = await supabase
          .storage
          .from('videos')
          .createSignedUrl(clip.videoId, 3600);
          
        if (data?.signedUrl) {
          const clipWithUrl = {
            ...clip,
            directVideoUrl: data.signedUrl
          };
          onPlayClip(clipWithUrl);
          return;
        }
      } catch (error) {
        console.error("Error creating signed URL for video:", error);
      }
    }
    
    // If we got here, just try to play the clip with what we have
    onPlayClip(clip);
  };
  
  if (isLoadingClips) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading clips...</p>
      </div>
    );
  }
  
  if (allClips.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No clips found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {allClips.map((clip) => (
        <Card 
          key={clip.id}
          className="overflow-hidden group cursor-pointer transition-all"
          onClick={() => handlePlayClip(clip)}
          onMouseEnter={() => setHoverClip(clip.id)}
          onMouseLeave={() => setHoverClip(null)}
        >
          <div className="relative aspect-video bg-muted flex items-center justify-center">
            {/* Placeholder for clip thumbnail */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="h-12 w-12 text-white" />
            </div>
            <div className="z-10 text-sm font-medium text-white/90 p-2 bg-black/50 absolute bottom-0 left-0 right-0">
              {clip.label}
            </div>
          </div>
          <CardContent className="p-2">
            <p className="text-xs truncate">
              Duration: {clip.duration.toFixed(1)}s
            </p>
            {clip.tags && clip.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {clip.tags.slice(0, 2).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
                {clip.tags.length > 2 && (
                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">
                    +{clip.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

ClipThumbnailGrid.displayName = "ClipThumbnailGrid";
