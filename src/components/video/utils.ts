/**
 * Format time in seconds to MM:SS format
 */
export const formatVideoTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return "00:00";
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Format time in seconds to a more readable format (e.g., "1 min 34 sec" or "45 sec")
 */
export const formatReadableTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return "0 sec";
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  if (minutes > 0) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ${seconds} sec${seconds !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
  }
};

/**
 * Create and download a JSON file
 */
export const downloadJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Extract a video clip using MediaRecorder
 */
export const extractVideoClip = async (
  videoUrl: string, 
  startTime: number, 
  duration: number,
  filename: string = "clip.webm"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      
      // Create a canvas and context to draw the video frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to the start time
        video.currentTime = startTime;
        
        video.onseeked = () => {
          // Create a MediaRecorder to capture the canvas
          const stream = canvas.captureStream(30); // 30 FPS
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          };
          
          // Start recording
          mediaRecorder.start();
          video.play();
          
          // Stop recording after the specified duration
          setTimeout(() => {
            video.pause();
            mediaRecorder.stop();
          }, duration * 1000);
          
          // Draw video frames to canvas
          const drawFrame = () => {
            if (video.currentTime < startTime + duration) {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            }
          };
          
          drawFrame();
        };
      };
      
    } catch (error) {
      console.error("Error extracting video clip:", error);
      reject(error);
    }
  });
};

