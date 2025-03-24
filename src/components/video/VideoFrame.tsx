
import React, { forwardRef } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';

interface VideoFrameProps {
  src?: string;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({ src }, ref) => {
  const { actions } = useVideoPlayerContext();
  const { togglePlay } = actions;

  return (
    <video
      ref={ref}
      className="w-full h-full object-contain"
      onClick={togglePlay}
      src={src}
      preload="auto"
      playsInline
    >
      Your browser doesn't support HTML5 video.
    </video>
  );
});

VideoFrame.displayName = "VideoFrame";

export default VideoFrame;
