
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { toast } from "sonner";
import { Marker } from "@/types/analyzer";
import { formatTime } from "@/hooks/video-player/utils";
import { supabase } from "@/integrations/supabase/client";
import { loadAllSupabaseData } from "@/utils/all-supabase-data";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { triggerWebhook } from "@/utils/webhook-handler";

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

interface VideoUploadFormData {
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>("");
  
  // Form setup
  const form = useForm<VideoUploadFormData>({
    defaultValues: {
      homeTeam: "",
      awayTeam: "",
      gameDate: new Date().toISOString().split('T')[0]
    }
  });

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const fileUrl = URL.createObjectURL(file);
        onVideoFileChange(fileUrl);
        toast.success(`Video "${file.name}" loaded successfully`);
      } else {
        toast.error("Please drop a valid video file");
      }
    }
  }, [onVideoFileChange]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      const fileUrl = URL.createObjectURL(file);
      onVideoFileChange(fileUrl);
    }
  };

  const handleAddMarker = () => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    onAddMarker();
  };

  const handleUploadAndAnalyze = async (data: VideoUploadFormData) => {
    if (!videoFile) {
      toast.error("Please select a video file first");
      return;
    }

    setIsUploading(true);
    setAnalysisResults("");
    
    // Create form data for the webhook
    const formData = new FormData();
    formData.append("videoInput", videoFile);
    formData.append("homeTeam", data.homeTeam);
    formData.append("awayTeam", data.awayTeam);
    formData.append("gameDate", data.gameDate);
    
    try {
      toast.loading("Uploading video and waiting for analysis...");
      
      const response = await fetch("https://playswise.app.n8n.cloud/webhook-test/analyze", {
        method: "POST",
        body: formData,
        // Note: We don't set Content-Type header as it's automatically set with the correct boundary for multipart/form-data
      });
      
      toast.dismiss();
      
      if (response.ok) {
        let result;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
          setAnalysisResults(JSON.stringify(result, null, 2));
        } else {
          const textResult = await response.text();
          setAnalysisResults(textResult);
        }
        
        toast.success("Video uploaded and analyzed successfully!");
        
        // Trigger webhook with the analysis data
        triggerWebhook({
          event: "video_analyzed",
          timestamp: new Date().toISOString(),
          videoDetails: {
            fileName: videoFile.name,
            fileSize: videoFile.size,
            homeTeam: data.homeTeam,
            awayTeam: data.awayTeam,
            gameDate: data.gameDate
          }
        });
        
      } else {
        const errorText = await response.text();
        console.error("Error from webhook:", errorText);
        toast.error("Failed to analyze video. Check console for details.");
        setAnalysisResults(`Error: ${response.status} ${response.statusText}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading and analyzing video:", error);
      toast.error("Error connecting to the analysis service");
      setAnalysisResults(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Prepare markers for the video player in the expected format
  const formattedMarkers = markers.map(m => ({
    time: m.time,
    label: m.label,
    color: m.color
  }));

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
            <div 
              className={`aspect-video flex items-center justify-center bg-muted transition-colors ${isDragging ? 'bg-primary/10 border-2 border-dashed border-primary' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center p-6">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop a video file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="max-w-sm mx-auto"
                  id="videoInput"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Game Information and Analysis Form */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUploadAndAnalyze)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homeTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Team</FormLabel>
                      <FormControl>
                        <Input placeholder="Home Team" id="teamIdInput" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="awayTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Team</FormLabel>
                      <FormControl>
                        <Input placeholder="Away Team" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gameDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isUploading || !videoFile}
              >
                {isUploading ? 'Processing...' : 'Upload and Analyze'}
              </Button>
            </form>
          </Form>
          
          {/* Analysis Results */}
          {analysisResults && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Analysis Results</h3>
              <Textarea 
                id="resultsText"
                value={analysisResults} 
                readOnly 
                className="h-48 font-mono text-sm" 
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Current Time and Marker Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
