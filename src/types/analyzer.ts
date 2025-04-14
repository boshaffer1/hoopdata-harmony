export interface Marker {
  time: number;
  label: string;
  color: string;
  notes?: string;
}

export interface GameData {
  [key: string]: string;
  "Play Name": string;
  "Start time": string;
  "Duration": string;
  "Situation": GameSituation;
  "Outcome": PlayerActionType;
  "Players": string; // JSON string of PlayerAction[]
  "Notes"?: string;
  "Timeline"?: string;
}

export interface SavedClip {
  id: string;
  startTime: number;
  duration: number;
  label: string;
  notes: string;
  timeline: string;
  saved: string;
  players?: PlayerAction[];
  situation?: GameSituation;
  folderId?: string;
  teamId?: string;
  gameId?: string;
  clipType?: "play" | "possession" | "full_game" | "other";
}

export interface ClipFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For nested folders
  folderType?: "team" | "plays" | "games" | "other";
  teamId?: string; // To associate folders with specific teams
}

export interface Game {
  id: string;
  title: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  videoUrl?: string;
  dataUrl?: string;
  createdAt: string;
  updatedAt: string;
  teamId?: string; // Adding teamId to associate games with teams
}

export interface PlayerAction {
  playerId: string;
  playerName: string;
  action: PlayerActionType;
}

export type PlayerActionType = 
  | "scored" 
  | "missed" 
  | "assist" 
  | "rebound" 
  | "block" 
  | "steal" 
  | "turnover" 
  | "foul" 
  | "other";

export const PLAYER_ACTIONS: PlayerActionType[] = [
  "scored", 
  "missed", 
  "assist", 
  "rebound", 
  "block", 
  "steal", 
  "turnover", 
  "foul", 
  "other"
];

export type GameSituation = 
  | "transition" 
  | "half_court" 
  | "ato" // After timeout
  | "slob" // Sideline out of bounds
  | "blob" // Baseline out of bounds
  | "press_break" 
  | "zone_offense" 
  | "man_offense"
  | "fast_break"
  | "other";

export const GAME_SITUATIONS: GameSituation[] = [
  "transition",
  "half_court",
  "ato",
  "slob",
  "blob",
  "press_break",
  "zone_offense",
  "man_offense",
  "fast_break",
  "other"
];

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  notes?: string;
  stats?: {
    ppg?: number;
    rpg?: number;
    apg?: number;
    spg?: number;
    bpg?: number;
    fgPercent?: number;
    threePointPercent?: number;
    ftPercent?: number;
    [key: string]: number | undefined;
  };
}

export interface TeamRoster {
  id: string;
  name: string;
  players: Player[];
}
