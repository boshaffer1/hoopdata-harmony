
import React from 'react';
import { Button } from '@/components/ui/button';
import { SavedClip } from '@/types/analyzer';
import { PlayCircle, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FilterBar from './FilterBar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClipThumbnailGridProps {
  clips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
}

export const ClipThumbnailGrid: React.FC<ClipThumbnailGridProps> = ({ 
  clips, 
  onPlayClip 
}) => {
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  
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

  const filteredClips = clips.filter(clip => {
    if (activeFilters.length === 0) return true;
    
    return activeFilters.every(filter => {
      // Check if the filter is in tags
      if (clip.tags?.includes(filter)) return true;
      
      // Check if the filter is in player names
      if (clip.players?.some(player => player.playerName === filter)) return true;
      
      return false;
    });
  });

  if (clips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No clips available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FilterBar 
          clips={clips} 
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
        
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClips.map((clip) => {
            const thumbnailUrl = getPublicThumbnailUrl(clip);
            
            return (
              <div 
                key={clip.id} 
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
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
                
                <div className="p-4 bg-background space-y-3">
                  <h4 className="font-medium truncate">{clip.label}</h4>
                  
                  {clip.timeline && (
                    <p className="text-sm text-muted-foreground">
                      {clip.timeline}
                    </p>
                  )}
                  
                  {clip.tags && clip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {clip.tags.map(tag => (
                        <TooltipProvider key={tag}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {tag}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to filter by {tag}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                  
                  {clip.players && clip.players.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {clip.players.map(player => (
                        <Badge 
                          key={player.playerId} 
                          variant="outline"
                          className="text-xs"
                        >
                          {player.playerName}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {clip.notes && (
                    <p className="text-sm text-muted-foreground truncate">
                      {clip.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Table>
          <TableCaption>A list of available clips</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClips.map((clip) => (
              <TableRow key={clip.id}>
                <TableCell className="font-medium">{clip.label}</TableCell>
                <TableCell>{clip.timeline}</TableCell>
                <TableCell>{clip.startTime}s ({clip.duration}s)</TableCell>
                <TableCell>
                  {clip.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-1 mb-1">
                      {tag}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {clip.players?.map(player => (
                    <Badge key={player.playerId} variant="outline" className="mr-1 mb-1">
                      {player.playerName}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell className="max-w-xs truncate">{clip.notes}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPlayClip(clip)}
                  >
                    Play
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
