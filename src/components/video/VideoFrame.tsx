
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
  const [isMutedForRecovery, setIsMutedForRecovery] = useState(false);
  const MAX_RECOVERY_ATTEMPTS = 3;

  // Reset recovery attempts when src changes
  useEffect(() => {
    if (src) {
      setAttemptedRecovery(false);
      setRecoveryAttempts(0);
      setIsMutedForRecovery(false);
      
      // Check if this is a MOV file or MP4
      const format = detectVideoFormat(src);
      console.log(`Video format detected: ${format || 'unknown'}`);
      
      if (format) {
        console.log(`Video format support level: ${document.createElement('video').canPlayType(format)}`);
      }
    }
  }, [src]);

  // Enhanced error handler with improved recovery strategies
  const handleError = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event:", e);
    const videoElement = e.target as HTMLVideoElement;
    
    // Log detailed error information
    if (videoElement.error) {
      console.error("Video error code:", videoElement.error.code);
      console.error("Video error message:", videoElement.error.message);
    }
    
    // Check for specific audio render errors
    const errorMessage = videoElement.error?.message || '';
    const isAudioRenderError = errorMessage.includes('AUDIO_RENDERER_ERROR') || 
                              errorMessage.toLowerCase().includes('audio render');
    
    // For format issues, try a more specific approach
    if (videoElement.error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
      toast.error(
        "This video format might not be supported by your browser. Try converting to a more widely supported format like WebM.",
        { duration: 5000 }
      );
      
      console.log("Supported video formats in this browser:", 
        ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
          .map(format => `${format}: ${document.createElement('video').canPlayType(format)}`)
          .join(", ")
      );
      
      return;
    }
    
    // For audio render errors, mute the video as a recovery strategy
    if (isAudioRenderError && !isMutedForRecovery) {
      videoElement.muted = true;
      setIsMutedForRecovery(true);
      
      toast.info(
        "Audio issue detected. Video has been muted to allow playback.",
        { duration: 3000 }
      );
      
      // Try to reload the video
      setTimeout(() => {
        videoElement.load();
      }, 100);
      
      return;
    }
    
    // For other errors, attempt recovery if not too many attempts
    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      setRecoveryAttempts(prev => prev + 1);
      
      // Apply recovery strategy
      const recovered = await attemptVideoRecovery(videoElement, videoElement.error?.code);
      
      if (recovered) {
        setAttemptedRecovery(true);
        toast.info(
          "Attempting to recover video playback...",
          { duration: 2000 }
        );
        return;
      }
      
      // If not recovered and still within retry limits
      if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS - 1) {
        toast.info(
          `Retry attempt ${recoveryAttempts + 1}/${MAX_RECOVERY_ATTEMPTS}`,
          { duration: 2000 }
        );
        
        // Force reload
        setTimeout(() => {
          if (src && videoElement) {
            videoElement.load();
          }
        }, 500);
      }
    } else {
      // Final error message after all attempts
      toast.error(
        "We're having trouble playing this video. Please try a different video file or convert to WebM format for better compatibility.",
        { duration: 5000 }
      );
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
