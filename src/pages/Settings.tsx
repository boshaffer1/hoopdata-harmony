
import React from "react";
import Layout from "@/components/layout/Layout";
import { WebhookConfig } from "@/components/ui/webhook-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Settings = () => {
  const handleWebhookConfigSaved = () => {
    toast.success("Webhook configuration saved successfully");
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure PlayWise settings and integrations
        </p>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        
        <TabsContent value="webhooks" className="space-y-6">
          <div className="max-w-2xl">
            <WebhookConfig onConfigSaved={handleWebhookConfigSaved} />
          </div>
          
          <div className="p-4 border rounded-md bg-muted/40 max-w-2xl">
            <h3 className="font-medium mb-2">Webhook Event Format</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your n8n workflow will receive the following data structure:
            </p>
            <pre className="p-3 rounded bg-background text-xs overflow-auto">
              {JSON.stringify({
                event: "video_uploaded",
                timestamp: new Date().toISOString(),
                videoDetails: {
                  url: "https://example.com/video.mp4",
                  fileName: "game_footage.mp4",
                  fileSize: 15000000
                }
              }, null, 2)}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="ai">
          <div className="max-w-2xl space-y-6">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">AI Analysis Settings</h3>
              <p className="text-sm text-muted-foreground">
                PlayWise uses Gemini AI to analyze basketball clips and provide insights.
              </p>
              {/* We'll add AI settings here in future updates */}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="general">
          <div className="max-w-2xl">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">General Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure general application settings and preferences.
              </p>
              {/* We'll add general settings here in future updates */}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
