
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

    // Roboflow API endpoint
    const roboflowUrl = `https://detect.roboflow.com/${modelId}?api_key=${apiKey}`;

    console.log('Making request to Roboflow with model:', modelId);

    const response = await fetch(roboflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: cleanBase64,
    });

    console.log('Roboflow response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error:', errorText);
      throw new Error(`Roboflow API error: ${response.status} - ${errorText}`);
    }

    const detections = await response.json();
    console.log('Roboflow detections received:', detections);

    return new Response(
      JSON.stringify({
        success: true,
        detections,
        timestamp: new Date().toISOString(),
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
