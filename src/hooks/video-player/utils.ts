
/**
 * Clamp a time value between 0 and a maximum duration
 */
export const clampTime = (time: number, duration: number): number => {
  return Math.max(0, Math.min(time, duration || 0));
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Check if video element is ready to play
 */
export const isVideoReady = (video: HTMLVideoElement | null): boolean => {
  if (!video) return false;
  
  // More thorough check for video readiness
  try {
    return video.readyState >= 3 && 
           !isNaN(video.duration) && 
           video.duration > 0 &&
           video.src !== '';
  } catch (e) {
    console.error("Error checking video readiness:", e);
    return false;
  }
};

/**
 * Log video player errors with context
 */
export const logVideoError = (error: unknown, context: string): void => {
  console.error(`Video player error (${context}):`, error);
};

/**
 * Wait for video to be ready for playback
 */
export const waitForVideoReadiness = async (video: HTMLVideoElement | null, timeout = 5000): Promise<boolean> => {
  if (!video || !video.src) return false;
  
  return new Promise(resolve => {
    if (isVideoReady(video)) {
      resolve(true);
      return;
    }
    
    const checkInterval = 100; // ms
    let elapsed = 0;
    
    const readyCheck = setInterval(() => {
      elapsed += checkInterval;
      
      if (isVideoReady(video)) {
        clearInterval(readyCheck);
        resolve(true);
      } else if (elapsed >= timeout) {
        clearInterval(readyCheck);
        console.warn("Video readiness check timed out");
        resolve(false);
      }
    }, checkInterval);
    
    // Also check on common video events
    const handleReady = () => {
      clearInterval(readyCheck);
      resolve(true);
    };
    
    video.addEventListener('canplaythrough', handleReady, { once: true });
    video.addEventListener('loadeddata', handleReady, { once: true });
    
    // Clean up event listeners if timeout is reached
    setTimeout(() => {
      video.removeEventListener('canplaythrough', handleReady);
      video.removeEventListener('loadeddata', handleReady);
    }, timeout);
  });
};
