
import React from "react";
import { VideoAnalysisResult } from "@/utils/ai-analyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface VideoAnalysisDisplayProps {
  analysis: VideoAnalysisResult | null;
  isLoading: boolean;
  clipTitle?: string;
}

export const VideoAnalysisDisplay: React.FC<VideoAnalysisDisplayProps> = ({
  analysis,
  isLoading,
  clipTitle
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>Analyzing clip with Gemini AI...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyzing footage...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>
            No analysis available yet. Select a clip and click "Analyze with AI"
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground">
            AI-powered analysis will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Gemini AI Analysis</CardTitle>
            <CardDescription>
              {clipTitle ? `Analysis for: ${clipTitle}` : "Analysis results"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-2">Summary</h3>
          <p>{analysis.summary}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="key-plays">
            <AccordionTrigger className="text-sm font-medium">Key Plays</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.keyPlays.map((play, index) => (
                  <li key={index}>{play}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {Object.keys(analysis.playerInsights).length > 0 && (
            <AccordionItem value="player-insights">
              <AccordionTrigger className="text-sm font-medium">Player Insights</AccordionTrigger>
              <AccordionContent>
                {Object.entries(analysis.playerInsights).map(([player, insight], idx) => (
                  <div key={idx} className="mb-2">
                    <span className="font-medium">{player}:</span> {insight}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="tactical-analysis">
            <AccordionTrigger className="text-sm font-medium">Tactical Analysis</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{analysis.tacticalAnalysis}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recommendations">
            <AccordionTrigger className="text-sm font-medium">Recommendations</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
