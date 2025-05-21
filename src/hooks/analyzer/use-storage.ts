
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVideosBucketExists } from "@/utils/setup-supabase-storage";
import { useAuth } from "@/hooks/auth/AuthProvider";

/**
 * Hook to manage storage-related operations in the analyzer
 */
export const useStorage = () => {
  const { user } = useAuth();
  const [bucketReady, setBucketReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check if the videos bucket exists on mount and when user changes
  useEffect(() => {
    const checkBucket = async () => {
      if (!user) {
        setBucketReady(false);
        setIsChecking(false);
        return;
      }
      
      setIsChecking(true);
      try {
        const ready = await ensureVideosBucketExists();
        setBucketReady(ready);
      } catch (error) {
        console.error("Error checking bucket:", error);
        setBucketReady(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkBucket();
  }, [user]);

  // Simplified upload function that creates a cleaner file structure
  const uploadVideo = async (file: File, metadata?: Record<string, string>) => {
    if (!user || !file) {
      return { error: "No user or file", url: null };
    }

    try {
      // Create a cleaner filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      
      // Use a more organized path structure
      const filePath = `${user.id}/${cleanFileName}`;
      
      console.log(`Uploading "${file.name}" to videos/${filePath}`);
      
      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
          ...(metadata ? { metadata } : {})
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      return { 
        error: null, 
        url: publicURLData?.publicUrl || null,
        path: filePath
      };
    } catch (error) {
      console.error("Supabase upload error:", error);
      return { error, url: null };
    }
  };
  
  return {
    bucketReady,
    isChecking,
    isAuthenticated: !!user,
    uploadVideo
  };
};
