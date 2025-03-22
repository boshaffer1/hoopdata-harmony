
import React from "react";
import { SavedClip } from "@/types/analyzer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Download, Trash2, Flag } from "lucide-react";
import { formatVideoTime } from "@/components/video/utils";
import { getSituationLabel } from "@/utils/playerActionUtils";
import PlayerActionBadge from "./PlayerActionBadge";

interface SavedClipCardProps {
  clip: SavedClip;
  onPlayClip: (clip: SavedClip) => void;
  onExportClip: (clip: SavedClip) => void;
  onRemoveClip: (id: string) => void;
}

const SavedClipCard: React.FC<SavedClipCardProps> = ({
  clip,
  onPlayClip,
  onExportClip,
  onRemoveClip
}) => {
  return (
    <li className="border rounded-lg p-3 hover:bg-muted/50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{clip.label}</h4>
            {clip.situation && (
              <Badge variant="secondary" className="text-xs">
                <Flag className="h-3 w-3 mr-1" />
                {getSituationLabel(clip.situation)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {clip.timeline} • {formatVideoTime(clip.startTime)} ({formatVideoTime(clip.duration)})
          </p>
          {clip.notes && (
            <p className="text-xs mt-1">{clip.notes}</p>
          )}
          
          {/* Display player actions */}
          {clip.players && clip.players.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {clip.players.map((player, idx) => (
                <PlayerActionBadge key={idx} player={player} />
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPlayClip(clip)}
            title="Play clip"
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onExportClip(clip)}
            title="Export clip"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onRemoveClip(clip.id)}
            title="Remove clip"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default SavedClipCard;
