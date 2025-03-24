
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
    if (!videoRef.current) {
      return Promise.reject(new Error("Video element not available"));
    }
    
    try {
      // Ensure time is within valid range
      const clampedTime = clampTime(timeInSeconds, videoRef.current.duration || 0);
      
      console.log(`Seeking to time: ${clampedTime}s`);
      
      // Prevent redundant seeks to the same position
      if (Math.abs(videoRef.current.currentTime - clampedTime) < 0.5) {
        console.log("Ignoring repeated seek to the same position");
        return Promise.resolve();
      }
      
      // Ensure the video is fully loaded and ready
      if (videoRef.current.readyState < 3) {
        console.log("Video not ready yet, setting pending seek time:", clampedTime);
        return Promise.reject(new Error("Video not ready for seeking"));
      }
      
      // For reliable seeking, especially with large jumps
      const wasPlaying = !videoRef.current.paused;
      
      // Set the new time directly
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
      
      // Verify the seek worked
      if (Math.abs(videoRef.current.currentTime - clampedTime) > 1) {
        console.warn(`Seek verification failed. Target: ${clampedTime}, Actual: ${videoRef.current.currentTime}`);
        
        // Try one more time with a small delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!videoRef.current) return reject("Video element not available");
            
            try {
              videoRef.current.currentTime = clampedTime;
              setCurrentTime(clampedTime);
              
              // Resume playback if it was playing
              if (wasPlaying) {
                videoRef.current.play().catch(e => console.error("Error resuming after seek retry:", e));
              }
              
              resolve(true);
            } catch (err) {
              reject(err);
            }
          }, 100);
        });
      }
      
      // Resume playback if it was playing
      if (wasPlaying) {
        return videoRef.current.play()
          .then(() => {
            console.log("Video playback resumed after seek");
            return Promise.resolve();
          })
          .catch(err => {
            console.error("Error resuming playback after seek:", err);
            return Promise.reject(err);
          });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in seekToTime:", error);
      return Promise.reject(error);
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
