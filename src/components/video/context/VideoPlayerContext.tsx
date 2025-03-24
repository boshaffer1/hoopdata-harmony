
import React, { createContext, useContext } from 'react';
import { VideoPlayerState, VideoPlayerActions } from '@/hooks/video-player/types';

interface VideoPlayerContextType {
  state: VideoPlayerState;
  actions: VideoPlayerActions;
  isVideoReady: boolean;
  pendingPlay: boolean;
  setPendingPlay: (value: boolean) => void;
  pendingSeek: number | null;
  setPendingSeek: (value: number | null) => void;
  enhancedPlay: () => Promise<void>;
  enhancedSeek: (time: number) => Promise<void>;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const useVideoPlayerContext = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayerContext must be used within a VideoPlayerProvider');
  }
  return context;
};

interface VideoPlayerProviderProps {
  children: React.ReactNode;
  state: VideoPlayerState;
  actions: VideoPlayerActions;
  isVideoReady: boolean;
  pendingPlay: boolean;
  setPendingPlay: (value: boolean) => void;
  pendingSeek: number | null;
  setPendingSeek: (value: number | null) => void;
  enhancedPlay: () => Promise<void>;
  enhancedSeek: (time: number) => Promise<void>;
}

export const VideoPlayerProvider: React.FC<VideoPlayerProviderProps> = ({
  children,
  state,
  actions,
  isVideoReady,
  pendingPlay,
  setPendingPlay,
  pendingSeek,
  setPendingSeek,
  enhancedPlay,
  enhancedSeek
}) => {
  const value = {
    state,
    actions,
    isVideoReady,
    pendingPlay,
    setPendingPlay,
    pendingSeek,
    setPendingSeek,
    enhancedPlay,
    enhancedSeek
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};
