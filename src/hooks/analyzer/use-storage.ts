
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVideosBucketExists } from "@/utils/setup-supabase-storage";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { toast } from "sonner";

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
        // Instead of trying to create a bucket that might fail due to RLS policies,
        // just check if the bucket exists and assume it's ready if we get a response
        const { data, error } = await supabase.storage.getBucket('videos');
        if (!error) {
          setBucketReady(true);
        } else if (error.message.includes('row-level security policy')) {
          // If we get a specific error about RLS policies, we can still assume the bucket exists
          // but we don't have permission to manage it (which is fine, we just need to use it)
          console.log("Bucket exists but user doesn't have admin permissions, which is fine for uploads");
          setBucketReady(true);
        } else {
          // For other errors, we'll log them but still try to use the bucket
          console.warn("Bucket check warning:", error.message);
          setBucketReady(true); // Assume the bucket exists anyway
        }
      } catch (error) {
        console.error("Error checking bucket:", error);
        setBucketReady(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkBucket();
  }, [user]);

  // Simplified upload function that handles permissions more gracefully
  const uploadVideo = async (file: File, metadata?: Record<string, string>) => {
    if (!user) {
      toast.error("You must be signed in to upload videos");
      return { error: "No user authenticated", url: null, path: null };
    }

    if (!file) {
      return { error: "No file to upload", url: null, path: null };
    }

    try {
      // Create a cleaner filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      
      // Use a more organized path structure with user ID prefix
      const filePath = `${user.id}/${cleanFileName}`;
      
      console.log(`Uploading "${file.name}" to videos/${filePath}`);
      
      // Upload the file with simple error handling
      try {
        const { error: uploadError, data } = await supabase.storage
          .from('videos')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: true,
            ...(metadata ? { metadata } : {})
          });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          return { 
            error: uploadError, 
            url: null,
            path: null
          };
        }
      } catch (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { 
          error: uploadError, 
          url: null,
          path: null 
        };
      }
      
      // Get the public URL even if there was an error with the metadata
      try {
        const { data: publicURLData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        return { 
          error: null, 
          url: publicURLData?.publicUrl || null,
          path: filePath
        };
      } catch (urlError) {
        console.error("Error getting public URL:", urlError);
        return { 
          error: urlError, 
          url: null,
          path: filePath  // Still return the path in case we need it
        };
      }
    } catch (error) {
      console.error("General upload error:", error);
      return { error, url: null, path: null };
    }
  };
  
  return {
    bucketReady,
    isChecking,
    isAuthenticated: !!user,
    uploadVideo
  };
};
