
import { useState, useRef } from "react";
import { Marker, GameData, SavedClip } from "@/types/analyzer";
import { toast } from "sonner";
import { downloadJSON, extractVideoClip } from "@/components/video/utils";

export const useAnalyzer = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [data, setData] = useState<GameData[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState("");
  const [selectedClip, setSelectedClip] = useState<GameData | null>(null);
  const [playLabel, setPlayLabel] = useState("");
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
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
  
  const saveClipToLibrary = (clip: GameData) => {
    if (!playLabel.trim()) {
      toast.error("Please enter a play label");
      return;
    }
    
    const startTime = parseFloat(clip["Start time"] || "0");
    const duration = parseFloat(clip["Duration"] || "0");
    
    const savedClip: SavedClip = {
      id: Date.now().toString(),
      startTime,
      duration,
      label: playLabel,
      notes: clip.Notes || "",
      timeline: clip.Timeline || "",
      saved: new Date().toISOString()
    };
    
    setSavedClips([...savedClips, savedClip]);
    setPlayLabel("");
    toast.success(`Saved clip: ${playLabel}`);
  };
  
  const removeSavedClip = (id: string) => {
    setSavedClips(savedClips.filter(clip => clip.id !== id));
    toast.success("Clip removed from library");
  };
  
  const exportClip = async (clip: SavedClip | GameData) => {
    if (!videoUrl) {
      toast.error("No video loaded");
      return;
    }
    
    let startTime, duration, label;
    
    if ('id' in clip) {
      // It's a SavedClip
      startTime = clip.startTime;
      duration = clip.duration;
      label = clip.label;
    } else {
      // It's a GameData
      startTime = parseFloat(clip["Start time"] || "0");
      duration = parseFloat(clip["Duration"] || "0");
      label = clip.Notes || "clip";
    }
    
    toast.loading("Exporting clip...");
    
    try {
      const filename = `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
      await extractVideoClip(videoUrl, startTime, duration, filename);
      toast.dismiss();
      toast.success(`Clip exported as ${filename}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export clip");
      console.error(error);
    }
  };
  
  const exportLibrary = () => {
    if (savedClips.length === 0) {
      toast.error("No clips in library to export");
      return;
    }
    
    const exportData = {
      clips: savedClips,
      exportedAt: new Date().toISOString(),
      totalClips: savedClips.length
    };
    
    downloadJSON(exportData, "clip-library.json");
    toast.success("Clip library exported as JSON");
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
    videoUrl,
    currentTime,
    data,
    markers,
    newMarkerLabel,
    selectedClip,
    playLabel,
    savedClips,
    videoPlayerRef,
    handleFileLoaded,
    handleVideoFileChange,
    handleTimeUpdate,
    addMarker,
    removeMarker,
    updateMarkerNotes,
    playClip,
    seekToMarker,
    setNewMarkerLabel,
    setPlayLabel,
    saveClipToLibrary,
    removeSavedClip,
    exportClip,
    exportLibrary,
    exportAllMarkers
  };
};
