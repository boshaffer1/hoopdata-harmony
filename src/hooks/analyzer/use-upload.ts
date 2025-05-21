
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

  /**
   * Uploads a video file to the Supabase storage bucket
   * @param videoFile The video file to upload
   * @param metadata Optional metadata to include with the upload
   * @returns The URL of the uploaded file or null if upload failed
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

      // Create a unique filename with timestamp and original name
      const timestamp = Date.now();
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${timestamp}_${videoFile.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;

      // Log the upload process
      console.log(`Uploading video "${videoFile.name}" to Supabase storage bucket "videos"...`);

      // Upload in chunks to show progress
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalSize = videoFile.size;
      const chunks = Math.ceil(totalSize / chunkSize);
      
      // Upload each chunk
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, totalSize);
        const chunk = videoFile.slice(start, end);
        
        const tempFileName = `${filePath}.part${i}`;
        
        const { error: uploadChunkError } = await supabase.storage
          .from('videos')
          .upload(tempFileName, chunk, {
            contentType: 'video/mp4',
            upsert: true
          });
        
        if (uploadChunkError) throw uploadChunkError;
        
        setUploadProgress(Math.round(((i + 1) / chunks) * 100));
      }
      
      // Final upload with the complete file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile, {
          contentType: 'video/mp4',
          upsert: true,
          // Fix: Use metadata instead of fileMetadata
          metadata: {
            homeTeam: metadata?.homeTeam || '',
            awayTeam: metadata?.awayTeam || '',
            gameDate: metadata?.gameDate || '',
          }
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL of the uploaded file
      const { data: publicURLData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      // Save information about the video in the video_files table
      const { data: videoData, error: videoError } = await supabase
        .from('video_files')
        .insert({
          user_id: user.id,
          filename: videoFile.name,
          file_path: filePath,
          file_size: videoFile.size,
          content_type: videoFile.type,
          title: metadata?.title || videoFile.name,
          team_id: metadata?.homeTeam || '',
          description: `Game: ${metadata?.homeTeam || ''} vs ${metadata?.awayTeam || ''}, ${metadata?.gameDate || ''}`,
          video_url: publicURLData?.publicUrl || null
        });
      
      if (videoError) throw videoError;
      
      toast.success(`Video uploaded to Supabase storage`);
      
      // Trigger webhook with upload complete event
      triggerWebhook({
        event: "video_uploaded_to_supabase",
        timestamp: new Date().toISOString(),
        videoDetails: {
          fileName: videoFile.name,
          fileSize: videoFile.size,
          filePath: filePath,
          publicUrl: publicURLData?.publicUrl || null,
          metadata
        }
      });
      
      return publicURLData?.publicUrl || null;
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
      toast.error("Failed to upload video to Supabase");
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
    uploadVideoToSupabase,
    uploadVideoAndData
  };
};
