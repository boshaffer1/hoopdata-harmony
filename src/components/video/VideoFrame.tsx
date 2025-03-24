
import React, { forwardRef, useState } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';

interface VideoFrameProps {
  src?: string;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({ src }, ref) => {
  const { actions, state } = useVideoPlayerContext();
  const { togglePlay } = actions;
  const [attemptedRecovery, setAttemptedRecovery] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event:", e);
    const videoElement = e.target as HTMLVideoElement;
    
    // Try to recover from common issues if we haven't tried yet
    if (!attemptedRecovery && videoElement) {
      setAttemptedRecovery(true);
      
      // Sometimes reloading the video can help with decoding errors
      setTimeout(() => {
        if (videoElement.src) {
          console.log("Attempting video recovery by reloading source");
          const currentSrc = videoElement.src;
          videoElement.src = "";
          setTimeout(() => {
            videoElement.src = currentSrc;
            videoElement.load();
          }, 200);
        }
      }, 300);
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
