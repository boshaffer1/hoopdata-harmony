
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
  
  return {
    bucketReady,
    isChecking,
    isAuthenticated: !!user
  };
};
