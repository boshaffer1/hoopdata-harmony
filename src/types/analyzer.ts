
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

export interface Marker {
  time: number;
  label: string;
  color: string;
  notes: string;
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

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  height: string;
  year: string;
  hometown: string;
  image?: string;
  stats?: PlayerStats;
}

export interface TeamRoster {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  players: Player[];
}

export interface PlayerStats {
  ppg?: number;
  rpg?: number;
  apg?: number;
  spg?: number;
  bpg?: number;
  mpg?: number;
  fg_pct?: number;
  fg3_pct?: number;
  ft_pct?: number;
}
