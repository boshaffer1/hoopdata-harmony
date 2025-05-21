
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, Users, Grid } from "lucide-react";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import RosterView from "@/components/analyzer/teams/RosterView";
import { ClipThumbnailGrid } from "@/components/analyzer/library/ClipThumbnailGrid";
import { ClipLibraryExtension } from "@/components/analyzer/ClipLibraryExtension";
import { VideoAnalysisDisplay } from "@/components/analyzer/ai/VideoAnalysisDisplay";
import { Marker, GameData, SavedClip, TeamRoster, Player } from "@/types/analyzer";
import PlayerStats from "@/components/analyzer/stats/PlayerStats";
import TeamStats from "@/components/analyzer/stats/TeamStats";
import SituationStats from "@/components/analyzer/stats/SituationStats";
import ClipAssistant from "@/components/analyzer/ai/ClipAssistant";

interface AnalyzerTabsProps {
  markers: Marker[];
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | null;
  isPlayingClip: boolean;
  rosters: TeamRoster[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (id: string) => void;
  onMarkerNotesChange: (id: string, notes: string) => void;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (startTime: number, duration: number, label: string) => void; 
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip | GameData) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip | GameData) => void;
  onStopClip: () => void;
  onAutoOrganize: () => void;
  onExportAllMarkers: () => void;
  onAddTeam: (teamName: string) => TeamRoster;
  onRemoveTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, player: Player) => void;
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
  // Fix the adapter function for handling clip save
  const handleSaveClip = (clip: GameData) => {
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    const label = clip["Play Name"] || "Untitled";
    onSaveClip(startTime, duration, label);
  };

  // Handle play clip for different types (GameData or SavedClip)
  const handlePlayClip = (clip: GameData | SavedClip) => {
    // Check if this is a GameData object by checking for "Play Name" property
    if ('Play Name' in clip) {
      const gameData = clip as GameData;
      const startTime = parseFloat(gameData["Start time"] || "0");
      const duration = parseFloat(gameData["Duration"] || "0");
      
      const savedClip: SavedClip = {
        id: `temp-${Date.now()}`,
        startTime: startTime,
        duration: duration,
        label: gameData["Play Name"] || "Untitled",
        notes: gameData["Notes"] || "",
        timeline: gameData["Timeline"] || "",
        saved: new Date().toISOString(),
        situation: gameData["Situation"] || "other"
      };
      
      onPlayClip(savedClip);
    } else {
      // It's already a SavedClip
      onPlayClip(clip);
    }
  };

  // Handle export for both GameData and SavedClip types
  const handleExportClip = (clip: GameData | SavedClip) => {
    onExportClip(clip);
  };

  // Mock data for stats components
  const mockPlayers = [
    { 
      id: '1', 
      name: 'Player 1', 
      stats: { points: 10, assists: 5 }, 
      playerName: 'Player 1', 
      totalClips: 10, 
      actions: { scored: 5, assist: 2 } 
    },
    { 
      id: '2', 
      name: 'Player 2', 
      stats: { points: 8, assists: 7 }, 
      playerName: 'Player 2', 
      totalClips: 7, 
      actions: { scored: 3, assist: 4 } 
    }
  ];
  
  const mockTeamData = [
    { 
      id: '1', 
      name: 'Team 1', 
      stats: { wins: 10, losses: 5 }, 
      teamName: 'Team 1', 
      totalClips: 15, 
      players: [{ 
        id: '1',
        playerName: 'Player 1', 
        totalClips: 10,
        name: 'Player 1',
        actions: { scored: 5, assist: 2 }
      }] 
    },
    { 
      id: '2', 
      name: 'Team 2', 
      stats: { wins: 8, losses: 7 }, 
      teamName: 'Team 2', 
      totalClips: 12, 
      players: [{ 
        id: '2',
        playerName: 'Player 2', 
        totalClips: 7,
        name: 'Player 2',
        actions: { scored: 3, assist: 4 }
      }] 
    }
  ];
  
  const mockSituations = [
    { id: 'transition', name: 'Transition', count: 15, label: 'transition', percentage: 60 },
    { id: 'half_court', name: 'Half Court', count: 25, label: 'half_court', percentage: 40 }
  ];

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
          onSaveClip={handleSaveClip}
          onRemoveClip={onRemoveClip}
          onExportClip={handleExportClip}
          onExportLibrary={onExportLibrary}
          onPlayClip={handlePlayClip}
          onStopClip={onStopClip}
          onAutoOrganize={onAutoOrganize}
        />
        
        {/* Add the AI analysis extension */}
        <ClipLibraryExtension selectedClip={selectedClip} />
        
        {/* Add stats components */}
        <PlayerStats players={mockPlayers} />
        
        <TeamStats teams={mockTeamData} />
        
        <SituationStats situations={mockSituations} />
        
        {/* Add clip assistant */}
        <ClipAssistant savedClips={savedClips} onPlayClip={onPlayClip} />
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
