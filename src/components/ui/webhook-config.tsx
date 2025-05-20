
import { useState, useEffect } from "react";
import { getWebhookConfig, saveWebhookConfig } from "@/utils/webhook-handler";
import { Button } from "./button";
import { Input } from "./input";
import { Switch } from "./switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

interface WebhookConfigProps {
  onConfigSaved?: () => void;
}

export const WebhookConfig = ({ onConfigSaved }: WebhookConfigProps) => {
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    const config = getWebhookConfig();
    setUrl(config.url);
    setEnabled(config.enabled);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    try {
      // Validate URL
      if (enabled && (!url || !url.startsWith('http'))) {
        throw new Error("Please enter a valid URL");
      }
      
      saveWebhookConfig({ url, enabled });
      
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error("Error saving webhook config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>n8n Webhook Configuration</CardTitle>
        <CardDescription>
          Configure your n8n webhook to trigger when videos are uploaded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="webhook-url" className="text-sm font-medium">
            Webhook URL
          </label>
          <Input
            id="webhook-url"
            placeholder="https://your-n8n-instance.com/webhook/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="webhook-enabled" className="text-sm font-medium">
              Enable Webhook
            </label>
            <p className="text-sm text-muted-foreground">
              Automatically trigger the webhook when videos are uploaded
            </p>
          </div>
          <Switch
            id="webhook-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};
