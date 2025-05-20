
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, Users, Grid } from "lucide-react";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import RosterView from "@/components/analyzer/teams/RosterView";
import { ClipThumbnailGrid } from "@/components/library/ClipThumbnailGrid";
import { ClipLibraryExtension } from "@/components/analyzer/ClipLibraryExtension";
import { Marker, GameData, SavedClip, TeamRoster } from "@/types/analyzer";

interface AnalyzerTabsProps {
  markers: Marker[];
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  rosters: TeamRoster[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (index: number) => void;
  onMarkerNotesChange: (index: number, notes: string) => void;
  onPlayLabelChange: (label: string) => void;
  onSaveClip: (startTime: number, duration: number, label: string) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip) => void;
  onStopClip: () => void;
  onAutoOrganize: () => void;
  onExportAllMarkers: () => void;
  onAddTeam: (name: string) => void;
  onRemoveTeam: (id: string) => void;
  onAddPlayer: (teamId: string, player: { name: string; number: string; position: string }) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
}

const AnalyzerTabs: React.FC<AnalyzerTabsProps> = ({
  markers,
  savedClips,
  playLabel,
  selectedClip,
  isPlayingClip,
  rosters,
  onSeekToMarker,
  onRemoveMarker,
  onMarkerNotesChange,
  onPlayLabelChange,
  onSaveClip,
  onRemoveClip,
  onExportClip,
  onExportLibrary,
  onPlayClip,
  onStopClip,
  onAutoOrganize,
  onExportAllMarkers,
  onAddTeam,
  onRemoveTeam,
  onAddPlayer,
  onRemovePlayer
}) => {
  return (
    <Tabs defaultValue="markers">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="markers" className="flex items-center gap-2">
          <BookmarkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Markers</span>
        </TabsTrigger>
        <TabsTrigger value="library" className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Library</span>
        </TabsTrigger>
        <TabsTrigger value="roster" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Rosters</span>
        </TabsTrigger>
        <TabsTrigger value="gallery" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Gallery</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="markers" className="mt-0">
        <MarkersList 
          markers={markers}
          onSeekToMarker={onSeekToMarker}
          onRemoveMarker={onRemoveMarker}
          onMarkerNotesChange={onMarkerNotesChange}
          onExportAllMarkers={onExportAllMarkers}
        />
      </TabsContent>
      
      <TabsContent value="library" className="mt-0">
        <ClipLibrary 
          savedClips={savedClips}
          playLabel={playLabel}
          selectedClip={selectedClip}
          isPlayingClip={isPlayingClip}
          onPlayLabelChange={onPlayLabelChange}
          onSaveClip={onSaveClip}
          onRemoveClip={onRemoveClip}
          onExportClip={onExportClip}
          onExportLibrary={onExportLibrary}
          onPlayClip={onPlayClip}
          onStopClip={onStopClip}
          onAutoOrganize={onAutoOrganize}
        />
        
        {/* Add the AI analysis extension */}
        <ClipLibraryExtension selectedClip={selectedClip} />
      </TabsContent>
      
      <TabsContent value="roster" className="mt-0">
        <RosterView 
          rosters={rosters}
          onAddTeam={onAddTeam}
          onRemoveTeam={onRemoveTeam}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
        />
      </TabsContent>
      
      <TabsContent value="gallery" className="mt-0">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Clip Gallery</h3>
          <ClipThumbnailGrid
            clips={savedClips}
            onPlayClip={onPlayClip}
            bucketFilter="clips"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AnalyzerTabs;
