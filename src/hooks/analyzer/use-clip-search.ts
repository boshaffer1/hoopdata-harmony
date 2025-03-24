
import { SavedClip } from "@/types/analyzer";

export const useClipSearch = () => {
  const searchClips = (query: string, savedClips: SavedClip[]): SavedClip[] => {
    // If there are no saved clips, return empty array
    if (!savedClips || savedClips.length === 0) {
      console.log("No saved clips available for search");
      return [];
    }

    console.log(`Searching through ${savedClips.length} clips for "${query}"`);
    
    const searchTerms = query.toLowerCase().split(" ");
    
    // More flexible search approach with enhanced logging
    return savedClips.filter(clip => {
      // Guard against undefined or null values
      const clipLabel = (clip.label || "").toLowerCase();
      const clipNotes = (clip.notes || "").toLowerCase();
      const clipSituation = (clip.situation || "").toLowerCase();
      
      // Map through players carefully to avoid errors
      let playerNames: string[] = [];
      if (clip.players && Array.isArray(clip.players)) {
        playerNames = clip.players
          .filter(p => p && typeof p === 'object' && 'playerName' in p) // Filter out null/undefined players
          .map(p => p.playerName ? p.playerName.toLowerCase() : "");
      }
      
      // Actions from players
      let playerActions: string[] = [];
      if (clip.players && Array.isArray(clip.players)) {
        playerActions = clip.players
          .filter(p => p && typeof p === 'object' && 'action' in p)
          .map(p => p.action ? p.action.toLowerCase() : "");
      }
      
      // Collect all text to search within
      const clipText = [
        clipLabel,
        clipNotes,
        clipSituation,
        ...playerNames,
        ...playerActions
      ].join(" ");
      
      // Log what we're searching within
      console.log(`Clip text for "${clip.label}": "${clipText}"`);
      
      // Check if ANY search term is found - more permissive search
      for (const term of searchTerms) {
        if (clipText.includes(term)) {
          console.log(`Match found in clip: "${clip.label}" for term: "${term}"`);
          return true;
        }
      }
      
      // Special handling for some common search terms
      if (query.includes("three") || query.includes("3-point") || 
          query.includes("three pointer") || query.includes("3pt")) {
        if (clipNotes.includes("three") || clipNotes.includes("3-point") || 
            clipLabel.includes("three") || clipLabel.includes("3 point")) {
          console.log(`Special match for three pointer in clip: "${clip.label}"`);
          return true;
        }
      }
      
      return false;
    });
  };

  return {
    searchClips
  };
};
