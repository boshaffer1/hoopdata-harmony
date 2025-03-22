
export interface Marker {
  time: number;
  label: string;
  color: string;
  notes?: string;
}

export interface GameData {
  [key: string]: string;
  "Start time"?: string;
  "Duration"?: string;
  Timeline?: string;
  Notes?: string;
  Players?: string;
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
