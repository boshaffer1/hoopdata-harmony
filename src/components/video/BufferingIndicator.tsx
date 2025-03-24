
import React from 'react';

interface BufferingIndicatorProps {
  isBuffering: boolean;
}

const BufferingIndicator: React.FC<BufferingIndicatorProps> = ({ isBuffering }) => {
  if (!isBuffering) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
};

export default BufferingIndicator;
