
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
   * Uploads a video file and returns the public URL for use with the webhook
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
      
      // Create a simpler progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      // Create a formatted file name for readability
      let formattedFileName = videoFile.name;
      
      if (metadata?.homeTeam && metadata?.awayTeam) {
        // Format date properly if provided
        let dateString = "";
        if (metadata.gameDate) {
          // Format the date as YYYY-MM-DD
          const dateObj = new Date(metadata.gameDate);
          dateString = `, ${dateObj.toISOString().split('T')[0]}`;
        }
        // Create formatted filename: "HomeTeam vs AwayTeam, YYYY-MM-DD.mp4"
        const fileExt = videoFile.name.split('.').pop() || 'mp4';
        formattedFileName = `${metadata.homeTeam} vs ${metadata.awayTeam}${dateString}.${fileExt}`;
      }
      
      // First, create and return a temporary object URL while upload happens in the background
      // Don't return the blob URL anymore, instead wait for the actual Supabase upload
      try {
        // Try to upload to Supabase immediately and get a real URL
        const { error, url, path } = await uploadVideo(videoFile, {
          homeTeam: metadata?.homeTeam || '',
          awayTeam: metadata?.awayTeam || '',
          gameDate: metadata?.gameDate || ''
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (error) {
          console.warn("Upload error:", error);
          setIsUploading(false);
          toast.error("Failed to upload video to storage");
          return null;
        }
        
        // If upload was successful, save video metadata to database
        if (url && path) {
          // Parse the game date into ISO format for database storage
          const gameDate = metadata?.gameDate ? new Date(metadata.gameDate).toISOString().split('T')[0] : null;
          
          // Complete row data we'll save to database
          const videoFileData = {
            user_id: user.id,
            filename: formattedFileName,
            file_path: path,
            file_size: videoFile.size,
            content_type: videoFile.type,
            title: metadata?.title || formattedFileName,
            team_id: metadata?.homeTeam || '',
            away_team_id: metadata?.awayTeam || '', 
            description: `Game: ${metadata?.homeTeam || ''} vs ${metadata?.awayTeam || ''}, ${metadata?.gameDate || ''}`,
            video_url: url,
            game_date: gameDate
          };
          
          // Video upload data
          const videoUploadData = {
            user_id: user.id,
            file_name: formattedFileName,
            home_team: metadata?.homeTeam || '',
            away_team: metadata?.awayTeam || '',
            game_date: gameDate,
            video_url: url
          };
          
          // Save to video_files table
          const { error: videoError, data: videoData } = await supabase
            .from('video_files')
            .insert(videoFileData);
            
          if (videoError) {
            console.warn("Error saving video metadata (continuing anyway):", videoError);
          } else {
            console.log("Successfully saved to video_files table:", videoData);
          }
          
          // Also save to "Video upload" table
          const { error: uploadError, data: uploadData } = await supabase
            .from('Video upload')
            .insert(videoUploadData);
            
          if (uploadError) {
            console.warn("Error saving to Video upload table:", uploadError);
          } else {
            console.log("Successfully saved to Video upload table:", uploadData);
          }
          
          // Trigger webhook with the Supabase URL and complete row data
          triggerWebhook({
            event: "video_uploaded_to_supabase",
            timestamp: new Date().toISOString(),
            videoDetails: {
              fileName: formattedFileName,
              fileSize: videoFile.size,
              filePath: path,
              publicUrl: url,
              storedUrl: url, // Add an explicit stored URL field
              metadata: metadata || {}
            },
            completeRowData: {
              videoFile: videoFileData,
              videoUpload: videoUploadData,
              user: { id: user.id },
              uploadTimestamp: new Date().toISOString()
            }
          });
          
          toast.success(`Video uploaded successfully`);
          setIsUploading(false);
          return url;  // Return the actual Supabase URL
        }
        
        setIsUploading(false);
        return null;
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        toast.error("Failed to upload video");
        return null;
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      toast.error("Failed to upload video");
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadVideoToSupabase
  };
};
