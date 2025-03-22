
import React, { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/video/VideoPlayer";
import FileUploader from "@/components/data/FileUploader";
import DataTable from "@/components/data/DataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkIcon, FilePlus, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

interface Marker {
  time: number;
  label: string;
  color: string;
  notes?: string;
}

interface GameData {
  [key: string]: string;
  "Start time"?: string;
  "Duration"?: string;
  Timeline?: string;
  Notes?: string;
}

const Analyzer = () => {
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
    toast.success(`Marker "${newMarkerLabel.trim()}" added at ${formatTime(currentTime)}`);
  };

  const removeMarker = (index: number) => {
    const newMarkers = [...markers];
    newMarkers.splice(index, 1);
    setMarkers(newMarkers);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
      
      toast.success(`Playing clip from ${formatTime(startTime)}`);
    }
  };

  const seekToMarker = (time: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekToTime(time);
    }
  };

  // Customize the data table to include a play button for each clip
  const renderCustomDataTable = () => {
    if (data.length === 0) {
      return <FileUploader onFileLoaded={handleFileLoaded} />;
    }
    
    return (
      <div>
        <div className="mb-4 bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">CSV Data Preview</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Click the play button on any row to play that specific clip from the video.
          </p>
          {selectedClip && (
            <div className="bg-primary/10 p-2 rounded text-xs">
              <span className="font-medium">Currently selected: </span>
              {selectedClip.Notes || selectedClip.Timeline || "Unnamed clip"} 
              (Start: {formatTime(parseFloat(selectedClip["Start time"] || "0"))}, 
              Duration: {formatTime(parseFloat(selectedClip["Duration"] || "0"))})
            </div>
          )}
        </div>
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Play</th>
                <th className="px-4 py-2">Timeline</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-t hover:bg-muted/50 ${selectedClip === item ? 'bg-primary/10' : ''}`}
                >
                  <td className="px-4 py-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => playClip(item)}
                      disabled={!videoUrl}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-2">{item.Timeline || '-'}</td>
                  <td className="px-4 py-2">{formatTime(parseFloat(item["Start time"] || "0"))}</td>
                  <td className="px-4 py-2">{formatTime(parseFloat(item["Duration"] || "0"))}</td>
                  <td className="px-4 py-2">{item.Notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Video Analyzer</h1>
        <p className="text-muted-foreground">
          Sync game footage with data for comprehensive analysis
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player and Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {videoUrl ? (
                <VideoPlayer 
                  ref={videoPlayerRef}
                  src={videoUrl} 
                  onTimeUpdate={handleTimeUpdate}
                  markers={markers}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <div className="text-center p-6">
                    <FilePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No video selected</p>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Current Time and Marker Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono">{formatTime(currentTime)}</div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Add Marker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={newMarkerLabel}
                    onChange={(e) => setNewMarkerLabel(e.target.value)}
                    placeholder="Marker label"
                    className="flex-1"
                  />
                  <Button onClick={addMarker} disabled={!videoUrl}>
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    Mark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Game Data</CardTitle>
              <CardDescription>
                Upload and view your game data CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCustomDataTable()}
            </CardContent>
          </Card>
        </div>
        
        {/* Markers and Notes Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Markers & Notes</CardTitle>
              <CardDescription>
                Create and manage video markers and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {markers.length === 0 ? (
                <div className="text-center py-12">
                  <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Add markers by playing the video and clicking "Mark" at specific timestamps.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {markers.map((marker, index) => (
                    <li 
                      key={index} 
                      className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => seekToMarker(marker.time)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full mt-1.5" 
                            style={{ backgroundColor: marker.color }}
                          ></div>
                          <div>
                            <p className="font-medium">{marker.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(marker.time)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Add notes..."
                        className="mt-2 text-sm"
                        value={marker.notes || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newMarkers = [...markers];
                          newMarkers[index].notes = e.target.value;
                          setMarkers(newMarkers);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analyzer;
