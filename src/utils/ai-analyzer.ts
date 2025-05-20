
import { queryGemini } from "@/utils/gemini";
import { SavedClip } from "@/types/analyzer";
import { toast } from "sonner";

export interface VideoAnalysisResult {
  summary: string;
  keyPlays: string[];
  playerInsights: Record<string, string>;
  tacticalAnalysis: string;
  recommendations: string[];
}

export const analyzeVideoWithAI = async (
  clip: SavedClip
): Promise<VideoAnalysisResult | null> => {
  try {
    // Construct a prompt for the Gemini API
    const prompt = `
      Analyze this basketball clip with the following details:
      
      Title: ${clip.label}
      Duration: ${clip.duration} seconds
      ${clip.notes ? `Notes: ${clip.notes}` : ''}
      ${clip.tags ? `Tags: ${clip.tags.join(', ')}` : ''}
      
      Please provide:
      1. A brief summary of the clip
      2. Key plays observed (list format)
      3. Player insights for any players involved
      4. Tactical analysis of the play
      5. Recommendations for improvement
      
      Format your response as JSON with the following structure:
      {
        "summary": "Brief summary here",
        "keyPlays": ["Play 1", "Play 2"...],
        "playerInsights": {"Player Name": "Insight about this player"},
        "tacticalAnalysis": "Detailed tactical breakdown",
        "recommendations": ["Recommendation 1", "Recommendation 2"...]
      }
    `;

    console.log("Sending analysis request to Gemini API");
    const response = await queryGemini(prompt);
    console.log("Raw Gemini response:", response);
    
    // Try to extract JSON from the response
    try {
      // Check if the response contains a code block with JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      // Try to parse the JSON
      const analysisResult = JSON.parse(jsonString);
      
      // Validate required fields
      if (!analysisResult.summary || !Array.isArray(analysisResult.keyPlays)) {
        throw new Error("Invalid response format");
      }
      
      return analysisResult;
    } catch (jsonError) {
      console.error("Failed to parse Gemini response as JSON:", jsonError);
      
      // Fall back to a simpler format
      return {
        summary: response.slice(0, 200) + "...",
        keyPlays: ["Analysis could not be fully processed"],
        playerInsights: {},
        tacticalAnalysis: "Could not extract detailed analysis",
        recommendations: ["Consider reanalyzing this clip"]
      };
    }
  } catch (error) {
    console.error("Error analyzing video with AI:", error);
    toast.error("Failed to analyze video with AI");
    return null;
  }
};
