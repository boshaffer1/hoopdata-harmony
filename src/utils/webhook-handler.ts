
import { toast } from "sonner";

interface WebhookConfig {
  url: string;
  enabled: boolean;
}

// Store webhook configuration in localStorage for persistence
const WEBHOOK_CONFIG_KEY = 'playwise_webhook_config';

export const getWebhookConfig = (): WebhookConfig => {
  try {
    const stored = localStorage.getItem(WEBHOOK_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error retrieving webhook config:", e);
  }
  
  // Default to enabled with the provided webhook URL
  return {
    url: 'https://playswise.app.n8n.cloud/webhook-test/analyze',
    enabled: true
  };
};

export const saveWebhookConfig = (config: WebhookConfig): void => {
  try {
    localStorage.setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Error saving webhook config:", e);
  }
};

export const triggerWebhook = async (data: any): Promise<boolean> => {
  const config = getWebhookConfig();
  
  if (!config.enabled || !config.url) {
    console.log("Webhook not configured or disabled");
    return false;
  }
  
  try {
    console.log(`Triggering n8n webhook: ${config.url}`);
    console.log("Original webhook payload:", data);
    
    // Clone the data to avoid modifying the original object
    const payloadData = { ...data };
    
    // BLOB URL FIX: Check for and handle blob URLs in all possible locations
    const fixBlobUrl = (obj: any, propPath: string) => {
      const props = propPath.split('.');
      let current = obj;
      
      // Navigate to the nested property
      for (let i = 0; i < props.length - 1; i++) {
        if (current && typeof current === 'object' && props[i] in current) {
          current = current[props[i]];
        } else {
          return; // Path doesn't exist
        }
      }
      
      // Get the final property name
      const finalProp = props[props.length - 1];
      
      // Check if property exists and starts with 'blob:'
      if (current && typeof current === 'object' && finalProp in current && 
          typeof current[finalProp] === 'string' && current[finalProp].startsWith('blob:')) {
        
        console.warn(`Found blob URL in ${propPath}, replacing with stored URL if available`);
        
        // First try to use an available storedUrl
        if (current.storedUrl && typeof current.storedUrl === 'string' && 
            current.storedUrl.startsWith('http')) {
          console.log(`Replacing blob URL with storedUrl: ${current.storedUrl}`);
          current[finalProp] = current.storedUrl;
        } 
        // Then try to use video_url from completeRowData if available
        else if (obj.completeRowData?.videoFile?.video_url) {
          console.log(`Replacing blob URL with videoFile.video_url: ${obj.completeRowData.videoFile.video_url}`);
          current[finalProp] = obj.completeRowData.videoFile.video_url;
        }
        // If no proper URL is available, remove the blob URL
        else {
          console.warn(`No valid URL found to replace blob URL in ${propPath}, removing it`);
          delete current[finalProp];
          current.urlRemoved = true;
        }
      }
    };
    
    // Check all common places for blob URLs
    if (payloadData.videoDetails) {
      fixBlobUrl(payloadData, 'videoDetails.publicUrl');
      fixBlobUrl(payloadData, 'videoDetails.tempUrl');
      
      // Ensure we're using the stored URL as the main URL
      if (payloadData.videoDetails.storedUrl && 
          typeof payloadData.videoDetails.storedUrl === 'string' && 
          payloadData.videoDetails.storedUrl.startsWith('http')) {
        payloadData.videoDetails.publicUrl = payloadData.videoDetails.storedUrl;
      }
    }
    
    // If this is a video upload, include all row information and ensure proper URLs
    if (payloadData.event?.includes('video_uploaded')) {
      // Include all available row information in the videoDetails
      if (payloadData.completeRowData?.videoFile?.video_url) {
        // Ensure we're using the Supabase URL, not a blob URL
        const supabaseUrl = payloadData.completeRowData.videoFile.video_url;
        
        if (payloadData.videoDetails) {
          payloadData.videoDetails.publicUrl = supabaseUrl;
          payloadData.videoDetails.storedUrl = supabaseUrl;
        }
        
        // Include timestamp and make sure any URLs are actual URLs, not blob references
        payloadData.completeRowData = {
          ...payloadData.completeRowData,
          uploadTimestamp: new Date().toISOString(),
          videoUrl: supabaseUrl
        };
      }
    }
    
    console.log("Processed webhook payload:", payloadData);
    
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // To avoid CORS issues with n8n webhooks
      body: JSON.stringify(payloadData),
    });
    
    // Since we're using no-cors mode, we won't get a proper response
    toast.success("Webhook triggered successfully");
    return true;
  } catch (error) {
    console.error("Error triggering webhook:", error);
    toast.error("Failed to trigger webhook");
    return false;
  }
};
