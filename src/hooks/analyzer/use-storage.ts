
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureVideosBucketExists } from "@/utils/setup-supabase-storage";

/**
 * Hook to manage storage-related operations in the analyzer
 */
export const useStorage = () => {
  const [bucketReady, setBucketReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check if the videos bucket exists on mount
  useEffect(() => {
    const checkBucket = async () => {
      setIsChecking(true);
      const ready = await ensureVideosBucketExists();
      setBucketReady(ready);
      setIsChecking(false);
    };
    
    checkBucket();
  }, []);
  
  return {
    bucketReady,
    isChecking
  };
};
