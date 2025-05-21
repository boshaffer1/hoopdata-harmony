
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
    console.log("Webhook payload:", data);
    
    // Clone the data to avoid modifying the original object
    const payloadData = { ...data };
    
    // If this is a video upload, include all row information
    if (payloadData.event?.includes('video_uploaded')) {
      // Include all available row information in the videoDetails
      if (payloadData.videoDetails) {
        payloadData.completeRowData = {
          ...payloadData.videoDetails,
          uploadTimestamp: new Date().toISOString(),
          rawData: payloadData.videoDetails
        };
      }
    } else if (payloadData.event?.includes('video_analyzed')) {
      // Include all analysis data
      payloadData.completeRowData = {
        ...payloadData.videoDetails,
        analysisTimestamp: new Date().toISOString(),
        rawAnalysisData: payloadData.videoDetails
      };
    }
    
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
