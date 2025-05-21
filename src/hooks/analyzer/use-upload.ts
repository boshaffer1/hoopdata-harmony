
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "../use-auth";
import { GameData } from "@/types/analyzer";
import { triggerWebhook } from "@/utils/webhook-handler";

export const useUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideoAndData = async (videoUrl: string | null, processedData: GameData[]) => {
    if (!user || !videoUrl) {
      if (!user) toast.error("Please sign in to upload");
      if (!videoUrl) toast.error("No video to upload");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const videoFile = await fetch(videoUrl);
      const videoBlob = await videoFile.blob();
      const videoFileName = `game_video_${Date.now()}.mp4`;
      
      // Trigger webhook with video upload event
      triggerWebhook({
        event: "video_upload_started",
        timestamp: new Date().toISOString(),
        videoDetails: {
          fileName: videoFileName,
          fileSize: videoBlob.size
        }
      });
      
      // Upload in chunks to show progress
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalSize = videoBlob.size;
      const chunks = Math.ceil(totalSize / chunkSize);
      
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, totalSize);
        const chunk = videoBlob.slice(start, end);
        
        const tempFileName = `${videoFileName}.part${i}`;
        
        const { error: uploadChunkError } = await supabase.storage
          .from('videos')
          .upload(tempFileName, chunk, {
            contentType: 'video/mp4',
          });
        
        if (uploadChunkError) throw uploadChunkError;
        
        setUploadProgress(Math.round(((i + 1) / chunks) * 100));
      }
      
      // Combine chunks (in a real implementation, you'd use a server-side function)
      // For simplicity, we'll just use the last chunk as the complete file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoBlob, {
          contentType: 'video/mp4',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: videoData, error: videoError } = await supabase
        .from('video_files')
        .insert({
          user_id: user.id,
          filename: videoFileName,
          file_path: uploadData?.path,
        });
      
      if (videoError) throw videoError;
      
      const { error: csvError } = await supabase
        .from('Csv_Data')
        .insert({
          user_id: user.id,
          data: processedData,
          filename: `game_data_${Date.now()}.csv`
        });
      
      if (csvError) throw csvError;
      
      toast.success(`Uploaded video and ${processedData.length} plays to Supabase`);
      
      // Trigger webhook with completed upload event
      triggerWebhook({
        event: "video_upload_completed",
        timestamp: new Date().toISOString(),
        videoDetails: {
          fileName: videoFileName,
          fileSize: videoBlob.size,
          playsCount: processedData.length
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
      toast.error("Failed to save video and data to cloud");
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadVideoAndData
  };
};
