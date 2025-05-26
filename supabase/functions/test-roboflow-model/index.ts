
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
    const { imageBase64, modelId, apiKey } = await req.json();

    if (!imageBase64 || !modelId || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageBase64, modelId, or apiKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the base64 string - remove data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Roboflow API endpoint - try the infer endpoint which is more commonly used
    const roboflowUrl = `https://detect.roboflow.com/${modelId}?api_key=${apiKey}&format=json`;

    console.log('Making request to Roboflow with model:', modelId);
    console.log('Using URL:', roboflowUrl);

    // Try with multipart/form-data format which Roboflow often expects
    const formData = new FormData();
    
    // Convert base64 to blob for proper form submission
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    formData.append('file', blob, 'image.jpg');

    const response = await fetch(roboflowUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Roboflow response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error:', errorText);
      
      // If multipart failed, try with base64 body as fallback
      console.log('Trying fallback method with base64 body...');
      const fallbackResponse = await fetch(roboflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: cleanBase64,
      });

      console.log('Fallback response status:', fallbackResponse.status);

      if (!fallbackResponse.ok) {
        const fallbackErrorText = await fallbackResponse.text();
        console.error('Fallback Roboflow API error:', fallbackErrorText);
        throw new Error(`Roboflow API error: ${fallbackResponse.status} - ${fallbackErrorText}`);
      }

      const fallbackDetections = await fallbackResponse.json();
      console.log('Fallback Roboflow detections received:', fallbackDetections);

      return new Response(
        JSON.stringify({
          success: true,
          detections: fallbackDetections,
          timestamp: new Date().toISOString(),
          method: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detections = await response.json();
    console.log('Roboflow detections received:', detections);

    return new Response(
      JSON.stringify({
        success: true,
        detections,
        timestamp: new Date().toISOString(),
        method: 'multipart'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-roboflow-model function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
