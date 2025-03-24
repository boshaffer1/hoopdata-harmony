
import React from "react";
import Layout from "@/components/layout/Layout";
import ClipAssistant from "@/components/analyzer/ai/ClipAssistant";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";

const Assistant = () => {
  const { savedClips, handlePlaySavedClip } = useAnalyzer();

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
