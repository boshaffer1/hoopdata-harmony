
import { useState, useEffect } from "react";

export function useFullscreenControl() {
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true);

  // Check if fullscreen is supported when the hook is initialized
  useEffect(() => {
    const fullscreenSupported = 
      document.fullscreenEnabled || 
      (document as any).webkitFullscreenEnabled || 
      (document as any).mozFullScreenEnabled || 
      (document as any).msFullscreenEnabled;
    
    setIsFullscreenSupported(!!fullscreenSupported);
  }, []);

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;

    // Check if we're currently in fullscreen mode
    const isFullscreen = !!document.fullscreenElement;

    try {
      if (!isFullscreen) {
        // Try different fullscreen methods for browser compatibility
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if ((videoContainer as any).webkitRequestFullscreen) {
          (videoContainer as any).webkitRequestFullscreen();
        } else if ((videoContainer as any).mozRequestFullScreen) {
          (videoContainer as any).mozRequestFullScreen();
        } else if ((videoContainer as any).msRequestFullscreen) {
          (videoContainer as any).msRequestFullscreen();
        } else {
          console.warn("Fullscreen API not supported");
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error(`Error attempting to toggle fullscreen: ${err}`);
    }
  };

  return {
    toggleFullscreen,
    isFullscreenSupported
  };
}
