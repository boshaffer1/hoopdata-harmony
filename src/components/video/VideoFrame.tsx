
import React, { forwardRef, useState, useEffect } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';
import { toast } from 'sonner';
import { getSupportedFormats } from '@/hooks/video-player/utils';

interface VideoFrameProps {
  src?: string;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({ src }, ref) => {
  const { actions, state } = useVideoPlayerContext();
  const { togglePlay } = actions;
  const [attemptedRecovery, setAttemptedRecovery] = useState(false);
  const [formatSupportChecked, setFormatSupportChecked] = useState(false);

  // Check format support when source changes
  useEffect(() => {
    if (src && !formatSupportChecked) {
      checkFormatSupport(src);
    }
  }, [src, formatSupportChecked]);
  
  // Check if the browser supports the video format
  const checkFormatSupport = (videoSrc: string) => {
    const video = document.createElement('video');
    
    // Test for common formats
    const formatTests = [
      { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', format: 'MP4 (H.264)' },
      { type: 'video/webm; codecs="vp8, vorbis"', format: 'WebM (VP8)' },
      { type: 'video/webm; codecs="vp9"', format: 'WebM (VP9)' },
      { type: 'video/ogg; codecs="theora"', format: 'Ogg Theora' },
      { type: 'video/quicktime', format: 'MOV (QuickTime)' }
    ];
    
    // Get file extension
    const fileExtension = videoSrc.split('.').pop()?.toLowerCase();
    
    console.log(`Checking support for video with extension: ${fileExtension}`);
    
    let supportedFormats: string[] = [];
    formatTests.forEach(test => {
      if (video.canPlayType(test.type)) {
        supportedFormats.push(test.format);
      }
    });
    
    console.log("Supported video formats:", supportedFormats);
    
    // Special handling for MOV files
    if (fileExtension === 'mov') {
      const movSupport = video.canPlayType('video/quicktime');
      console.log("MOV format support level:", movSupport);
      
      if (!movSupport || movSupport === 'no' || movSupport === '') {
        toast.warning("Your browser has limited support for MOV files. If playback fails, try converting to MP4.");
      }
    }
    
    if (supportedFormats.length === 0) {
      toast.error("Your browser doesn't support common video formats");
    }
    
    setFormatSupportChecked(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event:", e);
    const videoElement = e.target as HTMLVideoElement;
    const errorCode = videoElement.error?.code;
    
    // Get file extension from src
    const fileExtension = src?.split('.').pop()?.toLowerCase();
    
    // Log detailed error information
    if (videoElement.error) {
      console.error("Video error code:", errorCode);
      console.error("Video error message:", videoElement.error.message);
      console.error("File extension:", fileExtension);
    }
    
    // Special handling for MOV files
    if (fileExtension === 'mov' && errorCode === 4) {
      toast.error(
        "This MOV file format isn't supported by your browser. Try converting to MP4 using a converter tool.",
        { duration: 6000 }
      );
      return;
    }
    
    // Handle format not supported error (MEDIA_ERR_SRC_NOT_SUPPORTED = 4)
    if (errorCode === 4) {
      toast.error("This video format is not supported by your browser. Try converting to MP4 (H.264).");
      return;
    }
    
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
