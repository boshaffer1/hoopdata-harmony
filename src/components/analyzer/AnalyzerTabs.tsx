import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CaretSort,
  Import,
  Scissors,
  Download,
  Save,
  Play,
  Pause,
  ListVideo,
  PlusCircle,
  Trash2,
  Edit,
  FileText,
  DownloadCloud,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSortableData } from "@/hooks/use-sortable-data";
import { TeamRosterList } from "@/components/analyzer/teams/TeamRosterList";
import { GameData, Marker, SavedClip } from "@/types/analyzer";
import { Roster } from "@/types/roster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyzerTabsProps {
  markers: Marker[];
  savedClips: SavedClip[];
  playLabel: string;
  selectedClip: SavedClip | null;
  isPlayingClip: boolean;
  rosters: Roster[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (id: string) => void;
  onMarkerNotesChange: (id: string, notes: string) => void;
  onPlayLabelChange: (label: string) => void;
  onSaveClip: (startTime: number, duration: number, label: string) => void;
  onRemoveClip: (id: string) => void;
  onExportClip: (clip: SavedClip | GameData) => void;
  onExportLibrary: () => void;
  onPlayClip: (clip: SavedClip | GameData) => void;
  onStopClip: () => void;
  onAutoOrganize: () => void;
  onExportAllMarkers: () => void;
  onAddTeam: (teamName: string) => Roster | void;
  onRemoveTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, playerName: string, playerNumber: string, playerPosition: string) => void;
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
  onRemovePlayer,
}) => {
  const { toast } = useToast();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isMarkersOpen, setIsMarkersOpen] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isGameDataOpen, setIsGameDataOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerNotes, setMarkerNotes] = useState("");

  // Function to handle opening the alert dialog and setting the selected marker ID
  const handleOpenAlertDialog = (id: string, notes: string) => {
    setSelectedMarkerId(id);
    setMarkerNotes(notes);
    setIsAlertDialogOpen(true);
  };

  // Function to handle closing the alert dialog
  const handleCloseAlertDialog = () => {
    setIsAlertDialogOpen(false);
    setSelectedMarkerId(null);
    setMarkerNotes("");
  };

  // Function to handle saving the marker notes
  const handleSaveMarkerNotes = () => {
    if (selectedMarkerId) {
      onMarkerNotesChange(selectedMarkerId, markerNotes);
      toast({
        title: "Marker notes saved",
        description: "The notes for this marker have been updated.",
      });
    }
    handleCloseAlertDialog();
  };

  // Function to handle removing a marker
  const handleRemove = () => {
    if (selectedMarkerId) {
      onRemoveMarker(selectedMarkerId);
      toast({
        title: "Marker removed",
        description: "The marker has been removed from the timeline.",
      });
    }
    handleCloseAlertDialog();
  };

  // Function to handle playing a game data clip
  const handlePlayGameData = (gameData: GameData) => {
    // Convert GameData to SavedClip before passing it to onPlayClip
    const savedClip: SavedClip = {
      id: `game-data-${Date.now()}`,
      startTime: parseFloat(gameData["Start time"] || "0"),
      duration: parseFloat(gameData["Duration"] || "5"),
      label: gameData["Play Name"] || "Untitled Clip",
      notes: gameData["Notes"] || "",
      timeline: gameData["Timeline"] || "",
      saved: new Date().toISOString(),
      situation: gameData["Situation"] || "other"
    };
    
    onPlayClip(savedClip);
  };

  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Function to handle file loading
  const handleFileLoaded = (data: any) => {
    setGameData(data);
    setIsImporting(false);
    toast({
      title: "Game data imported",
      description: "The game data has been successfully imported.",
    });
  };

  // Function to handle exporting game data
  const handleExportGameData = () => {
    if (gameData.length === 0) {
      toast({
        title: "No game data to export",
        description: "Please import game data first.",
      });
      return;
    }

    const json = JSON.stringify(gameData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle importing game data
  const handleImportGameData = () => {
    setIsImporting(true);
    toast({
      title: "Importing game data",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle saving a clip
  const handleSaveClip = (startTime: number, duration: number, label: string) => {
    onSaveClip(startTime, duration, label);
    toast({
      title: "Clip saved",
      description: "The clip has been saved to your library.",
    });
  };

  // Function to handle removing a clip
  const handleRemoveClip = (id: string) => {
    onRemoveClip(id);
    toast({
      title: "Clip removed",
      description: "The clip has been removed from your library.",
    });
  };

  // Function to handle exporting a clip
  const handleExportClip = (clip: SavedClip | GameData) => {
    onExportClip(clip);
    toast({
      title: "Clip exported",
      description: "The clip has been exported.",
    });
  };

  // Function to handle exporting the library
  const handleExportLibrary = () => {
    onExportLibrary();
    toast({
      title: "Library exported",
      description: "The library has been exported.",
    });
  };

  // Function to handle playing a clip
  const handlePlayClip = (clip: SavedClip | GameData) => {
    onPlayClip(clip);
  };

  // Function to handle stopping a clip
  const handleStopClip = () => {
    onStopClip();
  };

  // Function to handle auto organizing clips
  const handleAutoOrganize = () => {
    onAutoOrganize();
    toast({
      title: "Clips auto organized",
      description: "The clips have been auto organized.",
    });
  };

  // Function to handle exporting all markers
  const handleExportAllMarkers = () => {
    onExportAllMarkers();
    toast({
      title: "Markers exported",
      description: "All markers have been exported.",
    });
  };

  // Function to handle adding a team
  const handleAddTeam = (teamName: string) => {
    const result = onAddTeam(teamName);
    if (result) {
      toast({
        title: "Team added",
        description: "The team has been added to your roster.",
      });
    } else {
      toast({
        title: "Team not added",
        description: "The team could not be added to your roster.",
      });
    }
  };

  // Function to handle removing a team
  const handleRemoveTeam = (teamId: string) => {
    onRemoveTeam(teamId);
    toast({
      title: "Team removed",
      description: "The team has been removed from your roster.",
    });
  };

  // Function to handle adding a player
  const handleAddPlayer = (teamId: string, playerName: string, playerNumber: string, playerPosition: string) => {
    onAddPlayer(teamId, playerName, playerNumber, playerPosition);
    toast({
      title: "Player added",
      description: "The player has been added to your team.",
    });
  };

  // Function to handle removing a player
  const handleRemovePlayer = (teamId: string, playerId: string) => {
    onRemovePlayer(teamId, playerId);
    toast({
      title: "Player removed",
      description: "The player has been removed from your team.",
    });
  };

  // Function to handle seeking to a marker
  const handleSeekToMarker = (time: number) => {
    onSeekToMarker(time);
    toast({
      title: "Seeking to marker",
      description: "Seeking to the marker on the timeline.",
    });
  };

  // Function to handle marker notes change
  const handleMarkerNotesChange = (id: string, notes: string) => {
    onMarkerNotesChange(id, notes);
    toast({
      title: "Marker notes changed",
      description: "The marker notes have been changed.",
    });
  };

  // Function to handle play label change
  const handlePlayLabelChange = (label: string) => {
    onPlayLabelChange(label);
    toast({
      title: "Play label changed",
      description: "The play label has been changed.",
    });
  };

  // Function to handle exporting a marker
  const handleExportMarker = (marker: Marker) => {
    const json = JSON.stringify(marker, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marker.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Marker exported",
      description: "The marker has been exported.",
    });
  };

  // Function to handle importing a marker
  const handleImportMarker = () => {
    toast({
      title: "Importing marker",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting a saved clip
  const handleExportSavedClip = (clip: SavedClip) => {
    const json = JSON.stringify(clip, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_clip.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Saved clip exported",
      description: "The saved clip has been exported.",
    });
  };

  // Function to handle importing a saved clip
  const handleImportSavedClip = () => {
    toast({
      title: "Importing saved clip",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting a team
  const handleExportTeam = (team: Roster) => {
    const json = JSON.stringify(team, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Team exported",
      description: "The team has been exported.",
    });
  };

  // Function to handle importing a team
  const handleImportTeam = () => {
    toast({
      title: "Importing team",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting game data clip
  const handleExportGameDataClip = (clip: GameData) => {
    const json = JSON.stringify(clip, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_data_clip.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Game data clip exported",
      description: "The game data clip has been exported.",
    });
  };

  // Function to handle importing game data clip
  const handleImportGameDataClip = () => {
    toast({
      title: "Importing game data clip",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting all game data
  const handleExportAllGameData = () => {
    const json = JSON.stringify(gameData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "All game data exported",
      description: "All game data has been exported.",
    });
  };

  // Function to handle importing all game data
  const handleImportAllGameData = () => {
    toast({
      title: "Importing all game data",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting all saved clips
  const handleExportAllSavedClips = () => {
    const json = JSON.stringify(savedClips, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_clips.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "All saved clips exported",
      description: "All saved clips have been exported.",
    });
  };

  // Function to handle importing all saved clips
  const handleImportAllSavedClips = () => {
    toast({
      title: "Importing all saved clips",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting all teams
  const handleExportAllTeams = () => {
    const json = JSON.stringify(rosters, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teams.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "All teams exported",
      description: "All teams have been exported.",
    });
  };

  // Function to handle importing all teams
  const handleImportAllTeams = () => {
    toast({
      title: "Importing all teams",
      description: "Please select a JSON file to import.",
    });
  };

  // Function to handle exporting all markers
  const handleExportAllMarkers2 = () => {
    const json = JSON.stringify(markers, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "All markers exported",
      description: "All markers have been exported.",
    });
  };

  // Function to handle importing all markers
  const handleImportAllMarkers = () => {
    toast({
      title: "Importing all markers",
      description: "Please select a JSON file to import.",
    });
  };

  const MarkerNotesFormSchema = z.object({
    notes: z.string().optional(),
  });

  const markerNotesForm = useForm<z.infer<typeof MarkerNotesFormSchema>>({
    resolver: zodResolver(MarkerNotesFormSchema),
    defaultValues: {
      notes: markerNotes,
    },
    mode: "onChange",
  });

  useEffect(() => {
    markerNotesForm.reset({ notes: markerNotes });
  }, [markerNotes]);

  return (
    <Tabs defaultValue="clips" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="clips" onClick={() => setIsLibraryOpen(true)}>
          Clips
        </TabsTrigger>
        <TabsTrigger value="markers" onClick={() => setIsMarkersOpen(true)}>
          Markers
        </TabsTrigger>
        <TabsTrigger value="teams" onClick={() => setIsTeamsOpen(true)}>
          Teams
        </TabsTrigger>
        <TabsTrigger value="game-data" onClick={() => setIsGameDataOpen(true)}>
          Game Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clips" className={cn(isLibraryOpen ? "block" : "hidden", "animate-in fade-in")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Clip Library</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleAutoOrganize}
              >
                <HelpCircle className="h-4 w-4" />
                Auto Organize
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <DownloadCloud className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleExportLibrary}>
                    <div className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Library</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportAllSavedClips}>
                    <div className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export All Saved Clips</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportAllSavedClips}>
                    <div className="flex items-center">
                      <Import className="mr-2 h-4 w-4" />
                      <span>Import All Saved Clips</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {savedClips.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedClips.map((clip) => (
                    <TableRow key={clip.id}>
                      <TableCell>{clip.label}</TableCell>
                      <TableCell>{clip.startTime}</TableCell>
                      <TableCell>{clip.duration}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handlePlayClip(clip)}
                            >
                              <div className="flex items-center">
                                {isPlayingClip && selectedClip?.id === clip.id ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    <span>Play</span>
                                  </>
                                )}
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportClip(clip)}
                            >
                              <div className="flex items-center">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Export</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveClip(clip.id)}
                            >
                              <div className="flex items-center">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No clips saved yet.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="markers" className={cn(isMarkersOpen ? "block" : "hidden", "animate-in fade-in")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Markers</h2>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <DownloadCloud className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleExportAllMarkers2}>
                    <div className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export All Markers</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportAllMarkers}>
                    <div className="flex items-center">
                      <Import className="mr-2 h-4 w-4" />
                      <span>Import All Markers</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {markers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markers.map((marker) => (
                    <TableRow key={marker.id}>
                      <TableCell>{marker.label}</TableCell>
                      <TableCell>{marker.time}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSeekToMarker(marker.time)}
                            >
                              <div className="flex items-center">
                                <Play className="mr-2 h-4 w-4" />
                                <span>Seek To</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenAlertDialog(marker.id, marker.notes)}
                            >
                              <div className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Notes</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportMarker(marker)}
                            >
                              <div className="flex items-center">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Export</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenAlertDialog(marker.id, marker.notes)}
                            >
                              <div className="flex items-center">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No markers added yet.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="teams" className={cn(isTeamsOpen ? "block" : "hidden", "animate-in fade-in")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Teams</h2>
          </div>
          <TeamRosterList
            rosters={rosters}
            onAddTeam={handleAddTeam}
            onRemoveTeam={handleRemoveTeam}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
          />
        </div>
      </TabsContent>

      <TabsContent value="game-data" className={cn(isGameDataOpen ? "block" : "hidden", "animate-in fade-in")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Game Data</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleImportGameData}
                disabled={isImporting}
              >
                <Import className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportGameData}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          {gameData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Play Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Situation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameData.map((data) => (
                    <TableRow key={data["Play Name"]}>
                      <TableCell>{data["Play Name"]}</TableCell>
                      <TableCell>{data["Start time"]}</TableCell>
                      <TableCell>{data["Duration"]}</TableCell>
                      <TableCell>{data["Timeline"]}</TableCell>
                      <TableCell>{data["Situation"]}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handlePlayGameData(data)}
                            >
                              <div className="flex items-center">
                                <Play className="mr-2 h-4 w-4" />
                                <span>Play</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportClip(data)}
                            >
                              <div className="flex items-center">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Export</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No game data imported yet.</p>
          )}
        </div>
      </TabsContent>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Marker</AlertDialogTitle>
            <AlertDialogDescription>
              Edit the notes for this marker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...markerNotesForm}>
            <form onSubmit={markerNotesForm.handleSubmit(handleSaveMarkerNotes)} className="space-y-4">
              <FormField
                control={markerNotesForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Marker notes" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add any notes you want to remember about this marker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCloseAlertDialog}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction type="submit">
                  Save
                </AlertDialogAction>
                <Button variant="destructive" onClick={handleRemove}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
};

export default AnalyzerTabs;
