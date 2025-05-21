
import { useState } from "react";
import { Marker } from "@/types/analyzer";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useMarkers = (currentTime: number) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState("");

  const addMarker = () => {
    if (!newMarkerLabel) {
      toast.error("Please enter a marker label");
      return;
    }

    // Create a new marker with a unique ID
    const newMarker: Marker = {
      id: uuidv4(),
      time: currentTime,
      label: newMarkerLabel,
      color: getRandomColor(),
      notes: ""
    };

    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    setNewMarkerLabel("");
    toast.success(`Marker "${newMarkerLabel}" added at ${formatTime(currentTime)}`);
    return newMarker;
  };

  const removeMarker = (id: string) => {
    setMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== id));
    toast.success("Marker removed");
  };

  const updateMarkerNotes = (id: string, notes: string) => {
    setMarkers(prevMarkers => 
      prevMarkers.map(marker => 
        marker.id === id ? { ...marker, notes } : marker
      )
    );
  };

  // Add markers from game data
  const addMarkersFromData = (gameData: any[]) => {
    const createdMarkers: Marker[] = [];
    
    gameData.forEach(play => {
      if (play["Start time"] && play["Play Name"]) {
        const startTime = parseFloat(play["Start time"]);
        const newMarker: Marker = {
          id: uuidv4(),
          time: startTime,
          label: play["Play Name"] || "Untitled Play",
          color: getRandomColor(),
          notes: play["Notes"] || ""
        };
        
        createdMarkers.push(newMarker);
      }
    });
    
    if (createdMarkers.length > 0) {
      setMarkers(prev => [...prev, ...createdMarkers]);
    }
    
    return createdMarkers;
  };

  // Export all markers as JSON file
  const exportAllMarkers = () => {
    if (markers.length === 0) {
      toast.error("No markers to export");
      return;
    }
    
    const markersData = JSON.stringify(markers, null, 2);
    const blob = new Blob([markersData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-markers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Exported ${markers.length} markers`);
  };

  return {
    markers,
    newMarkerLabel,
    setNewMarkerLabel,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    addMarkersFromData,
    exportAllMarkers
  };
};

// Helper functions
const getRandomColor = () => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33F0", "#33FFF0"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
