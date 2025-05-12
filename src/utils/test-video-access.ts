import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Tests direct access to a video file in the videos bucket
 */
export async function testVideoAccess() {
  try {
    console.log("Testing video access in videos bucket...");
    
    // 1. List files in the videos bucket
    const { data: files, error } = await supabase
      .storage
      .from('videos')
      .list('');
      
    if (error) {
      console.error("Error listing files in videos bucket:", error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log(`Found ${files.length} files in videos bucket:`, files);
    
    if (files.length === 0) {
      return {
        success: false,
        error: "No video files found in the videos bucket"
      };
    }
    
    // 2. Get the first video file and create a signed URL
    const firstVideo = files[0];
    console.log("Testing access for video:", firstVideo.name);
    
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('videos')
      .createSignedUrl(firstVideo.name, 3600);
      
    if (urlError) {
      console.error("Error creating signed URL for video:", urlError);
      return {
        success: false,
        error: urlError.message,
        file: firstVideo
      };
    }
    
    if (!urlData?.signedUrl) {
      console.error("No signed URL returned for video");
      return {
        success: false,
        error: "No signed URL returned",
        file: firstVideo
      };
    }
    
    console.log("Successfully created signed URL for video:", urlData.signedUrl.substring(0, 100) + "...");
    
    // 3. Try to access the URL to verify it works
    try {
      const response = await fetch(urlData.signedUrl, { method: 'HEAD' });
      console.log("URL fetch response:", response.status, response.statusText);
      
      return {
        success: response.ok,
        url: urlData.signedUrl,
        file: firstVideo,
        status: response.status,
        statusText: response.statusText
      };
    } catch (fetchError) {
      console.error("Error testing video URL accessibility:", fetchError);
      return {
        success: false,
        error: fetchError.message,
        url: urlData.signedUrl,
        file: firstVideo
      };
    }
  } catch (err) {
    console.error("Error in testVideoAccess:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

type TestResult = {
  success: boolean;
  count: number;
  samples: any[];
  error?: string;
};

/**
 * Directly tests database and storage connections to videos
 */
export async function testVideoSources() {
  const results = {
    database: {
      success: false,
      count: 0,
      samples: []
    } as TestResult,
    storage: {
      success: false,
      count: 0,
      samples: []
    } as TestResult,
    urls: []
  };

  try {
    // Test database access
    const { data: videos, error: dbError } = await supabase
      .from('video_files')
      .select('*')
      .limit(5);
      
    if (dbError) {
      console.error("Error accessing video_files table:", dbError);
      results.database.error = dbError.message;
    } else {
      results.database.success = true;
      results.database.count = videos.length;
      results.database.samples = videos;
      
      // Try to create URLs for these videos
      if (videos.length > 0) {
        for (const video of videos) {
          if (video.file_path) {
            try {
              const { data, error } = await supabase
                .storage
                .from('videos')
                .createSignedUrl(video.file_path, 3600);
                
              if (!error && data?.signedUrl) {
                results.urls.push({
                  id: video.id,
                  path: video.file_path,
                  url: data.signedUrl,
                  success: true
                });
              } else {
                results.urls.push({
                  id: video.id,
                  path: video.file_path,
                  error: error?.message || "No URL returned",
                  success: false
                });
              }
            } catch (err) {
              results.urls.push({
                id: video.id,
                path: video.file_path,
                error: err.message,
                success: false
              });
            }
          }
        }
      }
    }
    
    // Test storage access
    const { data: files, error: storageError } = await supabase
      .storage
      .from('videos')
      .list('');
      
    if (storageError) {
      console.error("Error listing files in videos bucket:", storageError);
      results.storage.error = storageError.message;
    } else {
      results.storage.success = true;
      results.storage.count = files.length;
      results.storage.samples = files.slice(0, 5);
    }
  } catch (err) {
    console.error("Error in testVideoSources:", err);
    toast.error("Video source test failed");
  }
  
  return results;
} 