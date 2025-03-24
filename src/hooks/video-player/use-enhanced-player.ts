
import { useState, useRef, RefObject } from 'react';
import { VideoPlayerActions } from './types';
import { toast } from 'sonner';

/**
 * Hook that provides enhanced play and seek functionality for the video player
 */
export function useEnhancedPlayer(
  videoRef: RefObject<HTMLVideoElement>,
  actions: VideoPlayerActions,
  errorMessage: string | null
) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [lastSeekTime, setLastSeekTime] = useState(0);

  const enhancedPlay = async () => {
    console.log("Play method called on video player");
    if (!videoRef.current?.src) {
      console.warn("Attempted to play video but no source is set");
      toast.warning("No video source available");
      return Promise.reject(new Error("No video source"));
    }
    
    if (!isVideoReady) {
      console.log("Video not ready yet, setting pending play flag");
      setPendingPlay(true);
      return Promise.resolve();
    }
    
    try {
      if (videoRef.current) {
        console.log("Current time before play:", videoRef.current.currentTime);
      }
      
      // Directly use the video element for more reliable playback
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Native video.play() succeeded");
          return Promise.resolve();
        } else {
          // For older browsers that don't return a promise
          console.log("Browser didn't return a play promise, falling back");
        }
      } catch (err) {
        console.error("Native video.play() failed:", err);
      }
      
      // Fall back to our play implementation
      const playResult = actions.play();
      // Ensure we're always returning a Promise
      if (playResult instanceof Promise) {
        return playResult
          .then(() => {
            console.log("Play promise resolved successfully");
            return Promise.resolve();
          })
          .catch(error => {
            console.error("Error playing video:", error);
            if (error.name === "NotAllowedError") {
              toast.error("Playback was blocked by the browser. Try again or click directly on the video.");
            } else if (errorMessage) {
              toast.error(`Failed to play video: ${errorMessage}`);
            } else {
              toast.error("Failed to play video");
            }
            throw error;
          });
      } else {
        // If play() returned void, we need to return a resolved promise
        console.log("Play method did not return a Promise");
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Exception playing video:", error);
      return Promise.reject(error);
    }
  };
  
  const enhancedSeek = (time: number) => {
    console.log(`Seeking to time: ${time}s`);
    if (!videoRef.current) {
      console.warn("Video element not available for seeking");
      return Promise.reject(new Error("Video element not available"));
    }
    
    // To avoid repeated seeks to the same timestamp
    if (Math.abs(lastSeekTime - time) < 0.1) {
      console.log("Ignoring repeated seek to the same position");
      return Promise.resolve();
    }
    
    setLastSeekTime(time);
    
    if (!isVideoReady) {
      console.log("Video not ready yet, setting pending seek time:", time);
      setPendingSeek(time);
      return Promise.resolve();
    }
    
    try {
      // Directly update the video element currentTime for more reliable seeking
      videoRef.current.currentTime = time;
      console.log(`Set currentTime directly to ${time}s, now at:`, videoRef.current.currentTime);
      
      // Also update our internal state
      actions.seekToTime(time);
      return Promise.resolve();
    } catch (error) {
      console.error("Error seeking to time:", error);
      return Promise.reject(error);
    }
  };

  return {
    isVideoReady,
    setIsVideoReady,
    pendingSeek,
    setPendingSeek,
    pendingPlay,
    setPendingPlay,
    lastSeekTime,
    setLastSeekTime,
    enhancedPlay,
    enhancedSeek
  };
}
