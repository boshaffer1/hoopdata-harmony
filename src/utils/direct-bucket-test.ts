import { supabase } from "@/integrations/supabase/client";

/**
 * Tests direct access to a specific bucket without using listBuckets
 */
export async function testDirectBucketByName(bucketName: string) {
  console.log(`Attempting direct access to bucket '${bucketName}'...`);
  
  try {
    // Try to list files in the bucket directly
    const { data: files, error } = await supabase
      .storage
      .from(bucketName)
      .list('');
      
    if (error) {
      console.error(`❌ Direct access to '${bucketName}' failed:`, error);
      return {
        success: false,
        error: error.message,
        statusCode: typeof error === 'object' && error !== null ? (error as any).status : null,
        bucketName
      };
    }
    
    console.log(`✅ Successfully accessed '${bucketName}' bucket with ${files?.length || 0} files`);
    return {
      success: true,
      fileCount: files?.length || 0,
      bucketName,
      firstFile: files && files.length > 0 ? files[0] : null
    };
  } catch (err) {
    console.error(`❌ Error during direct access to '${bucketName}':`, err);
    return {
      success: false,
      error: err.message,
      bucketName
    };
  }
}

/**
 * Tests the Supabase client configuration
 */
export async function testSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                       process.env.VITE_SUPABASE_URL || 
                       "Not available";
  
  const hasAnon = !!(import.meta.env.VITE_SUPABASE_ANON_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY);
  
  let authStatus = "Anonymous";
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      authStatus = `Authenticated as ${session.user.email || session.user.id}`;
    } else {
      authStatus = "Not authenticated (anonymous)";
    }
  } catch (err) {
    authStatus = `Error checking auth: ${err.message}`;
  }
  
  return {
    url: supabaseUrl,
    hasAnonKey: hasAnon,
    authStatus,
    clientObject: {
      hasStorageModule: !!supabase.storage,
      hasAuthModule: !!supabase.auth,
      hasFromMethod: !!(supabase.storage && supabase.storage.from)
    }
  };
} 