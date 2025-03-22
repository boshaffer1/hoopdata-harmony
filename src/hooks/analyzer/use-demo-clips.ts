
import { useState } from "react";
import { SavedClip, PlayerActionType, GameSituation } from "@/types/analyzer";

export const useDemoClips = () => {
  const createDemoClips = (): SavedClip[] => {
    return [
      {
        id: "demo-1",
        startTime: 10,
        duration: 15,
        label: "Fast break layup",
        notes: "Quick transition play with a finish at the rim",
        timeline: "",
        saved: new Date().toISOString(),
        players: [
          { playerId: "demo-p1", playerName: "John Smith", action: "scored" as PlayerActionType }
        ],
        situation: "fast_break" as GameSituation
      },
      {
        id: "demo-2",
        startTime: 45,
        duration: 20,
        label: "Corner three attempt",
        notes: "Open shot from the corner after ball movement",
        timeline: "",
        saved: new Date().toISOString(),
        players: [
          { playerId: "demo-p2", playerName: "Mike Johnson", action: "missed" as PlayerActionType }
        ],
        situation: "half_court" as GameSituation
      },
      {
        id: "demo-3",
        startTime: 120,
        duration: 12,
        label: "Post-up play",
        notes: "Back to the basket move with a hook shot",
        timeline: "",
        saved: new Date().toISOString(),
        players: [
          { playerId: "demo-p3", playerName: "David Williams", action: "scored" as PlayerActionType }
        ],
        situation: "other" as GameSituation
      },
      {
        id: "demo-4",
        startTime: 180,
        duration: 18,
        label: "Three pointer by Tatum",
        notes: "Clean look from beyond the arc",
        timeline: "",
        saved: new Date().toISOString(),
        players: [
          { playerId: "demo-p4", playerName: "Jayson Tatum", action: "scored" as PlayerActionType }
        ],
        situation: "other" as GameSituation
      },
      {
        id: "demo-5",
        startTime: 250,
        duration: 14,
        label: "Defense by Young",
        notes: "Great defensive stance leading to a steal",
        timeline: "",
        saved: new Date().toISOString(),
        players: [
          { playerId: "demo-p5", playerName: "Trae Young", action: "stole" as PlayerActionType }
        ],
        situation: "defense" as GameSituation
      }
    ];
  };

  const addDemoClips = (savedClips: SavedClip[], setSavedClips: React.Dispatch<React.SetStateAction<SavedClip[]>>) => {
    if (savedClips.length === 0) {
      const demoClips = createDemoClips();
      console.log("Adding demo clips for testing");
      setSavedClips(demoClips);
      return demoClips;
    }
    return [];
  };

  return {
    addDemoClips,
    createDemoClips
  };
};
