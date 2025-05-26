
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, ocrProvider = 'tesseract', apiKey } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let ocrResult;

    if (ocrProvider === 'google-vision' && apiKey) {
      // Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                },
                features: [
                  { type: 'TEXT_DETECTION', maxResults: 10 },
                  { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 }
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.statusText}`);
      }

      const data = await response.json();
      ocrResult = {
        provider: 'google-vision',
        text: data.responses[0]?.fullTextAnnotation?.text || '',
        detections: data.responses[0]?.textAnnotations || [],
      };
    } else if (ocrProvider === 'roboflow-ocr' && apiKey) {
      // Roboflow OCR (if they have an OCR model)
      const response = await fetch(
        `https://detect.roboflow.com/your-ocr-model-id?api_key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: imageBase64,
        }
      );

      if (!response.ok) {
        throw new Error(`Roboflow OCR API error: ${response.statusText}`);
      }

      const data = await response.json();
      ocrResult = {
        provider: 'roboflow-ocr',
        detections: data,
      };
    } else {
      // Simulated OCR for testing (replace with actual Tesseract or other OCR)
      ocrResult = {
        provider: 'tesseract-simulation',
        text: 'Simulated OCR text detection from image',
        confidence: 0.85,
        note: 'This is a simulation. Integrate with actual Tesseract.js or other OCR service.',
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        ocr: ocrResult,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-ocr-model function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
