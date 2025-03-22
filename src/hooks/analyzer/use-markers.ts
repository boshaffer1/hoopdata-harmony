
import { useState } from "react";
import { Marker } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON } from "@/components/video/utils";

export const useMarkers = (currentTime: number) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState("");

  const addMarker = () => {
    if (!newMarkerLabel.trim()) {
      toast.error("Please enter a marker label");
      return;
    }
    
    const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newMarker: Marker = {
      time: currentTime,
      label: newMarkerLabel.trim(),
      color: randomColor,
      notes: ""
    };
    
    setMarkers([...markers, newMarker]);
    setNewMarkerLabel("");
    
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    toast.success(`Marker "${newMarkerLabel.trim()}" added at ${formattedTime}`);
  };

  const removeMarker = (index: number) => {
    const newMarkers = [...markers];
    newMarkers.splice(index, 1);
    setMarkers(newMarkers);
  };

  const updateMarkerNotes = (index: number, notes: string) => {
    const newMarkers = [...markers];
    newMarkers[index].notes = notes;
    setMarkers(newMarkers);
  };

  const addMarkersFromData = (processedData: any[]) => {
    const newMarkers = processedData.map((item: any, index: number) => {
      const startTime = parseFloat(item["Start time"] || "0");
      const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];
      const randomColor = colors[index % colors.length];
      
      return {
        time: startTime,
        label: item.Notes || `Clip ${index + 1}`,
        color: randomColor,
        notes: `${item.Timeline || ""} - ${item.Notes || ""}`
      };
    });
    
    setMarkers([...markers, ...newMarkers]);
    toast.success(`Created ${newMarkers.length} markers from CSV data`);
    return newMarkers;
  };

  const exportAllMarkers = () => {
    if (markers.length === 0) {
      toast.error("No markers to export");
      return;
    }
    
    const exportData = {
      markers,
      exportedAt: new Date().toISOString(),
      totalMarkers: markers.length
    };
    
    downloadJSON(exportData, "video-markers.json");
    toast.success("All markers exported as JSON");
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
