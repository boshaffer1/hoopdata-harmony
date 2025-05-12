import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Comprehensive data loader that fetches from all buckets
 */
export async function loadAllSupabaseData() {
  // Storage results will contain data from all buckets
  const storageResults = {
    videos: [],
    clips: [],
    thumbnails: [],
    csv_files: [],
    roster: []
  };
  
  // List of all buckets to check
  const bucketsToCheck = ['videos', 'clips', 'thumbnails', 'csv_files', 'roster'];
  
  // First check all storage buckets
  console.log("Checking all storage buckets...");
  
  // Check if we even have access to buckets
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("Error listing buckets:", bucketError);
    } else {
      console.log("Available buckets:", buckets.map(b => b.name));
    }
  } catch (err) {
    console.error("Fatal error checking buckets:", err);
  }
  
  for (const bucket of bucketsToCheck) {
    try {
      console.log(`Checking '${bucket}' bucket...`);
      const { data: files, error } = await supabase
        .storage
        .from(bucket)
        .list('', { sortBy: { column: 'created_at', order: 'desc' } });
        
      if (error) {
        console.error(`Error listing files in '${bucket}' bucket:`, error);
      } else if (files && files.length > 0) {
        console.log(`Found ${files.length} files in '${bucket}' bucket`);
        
        // Filter to only include playable video formats
        const videoFiles = files.filter(file => {
          const lowerName = file.name.toLowerCase();
          return lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || 
                 lowerName.endsWith('.webm') || lowerName.endsWith('.mkv');
        });
        
        if (videoFiles.length > 0) {
          console.log(`Found ${videoFiles.length} video files in '${bucket}'`);
          storageResults[bucket] = videoFiles;
        } else {
          storageResults[bucket] = files;
        }
        
        // Attempt to get signed URLs for a sample file to verify permissions
        if (files.length > 0) {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabase
              .storage
              .from(bucket)
              .createSignedUrl(files[0].name, 3600);
              
            if (signedUrlError) {
              console.error(`Error creating signed URL for ${bucket}/${files[0].name}:`, signedUrlError);
            } else if (signedUrlData) {
              console.log(`Successfully created signed URL for ${bucket}/${files[0].name}`);
            }
          } catch (signErr) {
            console.error(`Error testing signed URL for ${bucket}:`, signErr);
          }
        }
      } else {
        console.log(`No files found in '${bucket}' bucket`);
      }
    } catch (err) {
      console.error(`Error accessing '${bucket}' bucket:`, err);
    }
  }
  
  const unifiedClips = createUnifiedClipsArray(storageResults.videos, storageResults.clips);
  
  return {
    storage: storageResults,
    // Create a unified clips array that combines clips from all relevant buckets
    unified: {
      clips: unifiedClips
    }
  };
}

/**
 * Creates a unified array of clips from storage sources
 */
function createUnifiedClipsArray(videoFiles, clipFiles) {
  const unifiedClips = [];
  
  // First add clips from the clips bucket - these are the most important
  if (clipFiles && clipFiles.length > 0) {
    console.log(`Processing ${clipFiles.length} files from clips bucket`);
    
    // Debug the clip files 
    clipFiles.forEach((file, index) => {
      if (index < 5) { // Just log the first 5 to avoid console spam
        console.log(`Clip ${index}: ${file.name}, id: ${file.id}`);
      }
    });
    
    clipFiles.forEach(file => {
      try {
        // Extract duration from filename if possible (some systems append duration)
        let duration = 30; // Default duration
        const nameParts = file.name.split('_');
        if (nameParts.length > 1) {
          const possibleDuration = parseFloat(nameParts[nameParts.length - 1]);
          if (!isNaN(possibleDuration) && possibleDuration > 0) {
            duration = possibleDuration;
          }
        }

        unifiedClips.push({
          id: file.id || `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime: 0,
          endTime: duration,
          duration: duration,
          label: file.name,
          tags: ["clip"],
          notes: "",
          timeline: "",
          saved: file.created_at || new Date().toISOString(),
          clipPath: file.name,
          source: 'storage',
          sourceType: 'clips',
          originalData: file,
          isSupabaseClip: true,
          // Ensure we have these fields for the ClipThumbnailGrid component
          videoId: null, // Will use clipPath instead
          directVideoUrl: null // Will be generated on playback
        });
      } catch (err) {
        console.error(`Error processing clip file ${file.name}:`, err);
      }
    });
  }
  
  // Then add videos from the videos bucket
  if (videoFiles && videoFiles.length > 0) {
    console.log(`Processing ${videoFiles.length} files from videos bucket`);
    
    // Debug the video files
    videoFiles.forEach((file, index) => {
      if (index < 5) { // Just log the first 5
        console.log(`Video ${index}: ${file.name}, id: ${file.id}`);
      }
    });
    
    videoFiles.forEach(file => {
      try {
        unifiedClips.push({
          id: file.id || `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime: 0,
          endTime: 120,
          duration: 120,
          label: file.name,
          tags: ["video"],
          notes: "",
          timeline: "",
          saved: file.created_at || new Date().toISOString(),
          videoId: file.name, // This is important for loading from videos bucket
          source: 'storage',
          sourceType: 'videos',
          originalData: file,
          isSupabaseClip: true,
          // Ensure we have these fields
          clipPath: null, // Will use videoId instead
          directVideoUrl: null // Will be generated on playback
        });
      } catch (err) {
        console.error(`Error processing video file ${file.name}:`, err);
      }
    });
  }
  
  console.log(`Created unified clips array with ${unifiedClips.length} total items`);
  console.log(`- Clips from 'clips' bucket: ${unifiedClips.filter(c => c.sourceType === 'clips').length}`);
  console.log(`- Videos from 'videos' bucket: ${unifiedClips.filter(c => c.sourceType === 'videos').length}`);
  
  return unifiedClips;
} 