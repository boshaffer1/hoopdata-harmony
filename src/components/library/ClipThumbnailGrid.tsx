
import React from 'react';
import { Button } from '@/components/ui/button';
import { SavedClip } from '@/types/analyzer';
import { PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClipThumbnailGridProps {
  clips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
}

export const ClipThumbnailGrid: React.FC<ClipThumbnailGridProps> = ({ 
  clips, 
  onPlayClip 
}) => {
  const getPublicThumbnailUrl = (clip: SavedClip) => {
    // Construct thumbnail path based on clip's video ID or unique identifier
    const thumbnailPath = `${clip.id || clip.startTime.toString()}.jpg`;
    
    try {
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
      return data?.publicUrl;
    } catch (error) {
      console.error('Error getting thumbnail URL:', error);
      return undefined;
    }
  };

  if (clips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No clips available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {clips.map((clip) => {
        const thumbnailUrl = getPublicThumbnailUrl(clip);
        
        return (
          <div 
            key={clip.id} 
            className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={clip.label} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                No Thumbnail
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/20 backdrop-blur-sm"
                onClick={() => onPlayClip(clip)}
              >
                <PlayCircle className="h-8 w-8 text-white" />
              </Button>
            </div>
            
            <div className="p-2 bg-background">
              <h4 className="text-sm font-medium truncate">{clip.label}</h4>
              <p className="text-xs text-muted-foreground">
                {clip.timeline || `${clip.startTime.toFixed(1)}s`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
