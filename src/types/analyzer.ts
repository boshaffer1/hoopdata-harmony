
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
}

export interface SavedClip {
  id: string;
  startTime: number;
  duration: number;
  label: string;
  notes: string;
  timeline: string;
  saved: string;
}
