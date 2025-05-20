import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CSVData } from "@/types/analyzer";

interface ExistingVideosSectionProps {
  onVideoSelect: (videoUrl: string) => void;
  onCsvDataSelect: (data: CSVData) => void;
}

const ExistingVideosSection: React.FC<ExistingVideosSectionProps> = ({ onVideoSelect, onCsvDataSelect }) => {
  const [videoFiles, setVideoFiles] = useState<any[]>([]);
  const [csvFiles, setCsvFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideoFiles();
    fetchCsvData();
  }, []);

  const fetchVideoFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("video_files")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setVideoFiles(data);
      }
    } catch (error) {
      console.error("Error fetching video files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCsvData = async () => {
    try {
      // Use the correct table name with proper case - "Csv_Data" instead of "csv_data"
      const { data, error } = await supabase
        .from("Csv_Data")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setCsvFiles(data as any); // Type as CSVData[]
      }
    } catch (error) {
      console.error("Error fetching CSV data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (videoUrl: string) => {
    onVideoSelect(videoUrl);
  };

  const handleCsvDataSelect = async (csvData: any) => {
    try {
      // Parse the CSV data
      const parsedData = JSON.parse(csvData.data);
      onCsvDataSelect(parsedData);
    } catch (error) {
      console.error("Error parsing CSV data:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-2">Load Existing Video</h3>
        {isLoading ? (
          <p>Loading videos...</p>
        ) : videoFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoFiles.map((video) => (
              <div key={video.id} className="border rounded-md p-2">
                <button
                  onClick={() => handleVideoSelect(video.file_path)}
                  className="w-full text-left hover:bg-gray-100 p-2 rounded-md"
                >
                  {video.filename}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No videos found.</p>
        )}
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-2">Load Existing CSV Data</h3>
        {isLoading ? (
          <p>Loading CSV data...</p>
        ) : csvFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {csvFiles.map((csv) => (
              <div key={csv.id} className="border rounded-md p-2">
                <button
                  onClick={() => handleCsvDataSelect(csv)}
                  className="w-full text-left hover:bg-gray-100 p-2 rounded-md"
                >
                  {csv.filename}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No CSV data found.</p>
        )}
      </div>
    </div>
  );
};

export default ExistingVideosSection;
