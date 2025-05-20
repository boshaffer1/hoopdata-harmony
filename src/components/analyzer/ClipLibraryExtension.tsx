
import React, { useState } from "react";
import { SavedClip } from "@/types/analyzer";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { VideoAnalysisDisplay } from "./ai/VideoAnalysisDisplay";
import { analyzeVideoWithAI, VideoAnalysisResult } from "@/utils/ai-analyzer";
import { toast } from "sonner";

interface ClipLibraryExtensionProps {
  selectedClip: SavedClip | null;
}

export const ClipLibraryExtension: React.FC<ClipLibraryExtensionProps> = ({ selectedClip }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);

  const handleAnalyzeClip = async () => {
    if (!selectedClip) {
      toast.error("Please select a clip to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeVideoWithAI(selectedClip);
      if (result) {
        setAnalysisResult(result);
        toast.success("AI analysis complete");
      }
    } catch (error) {
      console.error("Error analyzing clip:", error);
      toast.error("Failed to analyze clip");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Analysis</h3>
        <Button
          onClick={handleAnalyzeClip}
          disabled={!selectedClip || isAnalyzing}
          size="sm"
        >
          <Brain className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </div>
      
      <VideoAnalysisDisplay 
        analysis={analysisResult}
        isLoading={isAnalyzing}
        clipTitle={selectedClip?.label}
      />
    </div>
  );
};
