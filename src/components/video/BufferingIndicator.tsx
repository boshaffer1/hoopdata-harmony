
import React from 'react';

interface BufferingIndicatorProps {
  isBuffering: boolean;
  hasError?: boolean;
  errorMessage?: string | null;
}

const BufferingIndicator: React.FC<BufferingIndicatorProps> = ({ 
  isBuffering, 
  hasError = false, 
  errorMessage = null 
}) => {
  // Return null if nothing to show
  if (!isBuffering && !hasError) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
      {isBuffering && (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
      )}
      
      {hasError && errorMessage && (
        <div className="text-center p-4 bg-black/70 rounded-lg max-w-md">
          <p className="text-red-400 font-semibold mb-2">Video Playback Issue</p>
          <p className="text-white">{errorMessage}</p>
          <p className="text-white/70 text-sm mt-2">Try refreshing the page or reloading the video.</p>
        </div>
      )}
    </div>
  );
};

export default BufferingIndicator;
