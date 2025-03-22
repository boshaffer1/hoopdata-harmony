
import { useState, useRef } from "react";
import { Marker, GameData } from "@/types/analyzer";
import { toast } from "sonner";

export const useAnalyzer = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [data, setData] = useState<GameData[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState("");
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);
  const videoPlayerRef = useRef<any>(null);
  
  const handleFileLoaded = (loadedData: any) => {
    // Convert all CSV data to standard format with consistent property names
    const processedData = loadedData.map((item: any) => {
      // Ensure the object has the required properties
      return {
        ...item,
        "Start time": item["Start time"] || "0",
        "Duration": item["Duration"] || "0",
      };
    });
    
    setData(processedData);
    
    // Automatically create markers from the loaded data
    const newMarkers = processedData.map((item: GameData, index: number) => {
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
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

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
    
    // Format the time for the toast message
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

  const playClip = (item: GameData) => {
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    
    const startTime = parseFloat(item["Start time"] || "0");
    const duration = parseFloat(item["Duration"] || "0");
    
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekToTime(startTime);
      videoPlayerRef.current.play();
      
      setSelectedClip(item);
      
      // Optional: stop after duration
      if (duration > 0) {
        setTimeout(() => {
          if (videoPlayerRef.current) {
            videoPlayerRef.current.pause();
          }
        }, duration * 1000);
      }
      
      // Format the time for the toast message
      const minutes = Math.floor(startTime / 60);
      const seconds = Math.floor(startTime % 60);
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      
      toast.success(`Playing clip from ${formattedTime}`);
    }
  };

  const seekToMarker = (time: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekToTime(time);
    }
  };

  return {
    videoUrl,
    currentTime,
    data,
    markers,
    newMarkerLabel,
    selectedClip,
    videoPlayerRef,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip,
    seekToMarker,
    setNewMarkerLabel
  };
};
