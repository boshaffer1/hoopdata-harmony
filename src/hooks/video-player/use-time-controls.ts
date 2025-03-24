
import { clampTime } from "./utils";

export function useTimeControls(
  videoRef: React.RefObject<HTMLVideoElement>,
  {
    currentTime,
    setCurrentTime,
    duration
  }: {
    currentTime: number;
    setCurrentTime: (value: number) => void;
    duration: number;
  }
) {
  const handleTimeChange = (value: number[]) => {
    if (videoRef.current) {
      try {
        const newTime = value[0];
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } catch (error) {
        console.error("Error changing time:", error);
      }
    }
  };

  const seekToTime = (timeInSeconds: number) => {
    if (videoRef.current) {
      try {
        // Ensure time is within valid range
        const clampedTime = clampTime(timeInSeconds, videoRef.current.duration || 0);
        
        // For more reliable seeking, especially with large jumps
        if (Math.abs(videoRef.current.currentTime - clampedTime) > 10) {
          // For large jumps, pause first to avoid decoding errors
          const wasPlaying = !videoRef.current.paused;
          if (wasPlaying) {
            videoRef.current.pause();
          }
          
          // Set the new time
          videoRef.current.currentTime = clampedTime;
          setCurrentTime(clampedTime);
          console.log(`Sought to ${clampedTime}s`);
          
          // If it was playing, resume after a slight delay
          if (wasPlaying) {
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("Error resuming playback after seek:", e));
              }
            }, 300);
          }
        } else {
          // For smaller jumps, just set the time directly
          videoRef.current.currentTime = clampedTime;
          setCurrentTime(clampedTime);
        }
      } catch (error) {
        console.error("Error seeking to time:", error);
      }
    }
  };

  const jumpTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = clampTime(currentTime + seconds, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const getCurrentTime = () => currentTime;
  const getDuration = () => duration;

  return {
    handleTimeChange,
    seekToTime,
    jumpTime,
    getCurrentTime,
    getDuration
  };
}
