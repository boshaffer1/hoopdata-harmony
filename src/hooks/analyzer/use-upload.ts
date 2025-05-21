
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { GameData } from "@/types/analyzer";
import { triggerWebhook } from "@/utils/webhook-handler";
import { useStorage } from "./use-storage";

export const useUpload = () => {
  const { user } = useAuth();
  const { uploadVideo } = useStorage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Uploads a video file to Supabase storage and returns the public URL
   */
  const uploadVideoToSupabase = async (
    videoFile: File, 
    metadata?: { 
      homeTeam?: string; 
      awayTeam?: string; 
      gameDate?: string;
      title?: string;
    }
  ) => {
    if (!user) {
      toast.error("Please sign in to upload videos");
      return null;
    }

    if (!videoFile) {
      toast.error("No video file to upload");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simple progress simulation since we're not using chunks anymore
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      // Upload the file directly with our simplified function
      const { error, url, path } = await uploadVideo(videoFile, {
        homeTeam: metadata?.homeTeam || '',
        awayTeam: metadata?.awayTeam || '',
        gameDate: metadata?.gameDate || ''
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        toast.error("Upload failed");
        console.error("Upload error:", error);
        return null;
      }
      
      setUploadProgress(100);
      
      // Save video metadata to database
      if (url && path) {
        const { error: videoError } = await supabase
          .from('video_files')
          .insert({
            user_id: user.id,
            filename: videoFile.name,
            file_path: path,
            file_size: videoFile.size,
            content_type: videoFile.type,
            title: metadata?.title || videoFile.name,
            team_id: metadata?.homeTeam || '',
            description: `Game: ${metadata?.homeTeam || ''} vs ${metadata?.awayTeam || ''}, ${metadata?.gameDate || ''}`,
            video_url: url
          });
        
        if (videoError) {
          console.error("Error saving video metadata:", videoError);
        }
      }
      
      toast.success(`Video uploaded successfully`);
      
      // Trigger webhook with upload complete event
      triggerWebhook({
        event: "video_uploaded_to_supabase",
        timestamp: new Date().toISOString(),
        videoDetails: {
          fileName: videoFile.name,
          fileSize: videoFile.size,
          filePath: path,
          publicUrl: url,
          metadata
        }
      });
      
      return url;
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
      toast.error("Failed to upload video");
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadVideoToSupabase
  };
};
