
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isRecovering: boolean;
}

export interface VideoPlayerActions {
  play: () => Promise<void>;
  pause: () => void;
  seekToTime: (timeInSeconds: number) => void;
  togglePlay: () => void;
  handleTimeChange: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  jumpTime: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}
