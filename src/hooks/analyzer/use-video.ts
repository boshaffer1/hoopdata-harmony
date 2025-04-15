
import { useState, useRef } from "react";
import { toast } from "sonner";

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
      // Direct URL string
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
      let newVideoUrl;
      
      if (typeof fileOrUrl === 'string') {
        // This is already a URL
        newVideoUrl = fileOrUrl;
        console.log("Setting video URL from string:", fileOrUrl);
      } else {
        // This is a File object
        newVideoUrl = URL.createObjectURL(fileOrUrl);
        console.log("Created object URL for file:", fileOrUrl.name);
      }
      
      setVideoUrl(newVideoUrl);
      toast.success("Video loaded successfully");
      
      // Reset current time
      setCurrentTime(0);
      
      return newVideoUrl;
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
