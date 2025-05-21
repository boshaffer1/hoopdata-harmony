
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
      const tempUrl = URL.createObjectURL(videoFile);
      
      // Try to upload to Supabase in the background, but don't wait for completion
      uploadVideo(videoFile, {
        homeTeam: metadata?.homeTeam || '',
        awayTeam: metadata?.awayTeam || '',
        gameDate: metadata?.gameDate || ''
      }).then(({ error, url, path }) => {
        clearInterval(progressInterval);
        
        if (error) {
          console.warn("Upload warning - will continue with temporary URL:", error);
          setUploadProgress(100); // Still show as complete
          
          // We'll trigger the webhook with the temporary URL instead
          triggerWebhook({
            event: "video_uploaded_with_local_url",
            timestamp: new Date().toISOString(),
            videoDetails: {
              fileName: formattedFileName,
              fileSize: videoFile.size,
              tempUrl: tempUrl, // Send the local blob URL
              metadata
            }
          });
          
          return;
        }
        
        setUploadProgress(100);
        
        // If upload was successful, save video metadata to database
        if (url && path) {
          // Save to video_files table (existing functionality)
          supabase
            .from('video_files')
            .insert({
              user_id: user.id,
              filename: formattedFileName,
              file_path: path,
              file_size: videoFile.size,
              content_type: videoFile.type,
              title: metadata?.title || formattedFileName,
              team_id: metadata?.homeTeam || '',
              away_team_id: metadata?.awayTeam || '', // Add the away team ID here
              description: `Game: ${metadata?.homeTeam || ''} vs ${metadata?.awayTeam || ''}, ${metadata?.gameDate || ''}`,
              video_url: url
            })
            .then(({ error: videoError }) => {
              if (videoError) {
                console.warn("Error saving video metadata (continuing anyway):", videoError);
              }
            });
          
          // Also save to "Video upload" table (new functionality)
          supabase
            .from('Video upload')
            .insert({
              user_id: user.id,
              file_name: formattedFileName,
              home_team: metadata?.homeTeam || '',
              away_team: metadata?.awayTeam || '',
              game_date: metadata?.gameDate ? new Date(metadata.gameDate) : null,
              video_url: url
            })
            .then(({ error: uploadError }) => {
              if (uploadError) {
                console.warn("Error saving to Video upload table:", uploadError);
              } else {
                console.log("Successfully saved to Video upload table");
              }
            });
          
          // Trigger webhook with the Supabase URL
          triggerWebhook({
            event: "video_uploaded_to_supabase",
            timestamp: new Date().toISOString(),
            videoDetails: {
              fileName: formattedFileName,
              fileSize: videoFile.size,
              filePath: path,
              publicUrl: url,
              metadata
            }
          });
          
          toast.success(`Video uploaded successfully`);
        }
      }).catch(error => {
        console.error("Background upload error:", error);
      }).finally(() => {
        setIsUploading(false);
      });
      
      // Return the temporary URL immediately so the user can continue working
      return tempUrl;
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
