
import { useState, useRef } from "react";
import { toast } from "sonner";

export const useVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
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
