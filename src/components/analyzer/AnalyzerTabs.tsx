
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarkersList from "@/components/analyzer/MarkersList";
import ClipLibrary from "@/components/analyzer/ClipLibrary";
import PlayerStats from "@/components/analyzer/stats/PlayerStats";
import TeamStats from "@/components/analyzer/stats/TeamStats";
import SituationStats from "@/components/analyzer/stats/SituationStats";
import RosterView from "@/components/analyzer/teams/RosterView";
import ClipAssistant from "@/components/analyzer/ai/ClipAssistant";
import VideoAnalysisDisplay from "@/components/analyzer/ai/VideoAnalysisDisplay";
import { GameData, Marker, SavedClip, TeamRoster } from "@/types/analyzer";

interface AnalyzerTabsProps {
  markers: Marker[];
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: GameData | SavedClip | null;
  isPlayingClip: boolean;
  rosters: TeamRoster[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (id: string) => void;
  onMarkerNotesChange: (id: string, notes: string) => void;
  onPlayLabelChange: (value: string) => void;
  onSaveClip: (startTime: number, duration: number, label: string) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: GameData | SavedClip) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip | GameData) => void;
  onStopClip: () => void;
  onAutoOrganize: () => void;
  onExportAllMarkers: () => void;
  onAddTeam: (name: string) => TeamRoster;
  onRemoveTeam: (id: string) => void;
  onAddPlayer: (teamId: string, player: { name: string, number: string, position: string }) => void;
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
  const [activeTab, setActiveTab] = useState("markers");

  // Convert between GameData and SavedClip to fix TypeScript incompatibility
  const handlePlayClip = (clip: SavedClip | GameData) => {
    onPlayClip(clip);
  };

  const handleExportClip = (clip: SavedClip | GameData) => {
    onExportClip(clip);
  };

  return (
    <Tabs defaultValue="markers" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="markers">Markers</TabsTrigger>
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>
      <div className="mt-6">
        <TabsContent value="markers">
          <MarkersList 
            markers={markers}
            onSeekToMarker={onSeekToMarker}
            onRemoveMarker={onRemoveMarker}
            onMarkerNotesChange={onMarkerNotesChange}
            onExportAllMarkers={onExportAllMarkers}
          />
        </TabsContent>
        <TabsContent value="library">
          <ClipLibrary
            savedClips={savedClips}
            playLabel={playLabel}
            isPlayingClip={isPlayingClip}
            selectedClip={selectedClip}
            onPlayLabelChange={onPlayLabelChange}
            onSaveClip={onSaveClip}
            onRemoveClip={onRemoveClip}
            onExportClip={handleExportClip}
            onExportLibrary={onExportLibrary}
            onPlayClip={handlePlayClip}
            onStopClip={onStopClip}
            onAutoOrganize={onAutoOrganize}
          />
        </TabsContent>
        <TabsContent value="teams">
          <RosterView 
            rosters={rosters}
            onAddTeam={onAddTeam}
            onRemoveTeam={onRemoveTeam}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
          />
        </TabsContent>
        <TabsContent value="stats">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="players">
                  <TabsList className="mb-4">
                    <TabsTrigger value="players">Players</TabsTrigger>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                    <TabsTrigger value="situations">Situations</TabsTrigger>
                  </TabsList>
                  <TabsContent value="players">
                    <PlayerStats />
                  </TabsContent>
                  <TabsContent value="teams">
                    <TeamStats />
                  </TabsContent>
                  <TabsContent value="situations">
                    <SituationStats />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <VideoAnalysisDisplay />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <ClipAssistant />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AnalyzerTabs;
