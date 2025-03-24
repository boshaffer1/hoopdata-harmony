
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
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const MAX_RECOVERY_ATTEMPTS = 3;

  // Reset recovery attempts when src changes
  useEffect(() => {
    if (src) {
      setAttemptedRecovery(false);
      setRecoveryAttempts(0);
    }
  }, [src]);

  // Enhanced error handler with improved recovery strategies
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event:", e);
    const videoElement = e.target as HTMLVideoElement;
    const errorCode = videoElement.error?.code;
    
    // Log detailed error information
    if (videoElement.error) {
      console.error("Video error code:", errorCode);
      console.error("Video error message:", videoElement.error.message);
    }
    
    // For MOV files and decoding errors, use more aggressive recovery strategies
    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      setRecoveryAttempts(prev => prev + 1);
      
      // Different recovery strategies based on error type
      if (errorCode === 3) { // MEDIA_ERR_DECODE
        console.log(`Recovery attempt ${recoveryAttempts + 1} for decode error`);
        
        // For decoding errors, try a complete reload with a slight delay
        setTimeout(() => {
          if (videoElement && videoElement.src) {
            const currentSrc = videoElement.src;
            // Clear source and metadata
            videoElement.removeAttribute('src');
            videoElement.load();
            
            // Create a new object URL if it's a blob URL (for local files)
            if (currentSrc.startsWith('blob:')) {
              // For blob URLs, we need to fetch the blob and create a new URL
              fetch(currentSrc)
                .then(response => response.blob())
                .then(blob => {
                  const newUrl = URL.createObjectURL(blob);
                  setTimeout(() => {
                    videoElement.src = newUrl;
                    videoElement.load();
                    console.log("Recreated blob URL for recovery");
                  }, 300);
                })
                .catch(err => {
                  console.error("Failed to recreate blob URL:", err);
                  // Fall back to original URL
                  setTimeout(() => {
                    videoElement.src = currentSrc;
                    videoElement.load();
                  }, 300);
                });
            } else {
              // For regular URLs, just reassign after a delay
              setTimeout(() => {
                videoElement.src = currentSrc;
                videoElement.load();
                console.log("Reloaded source for recovery");
              }, 300);
            }
          }
        }, 200);
        
        // Show a less discouraging toast message
        toast.info(
          "Video playback issue detected. Attempting to recover...",
          { duration: 2000 }
        );
        
        return;
      } else if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        // For format issues, inform but don't try to recover multiple times
        toast.error(
          "This video format might not be fully supported by your browser.",
          { duration: 4000 }
        );
        return;
      }
    }
    
    // If we've exhausted recovery attempts or it's not a recoverable error
    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      let errorMessage = "Playback issue occurred";
      
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
          errorMessage = "Playback issue occurred. Please try again.";
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
