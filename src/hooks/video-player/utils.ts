
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
  return video.readyState >= 2;
};

/**
 * Log video player errors with context
 */
export const logVideoError = (error: unknown, context: string): void => {
  console.error(`Video player error (${context}):`, error);
};
