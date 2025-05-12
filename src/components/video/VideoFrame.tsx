import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import { useVideoPlayerContext } from './context/VideoPlayerContext';
import { toast } from 'sonner';
import { attemptVideoRecovery, detectVideoFormat } from '@/hooks/video-player/utils';

interface VideoFrameProps {
  src?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onClick?: React.MouseEventHandler<HTMLVideoElement>;
  onProgress?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, ProgressEvent>>;
  onLoadedMetadata?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onLoadStart?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onWaiting?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onStalled?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onError?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onPause?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onPlay?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onTimeUpdate?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
  onSeeking?: React.EventHandler<React.SyntheticEvent<HTMLVideoElement, Event>>;
}

const VideoFrame = forwardRef<HTMLVideoElement, VideoFrameProps>(({
  src,
  style,
  autoPlay = false,
  controls,
  muted = false,
  loop = false,
  onClick,
  onProgress,
  onLoadedMetadata,
  onLoadStart,
  onWaiting,
  onStalled,
  onError,
  onPause,
  onPlay,
  onTimeUpdate,
  onSeeking,
  ...props
}, ref) => {
  const { actions, state } = useVideoPlayerContext();
  const { togglePlay } = actions;
  const { isRecovering } = state;
  const [attemptedRecovery, setAttemptedRecovery] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const MAX_RECOVERY_ATTEMPTS = 3;
  const videoRef = ref as React.RefObject<HTMLVideoElement>;
  
  // Track the current source to avoid race conditions
  const currentSourceRef = useRef<string>('');
  // Track ongoing playback attempts to avoid multiple simultaneous attempts
  const playbackAttemptInProgressRef = useRef<boolean>(false);
  // Indicates if video has started playing at least once
  const hasPlayedOnceRef = useRef<boolean>(false);

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      // Store the current source
      currentSourceRef.current = src;
      setAttemptedRecovery(false);
      setRecoveryAttempts(0);
      playbackAttemptInProgressRef.current = false;
      hasPlayedOnceRef.current = false;
      
      // Log the source URL (truncated for security)
      console.log(`Loading video source: ${src?.substring(0, 60)}...`);
      
      // Format detection and logging
      const format = detectVideoFormat(src);
      console.log(`Video format detected: ${format || 'unknown'}`);
      
      if (format) {
        console.log(`Video format support level: ${document.createElement('video').canPlayType(format)}`);
      }
    }
    
    return () => {
      // Clean up on unmount or when src changes
      playbackAttemptInProgressRef.current = false;
    };
  }, [src]);

  // Simplified helper to safely attempt playback
  const attemptPlayback = useCallback((source: string, eventName: string) => {
    // Skip if we don't have a video element, source doesn't match, or if another attempt is already in progress
    if (!videoRef.current || 
        videoRef.current.src !== source || 
        source !== currentSourceRef.current ||
        playbackAttemptInProgressRef.current) {
      console.log(`Skipping ${eventName} play attempt - conditions not met`);
      return;
    }
    
    // Mark that we're attempting playback
    playbackAttemptInProgressRef.current = true;
    
    console.log(`Attempting playback from ${eventName} event`);
    const playPromise = videoRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`Playback successful from ${eventName}`);
          hasPlayedOnceRef.current = true;
          playbackAttemptInProgressRef.current = false;
        })
        .catch(err => {
          playbackAttemptInProgressRef.current = false;
          
          if (err.name === 'AbortError') {
            console.log(`${eventName} playback attempt aborted - likely due to source change`);
          } else if (err.name === 'NotAllowedError') {
            console.warn(`${eventName} playback blocked by browser - user interaction required`);
          } else {
            console.error(`${eventName} playback failed:`, err);
          }
        });
    } else {
      playbackAttemptInProgressRef.current = false;
    }
  }, []);

  // Update prewarm connection logic with a better approach
  const prewarmConnection = (url: string) => {
    if (!url) return;

    console.log("Pre-warming video connection");
    
    try {
      // Use Range requests 
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Request first 16KB to warm up connection
      fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-16383'
        },
        signal,
        mode: 'cors',
        credentials: 'same-origin'
      })
      .then(response => {
        clearTimeout(timeoutId);
        console.log(`Connection pre-warmed for ${url.substring(0, 30)}...`);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.warn("Pre-warm fetch error:", err.message);
        }
      });
    } catch (err) {
      console.warn("Error setting up pre-warm:", err);
    }
  };

  // Enhanced error handler with better recovery
  const handleError = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video element error event triggered");
    const videoElement = e.target as HTMLVideoElement;
    
    // Check if this is still the current source
    if (videoElement.src !== currentSourceRef.current) {
      console.log("Error on outdated source, ignoring");
      return;
    }
    
    // Log detailed error information
    if (videoElement.error) {
      console.error("Video error code:", videoElement.error.code);
      console.error("Video error message:", videoElement.error.message);
      
      // Format check for better error information
      const sourcePath = src || '';
      const fileExt = sourcePath.split('.').pop()?.toLowerCase();
      
      // MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) indicates a format error
      // This is often due to codec issues
      if (videoElement.error.code === 4) {
        // Try to find a WebM version of the file by replacing the extension
        if (fileExt === 'mp4' || fileExt === 'mov') {
          const webmUrl = sourcePath.replace(/\.(mp4|mov)$/i, '.webm');
          console.log(`Detected format error, trying to find WebM version: ${webmUrl}`);
          
          try {
            // See if WebM version exists
            const response = await fetch(webmUrl, { 
              method: 'HEAD',
              mode: 'cors',
              credentials: 'omit'
            });
            
            if (response.ok) {
              console.log("Found WebM version, switching to it");
              videoElement.src = webmUrl;
              videoElement.load();
              
              toast.info("Switching to WebM format for better compatibility", {
                duration: 3000,
              });
              
              // Reset error state since we're trying a new source
              setAttemptedRecovery(false);
              setRecoveryAttempts(0);
              return;
            }
          } catch (e) {
            console.log("No WebM version available");
          }
        }
        
        toast.error("This video format may not be supported by your browser", {
          description: "Try converting the video to WebM format for better compatibility",
          duration: 5000,
        });
        
        // For format errors, suggest conversion
        if (!attemptedRecovery) {
          setAttemptedRecovery(true);
          
          // Don't attempt playback, but suggest conversion
          console.log("Format error detected, suggesting conversion");
          return;
        }
      } else if (fileExt === 'mov') {
        toast.error("MOV files have limited browser compatibility", {
          description: "Try converting to WebM format",
          duration: 5000,
        });
        return;
      } else {
        toast.error(`Video playback error`, {
          description: "Attempting recovery...",
          duration: 3000,
        });
      }
    }
    
    // Only attempt recovery if we haven't exceeded the limit
    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      setRecoveryAttempts(prev => prev + 1);
      
      // Basic recovery approach
      setTimeout(() => {
        if (videoElement && 
            videoElement.src === currentSourceRef.current && 
            !playbackAttemptInProgressRef.current) {
          console.log(`Recovery attempt ${recoveryAttempts + 1}/${MAX_RECOVERY_ATTEMPTS}`);
          
          try {
            // Reset and reload with cache busting
            videoElement.pause();
            
            // For network errors, try adding a cache-busting parameter
            if (videoElement.error?.code === 2) {
              try {
                const url = new URL(videoElement.src);
                url.searchParams.set('_nocache', Date.now().toString());
                videoElement.src = url.toString();
              } catch (e) {
                // If URL parsing fails, just use the original src
                videoElement.currentTime = 0;
              }
            } else {
              videoElement.currentTime = 0;
            }
            
            videoElement.load();
            
            // Attempt playback after a short delay
            setTimeout(() => {
              attemptPlayback(videoElement.src, 'recovery');
            }, 500);
          } catch (err) {
            console.error("Error during recovery:", err);
          }
        }
      }, 1000);
    } else {
      toast.error("Unable to recover video playback", {
        description: "Try converting to WebM format or refresh the page",
        duration: 5000
      });
    }
    
    // Forward the error event
    onError?.(e);
  };

  // Load video and set up a single source of truth for playback
  useEffect(() => {
    if (!videoRef.current || !src) return;
    
    // Store the current source
    const currentSource = src;
    currentSourceRef.current = currentSource;
    
    // Reset playing state
    hasPlayedOnceRef.current = false;
    playbackAttemptInProgressRef.current = false;
    
    // Set the source directly
    videoRef.current.src = currentSource;
    
    // Pre-warm the connection for remote videos
    if (currentSource.includes('http')) {
      prewarmConnection(currentSource);
    }
    
    // Set up a single timeout to check if playback has started
    const playbackCheckTimeout = setTimeout(() => {
      // Only proceed if this is still the current source
      if (videoRef.current && 
          videoRef.current.src === currentSource && 
          currentSource === currentSourceRef.current &&
          !hasPlayedOnceRef.current && 
          !playbackAttemptInProgressRef.current) {
        
        console.log("Playback hasn't started - attempting to start it");
        attemptPlayback(currentSource, 'timeout');
      }
    }, 5000); // 5 second timeout
    
    return () => {
      clearTimeout(playbackCheckTimeout);
    };
  }, [src, attemptPlayback]);

  // Simplified handlers for video events
  const handleLoadStart = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log(`Video load started: ${src?.substring(0, 60)}`);
    onLoadStart?.(e);
  }, [src, onLoadStart]);

  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.target as HTMLVideoElement;
    console.log("Video metadata loaded:", videoElement.src.substring(0, 60));
    console.log("Video duration:", videoElement.duration);
    
    // Reset recovery attempts when metadata loads successfully
    if (recoveryAttempts > 0) {
      setRecoveryAttempts(0);
    }
    
    // If this is still the current source and autoplay is desired, attempt playback
    if (autoPlay && 
        videoElement.src === currentSourceRef.current && 
        !hasPlayedOnceRef.current &&
        !playbackAttemptInProgressRef.current) {
      attemptPlayback(videoElement.src, 'loadedmetadata');
    }
    
    // Call the original handler
    onLoadedMetadata?.(e);
  }, [autoPlay, recoveryAttempts, attemptPlayback, onLoadedMetadata]);

  const handleCanPlay = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.target as HTMLVideoElement;
    console.log("Video can play");
    
    // If this is still the current source and hasn't played yet, attempt playback
    if (autoPlay && 
        videoElement.src === currentSourceRef.current && 
        !hasPlayedOnceRef.current &&
        !playbackAttemptInProgressRef.current) {
      attemptPlayback(videoElement.src, 'canplay');
    }
  }, [autoPlay, attemptPlayback]);

  const handleWaiting = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log("Video is waiting for data");
    onWaiting?.(e);
  }, [onWaiting]);

  const handleStalled = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log("Video playback stalled");
    onStalled?.(e);
  }, [onStalled]);

  return (
    <div className="video-frame relative w-full h-full">
      <video
        ref={ref}
        className="w-full h-full"
        src={src}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline={true}
        style={style}
        onTimeUpdate={onTimeUpdate}
        onSeeking={onSeeking}
        onClick={togglePlay}
        onProgress={onProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onWaiting={handleWaiting}
        onStalled={handleStalled}
        onError={handleError}
        onPause={onPause}
        onPlay={onPlay}
        {...props}
      />
      {isRecovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="text-white text-center">
            <div className="mb-2">Attempting to recover video...</div>
            <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
});

VideoFrame.displayName = "VideoFrame";

export default VideoFrame;
