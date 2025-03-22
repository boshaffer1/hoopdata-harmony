export interface GameData {
  "Play Name": string;
  "Start time": string;
  "Duration": string;
  "Notes": string;
  "Timeline": string;
  "Players": string;
  "Situation": string;
  "Outcome": string;
}

export interface SavedClip {
  id: string;
  startTime: number;
  duration: number;
  label: string;
  notes: string;
  timeline: string;
  saved: string;
  players: PlayerAction[];
  situation: GameSituation;
}

export type PlayerActionType = 
  | 'scored' 
  | 'missed' 
  | 'assisted' 
  | 'rebounded' 
  | 'blocked' 
  | 'stole' 
  | 'turnover' 
  | 'fouled' 
  | 'other';

export interface PlayerAction {
  playerId: string;
  playerName: string;
  action: PlayerActionType;
}

export type GameSituation = 
  | 'transition' 
  | 'half_court' 
  | 'ato' 
  | 'slob' 
  | 'blob' 
  | 'press_break' 
  | 'zone_offense' 
  | 'man_offense' 
  | 'fast_break'
  | 'defense'
  | 'other';
