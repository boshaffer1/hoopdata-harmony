
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayCircle, Download, Trash2, Flag, Loader2 } from "lucide-react";
import { SavedClip, GameSituation } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";
import { PlayerActionBadge } from "./PlayerActionBadge";

interface SavedClipItemProps {
  clip: SavedClip;
  onPlay: (clip: SavedClip) => void;
  onExport: (clip: SavedClip) => void;
  onRemove: (id: string) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  disabled?: boolean;
}

export const SavedClipItem: React.FC<SavedClipItemProps> = ({
  clip,
  onPlay,
  onExport,
  onRemove,
  selectable = false,
  isSelected = false,
  onToggleSelection = () => {},
  disabled = false,
}) => {
  const getSituationLabel = (situation: GameSituation): string => {
    const labels: Record<GameSituation, string> = {
      transition: "Transition",
      half_court: "Half Court",
      ato: "After Timeout (ATO)",
      slob: "Sideline Out of Bounds (SLOB)",
      blob: "Baseline Out of Bounds (BLOB)",
      press_break: "Press Break",
      zone_offense: "Zone Offense",
      man_offense: "Man Offense",
      fast_break: "Fast Break",
      other: "Other"
    };
    
    return labels[situation] || situation;
  };

  return (
    <li className={`border rounded-lg p-3 hover:bg-muted/50 ${isSelected ? 'bg-primary/10 border-primary/30' : ''} ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start">
        {selectable && (
          <div className="mr-2 mt-1">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(clip.id)}
              id={`select-clip-${clip.id}`}
              disabled={disabled}
            />
          </div>
        )}
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
                <PlayerActionBadge
                  key={idx}
                  player={player}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPlay(clip)}
            title="Play clip"
            disabled={disabled}
          >
            {disabled ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <PlayCircle className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onExport(clip)}
            title="Export clip"
            disabled={disabled}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onRemove(clip.id)}
            title="Remove clip"
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
};
