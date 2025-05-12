import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayCircle, Download, Trash2, Flag, Loader2, MoreHorizontal } from "lucide-react";
import { SavedClip, GameSituation } from "@/types/analyzer";
import { formatVideoTime, formatReadableTime } from "@/components/video/utils";
import { PlayerActionBadge } from "./PlayerActionBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipAction } from "@/components/library/LibraryClipList";

interface SavedClipItemProps {
  clip: SavedClip;
  onPlay: (clip: SavedClip) => void;
  onExport: (clip: SavedClip) => void;
  onRemove: (id: string) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  disabled?: boolean;
  isSupabaseClip?: boolean;
  extraActions?: ClipAction[];
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
  isSupabaseClip = false,
  extraActions = []
}) => {
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  
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

  const handlePlay = async () => {
    if (disabled) return;
    
    // For Supabase clips that have a video_id, we need to get the direct URL
    if (isSupabaseClip && clip.videoId && !clip.directVideoUrl) {
      setIsLoadingUrl(true);
      try {
        // Try to get the signed URL for the video
        const { data, error } = await supabase
          .storage
          .from('videos')
          .createSignedUrl(clip.videoId, 3600);
          
        if (error) throw error;
        
        if (data?.signedUrl) {
          // Add the direct URL to the clip
          const clipWithUrl: SavedClip = {
            ...clip,
            directVideoUrl: data.signedUrl
          };
          onPlay(clipWithUrl);
        } else {
          throw new Error("Failed to get signed URL");
        }
      } catch (err) {
        console.error("Error getting signed URL:", err);
        toast.error("Could not load video URL");
      } finally {
        setIsLoadingUrl(false);
      }
    } else {
      // Regular clip or already has URL
      onPlay(clip);
    }
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
            {clip.timeline} • {formatVideoTime(clip.startTime)} ({formatReadableTime(clip.duration)})
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
          
          {/* Display tags if available */}
          {clip.tags && clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {clip.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Display video ID if available */}
          {clip.videoId && (
            <p className="text-xs text-muted-foreground mt-1">
              Video ID: {clip.videoId}
            </p>
          )}
        </div>
        <div className="flex shrink-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePlay}
            title="Play clip"
            disabled={disabled || isLoadingUrl}
          >
            {disabled || isLoadingUrl ? 
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
          
          {extraActions && extraActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={disabled}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {extraActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick(clip)}
                    disabled={disabled}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </li>
  );
};
