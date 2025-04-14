
import React from "react";
import { SavedClip } from "@/types/analyzer";
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2, Video, VideoOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedClipItemProps {
  clip: SavedClip;
  onPlay: (clip: SavedClip) => void;
  onExport: (clip: SavedClip) => void;
  onRemove: (id: string) => void;
}

export const SavedClipItem: React.FC<SavedClipItemProps> = ({
  clip,
  onPlay,
  onExport,
  onRemove
}) => {
  const formattedTime = () => {
    const minutes = Math.floor(clip.startTime / 60);
    const seconds = Math.floor(clip.startTime % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formattedDuration = () => {
    const minutes = Math.floor(clip.duration / 60);
    const seconds = Math.floor(clip.duration % 60);
    return minutes > 0 
      ? `${minutes}m ${seconds}s` 
      : `${seconds}s`;
  };

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex-grow">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium line-clamp-1">{clip.label}</h3>
            <span className="text-xs text-muted-foreground">
              {formattedTime()} ({formattedDuration()})
            </span>
          </div>
          
          {clip.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {clip.notes}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            {clip.videoUrl ? (
              <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                <Video className="h-3 w-3 mr-1" />
                Video available
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400">
                <VideoOff className="h-3 w-3 mr-1" />
                No video linked
              </span>
            )}
            
            <span className="text-xs text-muted-foreground">
              Saved {formatDistanceToNow(new Date(clip.saved), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1 self-end md:self-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950/50"
            onClick={() => onPlay(clip)}
            title="Play clip"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/50"
            onClick={() => onExport(clip)}
            title="Export clip"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(clip.id)}
            title="Delete clip"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
