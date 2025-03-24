
import React, { forwardRef, useState, useEffect } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';
import { toast } from 'sonner';
import { attemptVideoRecovery, detectVideoFormat } from '@/hooks/video-player/utils';

interface VideoFrameProps {
  src?: string;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({ src }, ref) => {
  const { actions, state } = useVideoPlayerContext();
  const { togglePlay } = actions;
  const { isRecovering } = state;
  const [attemptedRecovery, setAttemptedRecovery] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const MAX_RECOVERY_ATTEMPTS = 3;

  // Reset recovery attempts when src changes
  useEffect(() => {
    if (src) {
      setAttemptedRecovery(false);
      setRecoveryAttempts(0);
      
      // Check if this is a MOV file
      const isMovFile = src.toLowerCase().endsWith('.mov') || 
                        (detectVideoFormat(src) === 'video/quicktime');
      
      if (isMovFile) {
        // For MOV files, provide helpful information
        console.log("MOV file detected, may require special handling");
      }
    }
  }, [src]);

  // Enhanced error handler with improved recovery strategies
  const handleError = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
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
      
      // Apply recovery strategy
      const recovered = await attemptVideoRecovery(videoElement, errorCode);
      
      if (recovered) {
        setAttemptedRecovery(true);
        // Toast notification for recovery
        if (recoveryAttempts === 0) {
          toast.info(
            "Video playback issue detected. Attempting to recover...",
            { duration: 2000 }
          );
        }
        return;
      }

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
        if (!isRecovering) {
          toast.info(
            "Video playback issue detected. Attempting to recover...",
            { duration: 2000 }
          );
        }
        
        return;
      } else if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        // For format issues with MOV files, try a different approach
        const isMovFile = src?.toLowerCase().endsWith('.mov');
        
        if (isMovFile && recoveryAttempts === 1) {
          console.log("Trying alternate MOV recovery approach");
          
          if (videoElement) {
            // For MOV files, sometimes a complete pause and restart helps
            videoElement.pause();
            
            // Clean up first
            videoElement.removeAttribute('src');
            videoElement.load();
            
            // Reapply source
            setTimeout(() => {
              if (src && videoElement) {
                videoElement.src = src;
                videoElement.load();
              }
            }, 300);
          }
          
          return;
        }
        
        // Generic format issue message
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
          errorMessage = "Video format issue. This format may not be fully supported.";
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
