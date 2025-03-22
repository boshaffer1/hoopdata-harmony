
import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ClipAssistant from "@/components/analyzer/ai/ClipAssistant";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

const Assistant = () => {
  const { 
    savedClips, 
    handlePlaySavedClip,
    addDemoClipsIfNeeded
  } = useAnalyzer();

  // Check if we have clips available
  useEffect(() => {
    console.log("Assistant page loaded with", savedClips.length, "clips");
  }, [savedClips]);

  const handleAddDemoClips = () => {
    const added = addDemoClipsIfNeeded();
    if (added.length > 0) {
      toast.success(`Added ${added.length} demo clips to your library`);
    } else {
      toast.info("Demo clips are already in your library");
    }
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Intelligent clip search and analysis powered by AI
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1">
          <ClipAssistant 
            savedClips={savedClips}
            onPlayClip={handlePlaySavedClip}
          />
          
          {savedClips.length === 0 && (
            <div className="mt-4">
              <Button onClick={handleAddDemoClips} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Demo Clips
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Add some sample clips to try out the assistant
              </p>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Tips for using the AI Assistant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ask questions in natural language to find specific clips in your library.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Example queries:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>"Show me all clips with Jayson Tatum"</li>
                <li>"Find fast break situations from the third quarter"</li>
                <li>"Get clips where players are shooting three pointers"</li>
                <li>"Show defensive plays from the last game"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Assistant;
