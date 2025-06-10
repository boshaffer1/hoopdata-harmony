
import { useState, useRef } from "react";
import { toast } from "sonner";
import { triggerWebhook } from "@/utils/webhook-handler";

export const useVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);

  const handleVideoFileChange = (fileOrEvent: File | string | React.ChangeEvent<HTMLInputElement>) => {
    let fileOrUrl: File | string | undefined;
    
    // Handle different input types
    if (fileOrEvent instanceof File) {
      // Direct File object
      fileOrUrl = fileOrEvent;
    } else if (typeof fileOrEvent === 'string') {
      // Direct URL string - check if it's a Supabase URL or external URL
      if (fileOrEvent.includes('supabase.co') || fileOrEvent.startsWith('http')) {
        // This is already a proper URL, use it directly
        setVideoUrl(fileOrEvent);
        toast.success("Video loaded from URL");
        
        // Reset current time
        setCurrentTime(0);
        
        // Trigger webhook with URL information
        triggerWebhook({
          event: "video_loaded",
          timestamp: new Date().toISOString(),
          videoDetails: {
            url: fileOrEvent,
            fileName: fileOrEvent.split('/').pop() || "video",
            fileSize: 0,
            source: "url"
          }
        });
        
        return fileOrEvent;
      }
      fileOrUrl = fileOrEvent;
    } else if (fileOrEvent?.target?.files?.length) {
      // Event from input[type=file]
      fileOrUrl = fileOrEvent.target.files[0];
    }

    if (!fileOrUrl) {
      toast.error("No file selected");
      return null;
    }

    try {
      if (typeof fileOrUrl === 'string') {
        // This is already a URL
        setVideoUrl(fileOrUrl);
        console.log("Setting video URL from string:", fileOrUrl);
      } else {
        // This is a File object - create blob URL temporarily but warn user
        const newVideoUrl = URL.createObjectURL(fileOrUrl);
        console.log("Created temporary blob URL for file:", fileOrUrl.name);
        console.warn("Using blob URL - file needs to be uploaded to Supabase for permanent access");
        
        setVideoUrl(newVideoUrl);
        
        // Show warning about temporary nature of blob URL
        toast.warning("File loaded temporarily - please upload to Supabase for permanent access", {
          duration: 5000
        });
      }
      
      // Reset current time
      setCurrentTime(0);
      
      // Trigger webhook with video information
      triggerWebhook({
        event: "video_loaded_locally",
        timestamp: new Date().toISOString(),
        videoDetails: {
          url: typeof fileOrUrl === 'string' ? fileOrUrl : 'blob-url-temporary',
          fileName: typeof fileOrUrl === 'string' ? fileOrUrl.split('/').pop() || "video" : fileOrUrl.name,
          fileSize: typeof fileOrUrl === 'string' ? 0 : fileOrUrl.size,
          source: typeof fileOrUrl === 'string' ? 'url' : 'local-file'
        }
      });
      
      return typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    } catch (error) {
      console.error("Error processing video file:", error);
      toast.error("Failed to load video file");
      return null;
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const seekToMarker = (time: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekToTime(time);
    }
  };

  return {
    videoUrl,
    currentTime,
    videoPlayerRef,
    handleVideoFileChange,
    handleTimeUpdate,
    seekToMarker
  };
};
