import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/video-player/use-video-player";
import { useEnhancedPlayer } from "@/hooks/video-player/use-enhanced-player";
import PlayOverlay from "./PlayOverlay";
import BufferingIndicator from "./BufferingIndicator";
import VideoFrame from "./VideoFrame";
import VideoPlayerControls from "./VideoPlayerControls";
import { VideoPlayerProvider } from "./context/VideoPlayerContext";
import { toast } from "sonner";

interface VideoPlayerProps {
  src?: string;
  style?: React.CSSProperties;
  className?: string;
  onTimeUpdate?: (time: number) => void;
  markers?: { time: number; label: string; color?: string }[];
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(({
  src,
  className,
  onTimeUpdate,
  markers = [],
  muted,
  loop,
  showControls,
  autoPlay,
  objectFit
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, actions] = useVideoPlayer(videoRef, onTimeUpdate);
  const { isPlaying, isBuffering, hasError, errorMessage, isRecovering } = state;

  // Use the enhanced player hook to manage video readiness and pending operations
  const {
    isVideoReady,
    pendingSeek,
    setPendingSeek,
    pendingPlay,
    setPendingPlay,
    enhancedPlay,
    enhancedSeek
  } = useEnhancedPlayer(videoRef, actions, errorMessage);

  // Add new loading optimization states
  const [playbackResumePosition, setPlaybackResumePosition] = useState<number | null>(null);
  const [loadingRetryCount, setLoadingRetryCount] = useState(0);
  const MAX_LOADING_RETRIES = 3;

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    play: enhancedPlay,
    pause: actions.pause,
    seekToTime: enhancedSeek,
    getCurrentTime: actions.getCurrentTime,
    getDuration: actions.getDuration,
    getVideoElement: () => videoRef.current // Add direct access to video element for troubleshooting
  }));

  useEffect(() => {
    if (videoRef.current && src) {
      console.log("Video source changed, loading new source");
      // Reset any pending operations
      setPendingSeek(null);
      setPendingPlay(false);
      videoRef.current.load();
    }
  }, [src, setPendingSeek, setPendingPlay]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCanPlay = () => {
      console.log("Video can play event fired");
      
      if (pendingSeek !== null) {
        console.log(`Handling pending seek to ${pendingSeek}s`);
        enhancedSeek(pendingSeek);
        
        if (pendingPlay) {
          setTimeout(() => {
            console.log("Handling pending play after seek");
            enhancedPlay().catch(err => console.error("Failed to play after seek:", err));
            setPendingPlay(false);
          }, 800);
        }
      } else if (pendingPlay) {
        console.log("Handling pending play");
        enhancedPlay().catch(err => console.error("Failed to handle pending play:", err));
        setPendingPlay(false);
      }
    };
    
    // Important: Listen to both canplay and loadeddata
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    
    // Also listen to 'canplaythrough' which indicates the video can play without buffering
    video.addEventListener("canplaythrough", () => {
      console.log("Video can play through without buffering");
    });
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [pendingSeek, pendingPlay, enhancedSeek, enhancedPlay, setPendingPlay]);

  useEffect(() => {
    if (hasError && errorMessage) {
      toast.error(`Video error: ${errorMessage}`);
      console.error(`Video playback error: ${errorMessage}`);
    }
  }, [hasError, errorMessage]);

  // Add a function to handle stalled video
  const handleStalled = () => {
    console.log("Video Player: Playback stalled, attempting recovery");
    
    if (loadingRetryCount >= MAX_LOADING_RETRIES) {
      console.warn(`Video Player: Exceeded max retry attempts (${MAX_LOADING_RETRIES})`);
      toast.error("Video playback failed. The network connection may be unstable.");
      return;
    }
    
    // Store current position before reloading
    if (videoRef.current) {
      setPlaybackResumePosition(videoRef.current.currentTime);
    }
    
    // Increment retry counter
    setLoadingRetryCount(prev => prev + 1);
    
    // Force reload with a cache buster
    if (videoRef.current && src) {
      try {
        const url = new URL(src);
        url.searchParams.set('_ts', Date.now().toString());
        videoRef.current.src = url.toString();
        videoRef.current.load();
      } catch (e) {
        console.error("Error reloading video:", e);
      }
    }
  };

  // Add effect to resume playback after recovery
  useEffect(() => {
    if (playbackResumePosition !== null && videoRef.current) {
      const handleCanPlay = () => {
        if (videoRef.current && playbackResumePosition !== null) {
          console.log(`Video Player: Resuming from position ${playbackResumePosition.toFixed(2)}`);
          videoRef.current.currentTime = playbackResumePosition;
          videoRef.current.play().catch(e => console.warn("Failed to auto-resume:", e));
          setPlaybackResumePosition(null);
        }
      };
      
      videoRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
    }
  }, [playbackResumePosition]);

  // Reset retry count when source changes
  useEffect(() => {
    setLoadingRetryCount(0);
    setPlaybackResumePosition(null);
    console.log("Video source changed, loading new source");
    
    // When source changes, completely reset the video element
    if (videoRef.current) {
      try {
        // Reset all potential error states
        videoRef.current.pause();
        videoRef.current.removeAttribute('src'); // Completely remove src
        videoRef.current.load(); // Force reload of video element
        
        // Clear all dataset attributes that might contain stale state
        if (videoRef.current.dataset) {
          delete videoRef.current.dataset.lastSeekTime;
          delete videoRef.current.dataset.rapidSeekCount;
        }
        
        // Use clean URL for new source
        if (src) {
          // Remove any cache-busting parameters from URL
          try {
            const url = new URL(src);
            // Remove common cache-busting params
            url.searchParams.delete('_ts');
            url.searchParams.delete('_cb');
            url.searchParams.delete('_nocache');
            videoRef.current.src = url.toString();
          } catch (e) {
            // If URL parsing fails, just use src directly
            videoRef.current.src = src;
          }
          
          // Set initial video properties for best playback
          videoRef.current.preload = 'auto';
        }
      } catch (e) {
        console.error("Error resetting video element:", e);
      }
    }
  }, [src]);

  // Add optimized video load event handling
  const handleVideoLoadStart = () => {
    console.log("Video Player: Loading started");
    
    // Apply optimizations for MP4/WebM formats on loading
    if (videoRef.current) {
      // Apply different strategies based on format
      if (src?.includes('.webm')) {
        console.log("WebM format detected - optimizing for streaming");
        
        // WebM works better with these settings
        videoRef.current.preload = "auto";
        // For WebM, we want to avoid metadata mode to get better streaming
        try {
          // Set a reasonable playback buffer (in seconds)
          if ('buffered' in videoRef.current) {
            // @ts-ignore - experimental property
            videoRef.current.autobuffer = true;
          }
        } catch (e) {
          console.log("Failed to set experimental buffer properties");
        }
      } else if (src?.includes('.mp4')) {
        console.log("MP4 format detected - optimizing for progressive download");
        
        // MP4s often need more buffering
        videoRef.current.preload = "auto";
      }
      
      // Reset any error state by resetting the video
      if (videoRef.current.error) {
        console.log("Clearing previous video errors");
        videoRef.current.load();
      }
    }
  };

  // Add enhanced buffering and fix for infinite loop issues
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    // Check if we're near the end of a buffer segment
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      // Get current time and buffer end position
      const currentTime = videoRef.current.currentTime;
      
      // Check each buffer range
      for (let i = 0; i < buffered.length; i++) {
        // If we're in this buffer range
        if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
          // Check if we're too close to the buffer end (within 0.5 seconds)
          const bufferEndTime = buffered.end(i);
          const timeUntilBufferEnd = bufferEndTime - currentTime;
          
          // If less than 0.5 seconds of buffered content remains
          if (timeUntilBufferEnd < 0.5) {
            // Don't pause if we're near the end of the video
            const remainingVideoTime = videoRef.current.duration - currentTime;
            if (remainingVideoTime > 2 && isPlaying) {
              console.log("VideoPlayer: Pausing to buffer more content");
              // Temporarily pause to allow more buffering
              actions.pause();
              
              // Resume playback after allowing time to buffer
              setTimeout(() => {
                if (videoRef.current && !videoRef.current.paused) return; // already playing
                console.log("VideoPlayer: Resuming after buffering");
                actions.play();
              }, 750); // 750ms pause to buffer
            }
          }
          break;
        }
      }
    }
  };

  // Add function to detect and fix infinite loop issues
  const handleSeeking = () => {
    if (!videoRef.current) return;
    
    // Get current playback state
    const video = videoRef.current;
    const currentTime = video.currentTime;
    
    // Store the last seeking time to detect rapid seeking (infinite loop symptom)
    const now = Date.now();
    const lastSeekTime = video.dataset.lastSeekTime ? parseInt(video.dataset.lastSeekTime) : 0;
    const timeSinceLastSeek = now - lastSeekTime;
    
    // Update last seek time
    video.dataset.lastSeekTime = now.toString();
    
    // If we're seeking too frequently (less than 250ms apart), we might be in an infinite loop
    if (timeSinceLastSeek < 250) {
      // Increment rapid seek counter
      const rapidSeekCount = video.dataset.rapidSeekCount ? 
        parseInt(video.dataset.rapidSeekCount) + 1 : 1;
      video.dataset.rapidSeekCount = rapidSeekCount.toString();
      
      // If we detect several rapid seeks in succession, take action
      if (rapidSeekCount > 5) {
        console.warn("VideoPlayer: Possible infinite seek loop detected, applying fix");
        
        // Reset counter
        video.dataset.rapidSeekCount = "0";
        
        // Force pausing and reset
        actions.pause();
        
        // Wait a bit then try resuming at a safer position
        setTimeout(() => {
          if (videoRef.current) {
            // Move slightly forward from current position to break loop
            const newPosition = currentTime + 1.0; // Move forward 1 second to break the loop
            videoRef.current.currentTime = Math.min(newPosition, videoRef.current.duration - 0.1);
            
            // Hold playback for longer on infinite loop detection
            setTimeout(() => {
              if (videoRef.current && videoRef.current.paused) {
                console.log("Resuming playback after infinite loop fix");
                actions.play();
              }
            }, 1000); // Longer delay (1s) to better handle infinite loops
          }
        }, 500);
      }
    } else {
      // Reset rapid seek counter if seeks are spaced out
      video.dataset.rapidSeekCount = "0";
    }
  };

  const contextValue = {
    state,
    actions,
    isVideoReady,
    pendingPlay,
    setPendingPlay,
    pendingSeek,
    setPendingSeek,
    enhancedPlay,
    enhancedSeek
  };

  return (
    <VideoPlayerProvider {...contextValue}>
      <div 
        id="video-container"
        className={cn(
          "video-player-container rounded-xl overflow-hidden bg-black relative group",
          className
        )}
      >
        <VideoFrame
          ref={videoRef}
          src={src || ""}
          muted={muted}
          loop={loop}
          controls={showControls}
          autoPlay={autoPlay}
          onClick={actions.togglePlay}
          onLoadStart={handleVideoLoadStart}
          onStalled={handleStalled}
          onError={() => {
            console.error("Video Player: Error loading video");
            toast.error("Error loading video");
          }}
          onPlay={() => actions.play()}
          onPause={() => actions.pause()}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          style={{ width: "100%", height: "100%", objectFit: objectFit }}
        />
        <BufferingIndicator 
          isBuffering={isBuffering} 
          hasError={hasError} 
          errorMessage={errorMessage} 
          isRecovering={isRecovering}
        />
        <VideoPlayerControls markers={markers} />
        <PlayOverlay isVisible={!isPlaying && !isBuffering && !hasError && !isRecovering} onClick={actions.togglePlay} />
      </div>
    </VideoPlayerProvider>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
