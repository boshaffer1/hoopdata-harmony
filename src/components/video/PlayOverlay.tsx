
import React from "react";
import { Play } from "lucide-react";

interface PlayOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const PlayOverlay: React.FC<PlayOverlayProps> = ({ isVisible, onClick }) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
      onClick={onClick}
    >
      <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
        <Play className="h-12 w-12 text-white" />
      </div>
    </div>
  );
};

export default PlayOverlay;
