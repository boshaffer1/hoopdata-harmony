// Google Gemini integration utility

// Replace with your actual API key or use environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiContent {
  parts: {
    text: string;
  }[];
}

interface GeminiRequestBody {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

export interface GeminiResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code?: number;
    status?: string;
  };
}

/**
 * Sends a query to Google Gemini API with basic context about basketball
 */
export async function queryGemini(
  userQuery: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not found');
    return 'Sorry, the AI service is not configured. Please add your Gemini API key to the environment variables.';
  }

  try {
    // Prepare simplified request
    const simplifiedRequest: GeminiRequestBody = {
      contents: [{
        parts: [{ text: userQuery }]
      }]
    };
    
    // Call Gemini API with the simplified request format
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simplifiedRequest)
    });

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return `Sorry, there was an error: ${data.error.message}`;
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('Gemini API returned no candidates');
      return 'Sorry, I couldn\'t generate a response. Please try again.';
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
} 