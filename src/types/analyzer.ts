
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
