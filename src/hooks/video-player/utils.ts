
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

/**
 * Get human-readable video error message
 */
export const getVideoErrorMessage = (errorCode?: number): string => {
  switch (errorCode) {
    case 1: // MEDIA_ERR_ABORTED
      return "Playback interrupted";
    case 2: // MEDIA_ERR_NETWORK
      return "Network issue while loading the video";
    case 3: // MEDIA_ERR_DECODE
      return "Audio or video decoding error. Try a different format like WebM.";
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return "This video format is not supported by your browser. Try converting to WebM.";
    default:
      return "Playback issue detected. Trying an alternative format like WebM may help.";
  }
};

/**
 * Check if browser supports a specific video format
 */
export const isSupportedVideoFormat = (format: string): boolean => {
  const video = document.createElement('video');
  const canPlay = video.canPlayType(format);
  return canPlay !== "";
};

/**
 * Get a list of supported video formats in the current browser
 */
export const getSupportedFormats = (): string[] => {
  const video = document.createElement('video');
  const formats = [
    { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', name: 'MP4 (H.264)' },
    { type: 'video/webm; codecs="vp8, vorbis"', name: 'WebM (VP8)' },
    { type: 'video/webm; codecs="vp9"', name: 'WebM (VP9)' },
    { type: 'video/ogg; codecs="theora"', name: 'Ogg Theora' },
    { type: 'video/mp4; codecs="hvc1"', name: 'MP4 (HEVC/H.265)' },
    { type: 'video/mp4; codecs="av01"', name: 'MP4 (AV1)' },
    { type: 'video/quicktime', name: 'MOV (QuickTime)' }
  ];
  
  return formats
    .filter(format => video.canPlayType(format.type) !== "")
    .map(format => format.name);
};

/**
 * Detect the video format from its file extension or blob type
 */
export const detectVideoFormat = (src?: string): string | null => {
  if (!src) return null;
  
  // If it's a blob URL, try to infer from the original filename if available
  if (src.startsWith('blob:')) {
    console.log("Blob URL detected, format cannot be determined from URL");
    return null;
  }
  
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
    case 'ogv':
      return 'video/ogg';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'wmv':
      return 'video/x-ms-wmv';
    case 'flv':
      return 'video/x-flv';
    case '3gp':
      return 'video/3gpp';
    default:
      return null;
  }
};

/**
 * Attempt to recover from video playback errors
 */
export const attemptVideoRecovery = async (
  videoElement: HTMLVideoElement, 
  errorCode?: number
): Promise<boolean> => {
  // No video element to recover
  if (!videoElement) return false;
  
  // For all errors, log browser capabilities
  console.log("Browser video format support:", getSupportedFormats());
  
  // For decoding errors (common with certain codecs)
  if (errorCode === 3) {
    console.log("Attempting recovery for decoding error");
    
    // Try disabling the audio track first (fixes most audio render errors)
    try {
      videoElement.muted = true;
      console.log("Muted video as recovery attempt for audio render error");
      
      // Try to reload the video
      videoElement.load();
      return true;
    } catch (e) {
      console.error("Recovery attempt failed:", e);
    }
  }
  
  // For general errors, try a basic reload
  try {
    videoElement.load();
    return true;
  } catch (e) {
    console.error("General recovery attempt failed:", e);
  }
  
  return false;
};
