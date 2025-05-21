
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensure that the videos bucket exists in Supabase Storage
 * This function checks if the videos bucket exists and creates it if it doesn't
 */
export const ensureVideosBucketExists = async (): Promise<boolean> => {
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking buckets:", listError);
      return false;
    }
    
    // Check if the videos bucket exists
    const videosBucket = buckets?.find(bucket => bucket.name === 'videos');
    
    if (!videosBucket) {
      console.log("Videos bucket doesn't exist, creating it...");
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('videos', {
        public: false, // Set to true if you want files to be publicly accessible
        fileSizeLimit: 1024 * 1024 * 1000, // 1GB limit per file
      });
      
      if (error) {
        console.error("Error creating videos bucket:", error);
        return false;
      }
      
      console.log("Videos bucket created successfully:", data);
      return true;
    }
    
    console.log("Videos bucket already exists");
    return true;
  } catch (error) {
    console.error("Error ensuring videos bucket exists:", error);
    return false;
  }
};

/**
 * Initialize storage when the application starts
 */
export const initializeStorage = () => {
  ensureVideosBucketExists()
    .then(success => {
      if (success) {
        console.log("Supabase Storage initialized successfully");
      } else {
        console.error("Failed to initialize Supabase Storage");
      }
    });
};
