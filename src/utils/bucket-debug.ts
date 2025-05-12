import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Tests access to all Supabase storage buckets and returns detailed results
 */
export async function testAllBuckets() {
  const bucketsToTest = [
    'videos',
    'clips', 
    'thumbnails',
    'csv_files',
    'roster'
  ];
  
  // First test if we can list buckets at all
  console.log("Testing bucket listing...");
  try {
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error("❌ Cannot list buckets:", bucketsError);
      toast.error("Cannot list buckets");
      return {
        canListBuckets: false,
        error: bucketsError.message,
        bucketResults: {}
      };
    }
    
    console.log("✅ Successfully listed buckets:", buckets);
    
    // Test each bucket individually
    const bucketResults = {};
    
    for (const bucketName of bucketsToTest) {
      console.log(`Testing access to '${bucketName}' bucket...`);
      
      // 1. Check if bucket exists
      const bucketExists = buckets.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.warn(`⚠️ Bucket '${bucketName}' does not exist`);
        bucketResults[bucketName] = {
          exists: false,
          canList: false,
          error: "Bucket does not exist"
        };
        continue;
      }
      
      // 2. Try to list files
      try {
        const { data: files, error: listError } = await supabase
          .storage
          .from(bucketName)
          .list('');
          
        if (listError) {
          console.error(`❌ Cannot list files in '${bucketName}':`, listError);
          bucketResults[bucketName] = {
            exists: true,
            canList: false,
            error: listError.message
          };
        } else {
          console.log(`✅ Successfully listed files in '${bucketName}':`, files?.length || 0, "files");
          
          // 3. If files exist, try to get a URL for the first file
          let urlTest = null;
          
          if (files && files.length > 0) {
            try {
              const { data: urlData, error: urlError } = await supabase
                .storage
                .from(bucketName)
                .createSignedUrl(files[0].name, 60);
                
              if (urlError) {
                console.error(`❌ Cannot create URL for file in '${bucketName}':`, urlError);
                urlTest = {
                  success: false,
                  error: urlError.message
                };
              } else {
                console.log(`✅ Successfully created URL for file in '${bucketName}'`);
                urlTest = {
                  success: true,
                  url: urlData.signedUrl
                };
              }
            } catch (err) {
              console.error(`❌ Error testing URL in '${bucketName}':`, err);
              urlTest = {
                success: false,
                error: err.message
              };
            }
          }
          
          bucketResults[bucketName] = {
            exists: true,
            canList: true,
            fileCount: files?.length || 0,
            urlTest
          };
        }
      } catch (err) {
        console.error(`❌ Error accessing '${bucketName}' bucket:`, err);
        bucketResults[bucketName] = {
          exists: true,
          canList: false,
          error: err.message
        };
      }
    }
    
    return {
      canListBuckets: true,
      bucketsList: buckets,
      bucketResults
    };
    
  } catch (err) {
    console.error("❌ Error testing buckets:", err);
    toast.error("Error testing bucket access");
    return {
      canListBuckets: false,
      error: err.message,
      bucketResults: {}
    };
  }
} 