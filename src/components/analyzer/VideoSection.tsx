
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
  const [supabaseClips, setSupabaseClips] = useState<any[]>([]);
  const [isLoadingClips, setIsLoadingClips] = useState(false);

  // Fetch clips from Supabase when component mounts
  useEffect(() => {
    const fetchClips = async () => {
      setIsLoadingClips(true);
      try {
        const { data, error } = await supabase
          .from('clips')
          .select('*')
          .limit(5); // Limiting to 5 most recent clips for display in this section
        
        if (error) throw error;
        
        if (data) {
          console.log("Fetched clips from Supabase:", data);
          setSupabaseClips(data);
        }
      } catch (error) {
        console.error("Error fetching clips:", error);
        toast.error("Failed to load clips from database");
      } finally {
        setIsLoadingClips(false);
      }
    };
    
    fetchClips();
  }, []);

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
      let clipUrl = clip.video_url;
      
      // If no direct video_url but we have a clip_path, create a signed URL
      if (!clipUrl && clip.clip_path) {
        const { data: signedUrlData } = await supabase
          .storage
          .from('clips')
          .createSignedUrl(clip.clip_path, 3600);
          
        if (signedUrlData?.signedUrl) {
          clipUrl = signedUrlData.signedUrl;
        }
      }
      
      if (clipUrl) {
        // Use the video URL to play the clip
        onVideoFileChange(clipUrl);
        toast.success(`Playing clip: ${clip.play_name}`);
      } else {
        toast.error("Could not generate video URL");
      }
    } catch (error) {
      console.error("Error playing clip:", error);
      toast.error("Failed to play clip");
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
      
      {/* Recent Clips from Supabase */}
      {supabaseClips.length > 0 && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Recent Clips from Database</h3>
            <div className="space-y-2">
              {supabaseClips.map(clip => (
                <div key={clip.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{clip.play_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {clip.start_time}s to {clip.end_time}s ({(clip.end_time - clip.start_time).toFixed(1)}s)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playSupabaseClip(clip)}
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default VideoSection;
