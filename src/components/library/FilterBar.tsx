
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Tag } from "lucide-react";
import { SavedClip } from '@/types/analyzer';

interface FilterBarProps {
  clips: SavedClip[];
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  clips, 
  activeFilters, 
  onFilterChange 
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Extract unique tags and players from all clips
  const allTags = Array.from(new Set(
    clips.flatMap(clip => clip.tags || [])
  )).sort();
  
  // Extract unique player names for filtering
  const allPlayers = Array.from(new Set(
    clips.flatMap(clip => clip.players?.map(p => p.playerName) || [])
  )).sort();
  
  const handleAddFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      onFilterChange([...activeFilters, filter]);
    }
  };

  const handleRemoveFilter = (filter: string) => {
    onFilterChange(activeFilters.filter(f => f !== filter));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter options based on search term
  const filteredOptions = [...allTags, ...allPlayers].filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search filters (tags, players)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
            {activeFilters.map(filter => (
              <Badge 
                key={filter} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {filteredOptions.map(option => {
            const isTag = allTags.includes(option);
            return (
              <Button
                key={option}
                variant="outline"
                size="sm"
                className={activeFilters.includes(option) ? "bg-primary/10" : ""}
                onClick={() => handleAddFilter(option)}
              >
                {isTag && <Tag className="mr-1 h-3 w-3" />}
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
