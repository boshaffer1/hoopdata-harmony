import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * VIDEO FORMAT COMPATIBILITY NOTES
 * 
 * The application is experiencing issues with MP4 video playback due to these common problems:
 * 
 * 1. MP4 codec compatibility - Some MP4 files use codecs not supported in all browsers
 * 2. Cache-related issues - Complex URLs with cache parameters cause errors
 * 3. Streaming inefficiency - MP4 requires more buffering than WebM
 * 
 * SOLUTIONS IMPLEMENTED:
 * 
 * 1. Prioritize WebM format - Always check for .webm versions first
 * 2. Simplified URLs - Remove cache parameters that cause errors
 * 3. Better error handling - Detect codec issues and suggest WebM conversion
 * 4. Infinite loop prevention - Added detection for rapid seeking issues
 * 
 * RECOMMENDED BEST PRACTICES:
 * 
 * 1. Convert all MP4 videos to WebM using the built-in converter
 * 2. For future uploads, use WebM format with VP9 codec
 * 3. If MP4 is required, ensure H.264 codec is used (most compatible)
 * 4. Generate WebP thumbnails for better performance
 */

/**
 * Fetches clips from Supabase with error handling
 */
export async function fetchClipsFromSupabase() {
  try {
    console.log("Testing Supabase connection...");
    
    // First, test the connection by getting bucket info
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('videos');
      
    if (bucketError) {
      console.error("Supabase connection error (bucket test):", bucketError);
      // Continue anyway, as tables might still work
    } else {
      console.log("Supabase bucket connection successful:", bucketData);
    }
    
    // Now try to get clips
    const { data: clips, error: clipsError } = await supabase
      .from('Clips')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (clipsError) {
      console.error("Error fetching clips from Supabase:", clipsError);
      // If clips table doesn't exist or no access, try video_files instead
    } else if (clips && clips.length > 0) {
      console.log(`Found ${clips.length} clips in database`);
      return clips;
    }
    
    // If no clips were found or there was an error, check videos instead
    console.log("No clips found or error occurred, trying video_files table...");
    const { data: videoFiles, error: videoError } = await supabase
      .from('video_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (videoError) {
      console.error("Failed to fetch videos:", videoError);
      
      // As a last resort, try to get videos directly from storage
      try {
        console.log("Trying to list videos from storage...");
        const { data: storageFiles, error: storageError } = await supabase
          .storage
          .from('videos')
          .list('');
          
        if (storageError || !storageFiles || storageFiles.length === 0) {
          console.error("No videos found in storage:", storageError);
          throw new Error("No clips or videos found");
        }
        
        console.log(`Found ${storageFiles.length} video files in storage`);
        // Convert storage files to clip format
        return storageFiles.map(file => ({
          id: file.id,
          play_name: file.name,
          start_time: 0,
          end_time: 120, // Default 2 minute clip
          video_id: file.name,
          video_url: null,
          clip_path: file.name,
          tags: [],
          created_at: file.created_at
        }));
      } catch (storageErr) {
        console.error("Error accessing storage:", storageErr);
        throw new Error("Unable to access clips or videos");
      }
    }
    
    if (!videoFiles || videoFiles.length === 0) {
      console.error("No video files found in database");
      throw new Error("No clips or videos found");
    }
    
    // Convert video files to clip format
    console.log(`Found ${videoFiles.length} video files in database, converting to clips`);
    return videoFiles.map(video => ({
      id: video.id,
      play_name: video.title || video.filename || video.file_path || "Untitled video",
      start_time: 0,
      end_time: 120, // Default to 2 minutes since duration is not in the type
      video_id: video.id,
      video_url: video.video_url || null,
      clip_path: video.file_path,
      tags: [], // Default to empty tags array since tags isn't in the type
      created_at: video.created_at
    }));
  } catch (error) {
    console.error("Error in fetchClipsFromSupabase:", error);
    
    // Return empty array instead of sample data
    return [];
  }
}

/**
 * Fetches video files from Supabase with error handling
 */
export async function fetchVideoFilesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('video_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching video files:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchVideoFilesFromSupabase:", error);
    return [];
  }
}

/**
 * Gets a public URL for a file in a public Supabase bucket (much faster than signed URLs)
 */
export function getPublicUrl(bucket: string, path: string) {
  if (!path) {
    console.error("❌ Cannot create public URL: path is empty or undefined");
    return null;
  }
  
  try {
    // First check if we can use the direct public URL pattern which is faster
    // Format: https://[project_id].supabase.co/storage/v1/object/public/[bucket]/[asset-name]
    const directPublicUrl = `https://nnmtqoxrygesqiapdmkb.supabase.co/storage/v1/object/public/${bucket}/${path.replace(/ /g, '%20')}`;
    
    console.log(`✅ Generated direct public URL for ${bucket}/${path}`);
    
    // Add cache busting parameter for freshness
    const publicUrl = new URL(directPublicUrl);
    publicUrl.searchParams.append('_cb', Date.now().toString());
    
    return publicUrl.toString();
  } catch (error) {
    // Fall back to the SDK method
    try {
      // Use the Supabase client to generate a public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      
      if (data?.publicUrl) {
        // Add cache busting parameter for freshness
        const publicUrl = new URL(data.publicUrl);
        publicUrl.searchParams.append('_cb', Date.now().toString());
        
        console.log(`✅ Got public URL for ${bucket}/${path}`);
        return publicUrl.toString();
      }
    } catch (err) {
      console.error(`❌ Error getting public URL for ${bucket}/${path}:`, err);
    }
    
    return null;
  }
}

/**
 * Try to get a WebM version of a video if available
 * WebM offers better compatibility across browsers
 */
function getWebMVersion(url: string): string {
  // If the URL already points to a WebM file, just return it
  if (url.toLowerCase().includes('.webm')) {
    return url;
  }
  
  try {
    // Try to convert .mp4 or .mov URLs to .webm if they might exist
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Check if the URL ends with .mp4 or .mov
    if (path.toLowerCase().endsWith('.mp4')) {
      const webmPath = path.substring(0, path.length - 4) + '.webm';
      urlObj.pathname = webmPath;
      console.log(`Trying WebM version: ${urlObj.toString().substring(0, 60)}...`);
      return urlObj.toString();
    } else if (path.toLowerCase().endsWith('.mov')) {
      const webmPath = path.substring(0, path.length - 4) + '.webm';
      urlObj.pathname = webmPath;
      console.log(`Trying WebM version: ${urlObj.toString().substring(0, 60)}...`);
      return urlObj.toString();
    }
  } catch (e) {
    console.error("Error generating WebM URL variant:", e);
  }
  
  // If conversion fails or not applicable, return the original URL
  return url;
}

/**
 * Gets the best URL for a file in Supabase storage, trying public URL first
 * then falling back to signed URL if needed. Also tries WebM format if available.
 */
export async function getBestStorageUrl(bucket: string, path: string, expiresIn: number = 86400) {
  console.log(`Getting best storage URL for ${bucket}/${path}`);
  
  if (!path) {
    console.error("❌ Cannot get URL: path is empty or undefined");
    return null;
  }
  
  // Try WebM version of the file if the path is MOV or MP4
  const lowerPath = path.toLowerCase();
  let webmPath = null;
  
  // First, try to get WebM version if the path is an MP4 or MOV file
  if (lowerPath.endsWith('.mp4') || lowerPath.endsWith('.mov')) {
    webmPath = path.substring(0, path.length - 4) + '.webm';
    
    // Try direct WebM URL first (most compatible format)
    const directWebmUrl = `https://nnmtqoxrygesqiapdmkb.supabase.co/storage/v1/object/public/${bucket}/${encodeURIComponent(webmPath)}`;
    console.log(`🔍 Trying WebM version first: ${directWebmUrl.substring(0, 60)}...`);
    
    try {
      // Use a simple HEAD request without complex options
      const webmResponse = await fetch(directWebmUrl, { 
        method: 'HEAD',
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (webmResponse.ok) {
        console.log(`✅ WebM version available: ${bucket}/${webmPath}`);
        return directWebmUrl; // Return clean URL without cache parameters
      }
    } catch (e) {
      console.log(`WebM version check error: ${e.message}`);
    }
  }
  
  // If WebM not available or not applicable, use the original format with a direct URL
  const directUrl = `https://nnmtqoxrygesqiapdmkb.supabase.co/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
  console.log(`Using direct URL: ${directUrl.substring(0, 60)}...`);
  
  // Check if this URL is accessible
  try {
    const response = await fetch(directUrl, { 
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (response.ok) {
      console.log(`✅ Direct public URL works for ${bucket}/${path}`);
      return directUrl; // Return simple direct URL
    }
  } catch (e) {
    console.log(`Direct URL check error: ${e.message}`);
  }
  
  // If direct URLs failed, fall back to signed URL
  console.log("Direct URLs unavailable, trying signed URL...");
  
  try {
    // Create a signed URL without any timeout race conditions
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
      
    if (error) {
      console.error(`Error creating signed URL: ${error.message}`);
      return directUrl; // Fall back to direct URL as last resort
    }
    
    if (data?.signedUrl) {
      // Return the signed URL without adding cache parameters
      return data.signedUrl;
    }
  } catch (e) {
    console.error(`Exception in createSignedUrl: ${e.message}`);
  }
  
  // Last resort: return the direct URL
  return directUrl;
}

/**
 * Creates a signed URL for Supabase storage
 */
export async function createSignedUrl(bucket: string, path: string, expiresIn: number = 86400) {
  console.log(`Creating signed URL for bucket: '${bucket}', path: '${path}'`);
  
  if (!path) {
    console.error("❌ Cannot create signed URL: path is empty or undefined");
    return null;
  }
  
  // Check URL cache first
  const cacheKey = `signed_url:${bucket}:${path}`;
  const cachedUrl = localStorage.getItem(cacheKey);
  
  if (cachedUrl) {
    try {
      const cachedData = JSON.parse(cachedUrl);
      // Check if the cached URL is still valid (has at least 30 minutes left)
      if (cachedData.expires > Date.now() + (30 * 60 * 1000)) {
        console.log(`✅ Using cached signed URL for ${bucket}/${path}`);
        return cachedData.url;
      } else {
        console.log(`Cached URL for ${bucket}/${path} has expired or will expire soon`);
      }
    } catch (e) {
      console.error("Error parsing cached URL:", e);
    }
  }
  
  try {
    // Now create the signed URL
    console.log(`Requesting signed URL for ${bucket}/${path}...`);
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
      
    if (error) {
      console.error(`❌ Error creating signed URL for ${bucket}/${path}:`, error);
      
      // Check for common policy issues
      if (error.message.includes('The resource was not found') || 
          error.message.includes('Not Found')) {
        console.error(`❌ Resource not found - ensure file exists in bucket and path is correct`);
        toast.error(`Could not find ${path} in ${bucket} bucket`);
      } 
      else if (error.message.includes('permission denied') || 
               error.message.includes('denied by policy')) {
        console.error(`
        ❌ POLICY ERROR: Permission denied accessing ${bucket}/${path}
        
        Ensure you have the following policy in your Supabase project:
        
        CREATE POLICY "Public can view ${bucket}" ON storage.objects
          FOR SELECT
          TO anon
          USING (bucket_id = '${bucket}');
        `);
        toast.error(`Permission denied accessing ${bucket}/${path}`);
      }
      
      throw error;
    }
    
    if (!data?.signedUrl) {
      console.error(`❌ No signed URL returned for ${bucket}/${path}`);
      return null;
    }
    
    // Add cache busting parameter to ensure fresh content
    const signedUrl = new URL(data.signedUrl);
    signedUrl.searchParams.append('_cb', Date.now().toString());
    
    const finalUrl = signedUrl.toString();
    console.log(`✅ Successfully created signed URL for ${bucket}/${path}`);
    console.log(`URL starts with: ${finalUrl.substring(0, 50)}...`);
    
    // Cache the URL with expiration time
    try {
      const expiresAt = Date.now() + (expiresIn * 1000);
      localStorage.setItem(cacheKey, JSON.stringify({
        url: finalUrl,
        expires: expiresAt
      }));
    } catch (e) {
      console.error("Error caching signed URL:", e);
    }
    
    return finalUrl;
  } catch (error) {
    console.error(`❌ Exception in createSignedUrl for ${bucket}/${path}:`, error);
    toast.error(`Error accessing ${bucket}/${path}`);
    return null;
  }
}

/**
 * Uploads a file to Supabase storage with progress tracking
 */
export async function uploadFileToSupabase(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  try {
    // For large files, use chunk upload
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return await uploadLargeFileInChunks(bucket, path, file, onProgress);
    }
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
    
    if (onProgress) onProgress(100);
    return data.path;
  } catch (error) {
    console.error("Error in uploadFileToSupabase:", error);
    toast.error("Failed to upload file");
    return null;
  }
}

/**
 * Uploads a large file in chunks to show progress
 */
async function uploadLargeFileInChunks(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const tempFileName = `${path}.part${i}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(tempFileName, chunk, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }
    
    // Final upload with the complete file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    // Clean up temporary chunks
    for (let i = 0; i < totalChunks; i++) {
      const tempFileName = `${path}.part${i}`;
      await supabase.storage
        .from(bucket)
        .remove([tempFileName]);
    }
    
    return data.path;
  } catch (error) {
    console.error("Error uploading file in chunks:", error);
    toast.error("Failed to upload file");
    return null;
  }
}

/**
 * Converts Supabase clip data to the local SavedClip format
 */
export function convertSupabaseClipToSavedClip(clip: any) {
  return {
    id: clip.id,
    startTime: clip.start_time,
    duration: clip.end_time - clip.start_time,
    label: clip.play_name,
    notes: "",
    timeline: "",
    saved: new Date().toISOString(),
    tags: clip.tags || [],
    videoId: clip.video_id,
    videoUrl: clip.video_url,
    clipPath: clip.clip_path,
    isSupabaseClip: true
  };
}

/**
 * Utility function to clean expired signed URLs from local storage
 */
export function cleanExpiredSignedUrls() {
  console.log("Cleaning expired signed URLs from cache");
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    // Find all signed_url cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('signed_url:')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            // If the URL is expired, mark it for removal
            if (data.expires < now) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          console.error(`Error processing cache key ${key}:`, e);
          // If we can't parse it, consider it invalid and remove it
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove the expired keys
    if (keysToRemove.length > 0) {
      console.log(`Removing ${keysToRemove.length} expired signed URLs from cache`);
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } else {
      console.log("No expired signed URLs found in cache");
    }
    
    return keysToRemove.length;
  } catch (e) {
    console.error("Error cleaning expired signed URLs:", e);
    return 0;
  }
}

/**
 * Converts video to WebM format using browser-based conversion
 * This allows converting existing MP4 videos to the more efficient WebM format
 * @param videoBlob The video blob to convert
 * @param onProgress Optional progress callback
 * @returns Promise with the converted WebM blob
 */
export async function convertToWebM(
  videoBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting WebM conversion...");
      
      // Create a video element to decode the original video
      const video = document.createElement('video');
      video.muted = true;
      
      // Create a canvas to capture frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context for WebM conversion"));
        return;
      }
      
      // Set up video metadata loading
      video.onloadedmetadata = () => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Create MediaRecorder with WebM options
        const stream = canvas.captureStream(30); // 30fps
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9', // VP9 for better quality/size ratio
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });
        
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        recorder.onstop = () => {
          const webmBlob = new Blob(chunks, { type: 'video/webm' });
          console.log(`WebM conversion complete: ${(webmBlob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(webmBlob);
        };
        
        // Frame capture function to run on each animation frame
        let frameCount = 0;
        const totalFrames = video.duration * 30; // Approx frames at 30fps
        
        const captureFrame = () => {
          if (video.ended || video.paused) {
            recorder.stop();
            return;
          }
          
          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Update conversion progress
          frameCount++;
          if (onProgress && totalFrames > 0) {
            const progress = Math.min(frameCount / totalFrames, 1);
            onProgress(progress);
          }
          
          // Request next frame
          requestAnimationFrame(captureFrame);
        };
        
        // Start recording and playback
        recorder.start(100); // Collect data in 100ms chunks
        video.play().then(() => {
          requestAnimationFrame(captureFrame);
        }).catch(err => {
          reject(new Error(`Failed to play video for conversion: ${err.message}`));
        });
      };
      
      // Handle errors
      video.onerror = () => {
        reject(new Error("Error loading video for WebM conversion"));
      };
      
      // Load the video blob
      video.src = URL.createObjectURL(videoBlob);
    } catch (err) {
      console.error("WebM conversion error:", err);
      reject(err);
    }
  });
}

/**
 * Convert MP4 video to WebP image (for thumbnails)
 * @param videoBlob The video blob to create thumbnail from
 * @param timeOffset Time in seconds to capture thumbnail (default: 1s)
 * @param quality WebP quality (0-1, default: 0.8)
 * @returns Promise with WebP blob
 */
export async function createWebPThumbnail(
  videoBlob: Blob,
  timeOffset: number = 1,
  quality: number = 0.8
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    try {
      // Create video element
      const video = document.createElement('video');
      video.muted = true;
      
      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context for WebP creation"));
        return;
      }
      
      // When metadata is loaded, set dimensions
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to specified time
        video.currentTime = Math.min(timeOffset, video.duration - 0.1);
      };
      
      // When seeked to the right position, capture frame
      video.onseeked = () => {
        // Draw the frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to WebP
        canvas.toBlob((blob) => {
          if (blob) {
            console.log(`WebP thumbnail created: ${(blob.size / 1024).toFixed(2)}KB`);
            resolve(blob);
          } else {
            reject(new Error("Failed to create WebP thumbnail"));
          }
        }, 'image/webp', quality);
      };
      
      // Handle errors
      video.onerror = () => {
        reject(new Error("Error loading video for WebP conversion"));
      };
      
      // Load the video blob
      video.src = URL.createObjectURL(videoBlob);
      video.load();
    } catch (err) {
      console.error("WebP conversion error:", err);
      reject(err);
    }
  });
}
