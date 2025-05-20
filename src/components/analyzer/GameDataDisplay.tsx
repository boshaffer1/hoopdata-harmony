import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SavedClip } from '@/types/analyzer';
import { ClipThumbnailGrid } from '../library/ClipThumbnailGrid';
import VideoPlayer from '../video/VideoPlayer';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { formatReadableTime } from "@/components/video/utils";

interface VideoFile {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  file_path: string;
  team_id?: string;
  game_id?: string;
}

interface GameDataDisplayProps {
  teamFilter?: string;
  dateFilter?: string;
}

const GameDataDisplay: React.FC<GameDataDisplayProps> = ({ 
  teamFilter, 
  dateFilter 
}) => {
  const [clips, setClips] = useState<SavedClip[]>([]);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentClip, setCurrentClip] = useState<SavedClip | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch video files
        const { data: videoData, error: videoError } = await supabase
          .from('video_files')
          .select('*');
        
        if (videoError) throw videoError;
        
        // Fetch clips
        const { data: clipData, error: clipError } = await supabase
          .from('Clips')
          .select('*');
        
        if (clipError) throw clipError;
        
        if (videoData) setVideos(videoData);
        
        // Transform clip data to match SavedClip interface
        if (clipData) {
          const transformedClips: SavedClip[] = clipData.map(clip => ({
            id: clip.id,
            startTime: clip.start_time,
            duration: clip.end_time - clip.start_time,
            label: clip.play_name,
            notes: '',
            timeline: '',
            saved: new Date().toISOString(),
            tags: clip.tags || [],
            videoId: clip.video_id,
            videoUrl: clip.video_url
          }));
          setClips(transformedClips);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamFilter, dateFilter]);
  
  const handlePlayVideo = async (video: VideoFile) => {
    try {
      const { data } = await supabase.storage
        .from('videos')
        .createSignedUrl(video.file_path, 3600);
      
      if (data?.signedUrl) {
        setCurrentVideo(data.signedUrl);
        setCurrentClip(null);
        toast.success(`Playing ${video.title || video.filename}`);
      } else {
        throw new Error("Could not generate signed URL");
      }
    } catch (error) {
      console.error("Error getting signed URL:", error);
      toast.error("Could not load video");
    }
  };
  
  const handlePlayClip = async (clip: SavedClip) => {
    setCurrentClip(clip);
    
    // If clip already has a direct URL
    if (clip.directVideoUrl) {
      setCurrentVideo(clip.directVideoUrl);
      toast.success(`Playing clip: ${clip.label}`);
      return;
    }
    
    // Find corresponding video for this clip if videoId is available
    if (clip.videoId) {
      try {
        const { data } = await supabase
          .storage
          .from('videos')
          .createSignedUrl(clip.videoId, 3600);
          
        if (data?.signedUrl) {
          setCurrentVideo(data.signedUrl);
          toast.success(`Playing clip: ${clip.label}`);
        } else {
          toast.error('Could not generate video URL');
        }
      } catch (error) {
        console.error("Error getting signed URL:", error);
        toast.error('Video source not found for this clip');
      }
    } else if (clip.videoUrl) {
      // Use the video URL directly if available
      setCurrentVideo(clip.videoUrl);
      toast.success(`Playing clip: ${clip.label}`);
    } else {
      toast.error('No video associated with this clip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 rounded-md bg-destructive/10">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Video Player */}
      {currentVideo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {currentClip ? `Clip: ${currentClip.label}` : 'Full Game Video'}
            </CardTitle>
            <CardDescription>
              {currentClip 
                ? `Start Time: ${currentClip.startTime}s, Duration: ${formatReadableTime(currentClip.duration)}` 
                : 'Playing full game footage'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPlayer 
              src={currentVideo} 
              className="w-full aspect-video rounded-md overflow-hidden"
              markers={currentClip ? [{
                time: currentClip.startTime,
                label: currentClip.label,
                color: 'blue'
              }] : []}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clips">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clips">Clips Gallery</TabsTrigger>
          <TabsTrigger value="videos">Full Videos</TabsTrigger>
          <TabsTrigger value="gamelog">Game Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clip Library</CardTitle>
              <CardDescription>
                Browse and play clips from the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipThumbnailGrid 
                clips={clips} 
                onPlayClip={handlePlayClip} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Full Game Videos</CardTitle>
              <CardDescription>
                Browse and play full game videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Game ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map(video => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">
                        {video.title || video.filename}
                      </TableCell>
                      <TableCell>{video.team_id || 'N/A'}</TableCell>
                      <TableCell>{video.game_id || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">{video.description || 'No description'}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => handlePlayVideo(video)}
                          variant="outline"
                          size="sm"
                        >
                          Play
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gamelog" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Log</CardTitle>
              <CardDescription>
                View and filter game statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                Game log data will be displayed here once integrated with the NBA data API
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameDataDisplay;
