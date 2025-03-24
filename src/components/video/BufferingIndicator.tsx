
import React from 'react';

interface BufferingIndicatorProps {
  isBuffering: boolean;
  hasError?: boolean;
  errorMessage?: string | null;
  isRecovering?: boolean;
}

const BufferingIndicator: React.FC<BufferingIndicatorProps> = ({ 
  isBuffering, 
  hasError = false, 
  errorMessage = null,
  isRecovering = false
}) => {
  // Return null if nothing to show
  if (!isBuffering && !hasError && !isRecovering) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
      {(isBuffering || isRecovering) && (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
      )}
      
      {isRecovering && (
        <div className="text-center p-4 bg-black/70 rounded-lg max-w-md">
          <p className="text-yellow-400 font-semibold mb-2">Attempting Recovery</p>
          <p className="text-white">Working to resolve playback issues...</p>
          <p className="text-white/70 text-sm mt-2">This may take a moment. Try WebM format for better compatibility.</p>
        </div>
      )}
      
      {hasError && errorMessage && (
        <div className="text-center p-4 bg-black/70 rounded-lg max-w-md">
          <p className="text-red-400 font-semibold mb-2">Video Playback Issue</p>
          <p className="text-white">{errorMessage}</p>
          <p className="text-white/70 text-sm mt-2">For best compatibility, try using WebM format videos.</p>
        </div>
      )}
    </div>
  );
};

export default BufferingIndicator;
