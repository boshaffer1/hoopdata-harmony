
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
