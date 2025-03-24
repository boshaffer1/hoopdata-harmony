
import React, { forwardRef, useState, useEffect } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';
import { toast } from 'sonner';

interface VideoFrameProps {
  src?: string;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({ src }, ref) => {
  const { actions, state } = useVideoPlayerContext();
  const { togglePlay } = actions;
  const [attemptedRecovery, setAttemptedRecovery] = useState(false);

  // Enhanced error handler with improved recovery
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event:", e);
    const videoElement = e.target as HTMLVideoElement;
    const errorCode = videoElement.error?.code;
    
    // Log detailed error information
    if (videoElement.error) {
      console.error("Video error code:", errorCode);
      console.error("Video error message:", videoElement.error.message);
    }
    
    // Try to recover from decoding errors with more aggressive approach
    if (!attemptedRecovery && videoElement) {
      setAttemptedRecovery(true);
      
      console.log("Attempting video recovery...");
      
      // First recovery attempt: reload source
      setTimeout(() => {
        if (videoElement.src) {
          console.log("Recovery attempt 1: Reloading source");
          const currentSrc = videoElement.src;
          videoElement.src = "";
          videoElement.load();
          
          setTimeout(() => {
            videoElement.src = currentSrc;
            videoElement.load();
            
            // Try to play after reload
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.log("Auto-play after recovery failed:", err);
              });
            }
          }, 500);
        }
      }, 300);
      
      // Show a less discouraging error message
      toast.error(
        "Video playback issue detected. Attempting to recover...",
        { duration: 3000 }
      );
      
      return;
    }
    
    // If we've already tried recovery, show a more detailed error
    if (attemptedRecovery) {
      let errorMessage = "Video playback error";
      
      // Provide more specific error messages based on error code
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          errorMessage = "Playback aborted";
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMessage = "Network issue while loading video";
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage = "Issue decoding video. Try refreshing the page.";
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage = "This video format may not be fully supported by your browser";
          break;
        default:
          errorMessage = "Unknown playback error";
      }
      
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  return (
    <video
      ref={ref}
      className="w-full h-full object-contain"
      onClick={togglePlay}
      src={src}
      preload="auto"
      playsInline
      onError={handleError}
    >
      Your browser doesn't support HTML5 video.
    </video>
  );
});

VideoFrame.displayName = "VideoFrame";

export default VideoFrame;
