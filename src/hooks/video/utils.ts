
/**
 * Video player utility functions
 */

/**
 * Format time in seconds to MM:SS format
 * @param timeInSeconds - Time in seconds to format
 */
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Clamp a time value between 0 and a maximum duration
 * @param time - Time to clamp
 * @param duration - Maximum duration
 */
export const clampTime = (time: number, duration: number): number => {
  return Math.max(0, Math.min(time, duration || 0));
};

/**
 * Log video player errors with additional context
 * @param error - The error that occurred
 * @param context - Additional context about where the error occurred
 */
export const logVideoError = (error: unknown, context: string): void => {
  console.error(`Video player error (${context}):`, error);
};

/**
 * Create a promise wrapper for video play action with proper error handling
 * @param video - HTMLVideoElement reference
 * @param onSuccess - Callback when play is successful
 * @param onError - Callback when play fails
 */
export const safePlayVideo = (
  video: HTMLVideoElement | null,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
): Promise<void> => {
  if (!video) {
    const error = new Error("No video element available");
    onError?.(error);
    return Promise.reject(error);
  }

  try {
    const playPromise = video.play();
    
    // Some browsers return a promise, others don't
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          onSuccess?.();
        })
        .catch((error) => {
          onError?.(error);
          throw error;
        });
    } else {
      // For browsers that don't return a promise
      onSuccess?.();
      return Promise.resolve();
    }
  } catch (error) {
    onError?.(error);
    return Promise.reject(error);
  }
};

/**
 * Check if a video is ready to play
 * @param video - HTMLVideoElement reference
 */
export const isVideoReady = (video: HTMLVideoElement | null): boolean => {
  if (!video) return false;
  
  // readyState values:
  // 0 = HAVE_NOTHING - no information whether or not the audio/video is ready
  // 1 = HAVE_METADATA - metadata for the audio/video is ready
  // 2 = HAVE_CURRENT_DATA - data for the current playback position is available
  // 3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
  // 4 = HAVE_ENOUGH_DATA - enough data available to start playing
  
  return video.readyState >= 2;
};

/**
 * Parse a valid time value from input
 * @param input - Input value (number or string)
 */
export const parseTimeValue = (input: unknown): number => {
  if (typeof input === 'number' && !isNaN(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return 0;
};

/**
 * Convert seconds to HH:MM:SS format
 * @param seconds - Seconds to convert
 * @param includeHours - Whether to include hours in the output
 */
export const secondsToTimecode = (seconds: number, includeHours = false): string => {
  if (isNaN(seconds) || seconds < 0) return includeHours ? "00:00:00" : "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (includeHours || hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Calculate video thumbnail positions for a given duration
 * @param duration - Total duration in seconds
 * @param count - Number of thumbnails to generate
 */
export const calculateThumbnailPositions = (duration: number, count = 5): number[] => {
  if (!duration || duration <= 0 || count <= 0) return [];
  
  const positions: number[] = [];
  const interval = duration / (count + 1);
  
  for (let i = 1; i <= count; i++) {
    positions.push(interval * i);
  }
  
  return positions;
};
