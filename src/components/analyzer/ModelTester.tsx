
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Eye, Type } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ModelTesterProps {
  videoPlayerRef?: React.RefObject<any>;
}

const ModelTester: React.FC<ModelTesterProps> = ({ videoPlayerRef }) => {
  const [roboflowApiKey, setRoboflowApiKey] = useState('');
  const [roboflowModelId, setRoboflowModelId] = useState('');
  const [googleVisionApiKey, setGoogleVisionApiKey] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [roboflowResults, setRoboflowResults] = useState<any>(null);
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [isTestingRoboflow, setIsTestingRoboflow] = useState(false);
  const [isTestingOCR, setIsTestingOCR] = useState(false);
  const [ocrProvider, setOcrProvider] = useState<string>('tesseract');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureFrame = () => {
    if (!videoPlayerRef?.current) {
      toast.error("No video loaded");
      return;
    }

    try {
      const video = videoPlayerRef.current.getVideoElement?.() || videoPlayerRef.current;
      if (!video || video.readyState < 2) {
        toast.error("Video not ready for frame capture");
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      setSelectedImage(frameData);
      toast.success("Frame captured!");
    } catch (error) {
      console.error("Error capturing frame:", error);
      toast.error("Failed to capture frame");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const testRoboflowModel = async () => {
    if (!selectedImage || !roboflowApiKey || !roboflowModelId) {
      toast.error("Please provide image, API key, and model ID");
      return;
    }

    setIsTestingRoboflow(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-roboflow-model', {
        body: {
          imageBase64: selectedImage,
          modelId: roboflowModelId,
          apiKey: roboflowApiKey,
        },
      });

      if (error) throw error;

      setRoboflowResults(data);
      toast.success("Roboflow model test completed!");
    } catch (error) {
      console.error("Error testing Roboflow model:", error);
      toast.error("Failed to test Roboflow model");
    } finally {
      setIsTestingRoboflow(false);
    }
  };

  const testOCRModel = async () => {
    if (!selectedImage) {
      toast.error("Please provide an image");
      return;
    }

    if (ocrProvider === 'google-vision' && !googleVisionApiKey) {
      toast.error("Please provide Google Vision API key");
      return;
    }

    setIsTestingOCR(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-ocr-model', {
        body: {
          imageBase64: selectedImage,
          ocrProvider,
          apiKey: ocrProvider === 'google-vision' ? googleVisionApiKey : undefined,
        },
      });

      if (error) throw error;

      setOcrResults(data);
      toast.success("OCR test completed!");
    } catch (error) {
      console.error("Error testing OCR:", error);
      toast.error("Failed to test OCR");
    } finally {
      setIsTestingOCR(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Model Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Selection */}
          <div className="space-y-4">
            <Label>Select Image for Testing</Label>
            <div className="flex gap-2">
              <Button onClick={captureFrame} variant="outline" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Capture Frame
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {selectedImage && (
              <div className="mt-4">
                <img 
                  src={selectedImage} 
                  alt="Selected for testing" 
                  className="max-w-xs max-h-48 rounded border"
                />
              </div>
            )}
          </div>

          {/* Roboflow Testing */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Roboflow Model Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roboflow-api-key">Roboflow API Key</Label>
                <Input
                  id="roboflow-api-key"
                  type="password"
                  value={roboflowApiKey}
                  onChange={(e) => setRoboflowApiKey(e.target.value)}
                  placeholder="Enter your Roboflow API key"
                />
              </div>
              <div>
                <Label htmlFor="roboflow-model-id">Model ID</Label>
                <Input
                  id="roboflow-model-id"
                  value={roboflowModelId}
                  onChange={(e) => setRoboflowModelId(e.target.value)}
                  placeholder="e.g., basketball-players/1"
                />
              </div>
            </div>
            <Button 
              onClick={testRoboflowModel} 
              disabled={isTestingRoboflow || !selectedImage}
              className="w-full"
            >
              {isTestingRoboflow ? "Testing..." : "Test Roboflow Model"}
            </Button>
            
            {roboflowResults && (
              <div className="mt-4 p-4 bg-muted rounded">
                <h4 className="font-medium mb-2">Roboflow Results:</h4>
                <pre className="text-sm overflow-auto max-h-48">
                  {JSON.stringify(roboflowResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* OCR Testing */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Type className="h-5 w-5" />
              OCR Testing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ocr-provider">OCR Provider</Label>
                <Select value={ocrProvider} onValueChange={setOcrProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tesseract">Tesseract (Simulation)</SelectItem>
                    <SelectItem value="google-vision">Google Vision API</SelectItem>
                    <SelectItem value="roboflow-ocr">Roboflow OCR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ocrProvider === 'google-vision' && (
                <div>
                  <Label htmlFor="google-vision-api-key">Google Vision API Key</Label>
                  <Input
                    id="google-vision-api-key"
                    type="password"
                    value={googleVisionApiKey}
                    onChange={(e) => setGoogleVisionApiKey(e.target.value)}
                    placeholder="Enter your Google Vision API key"
                  />
                </div>
              )}
            </div>
            <Button 
              onClick={testOCRModel} 
              disabled={isTestingOCR || !selectedImage}
              className="w-full"
            >
              {isTestingOCR ? "Testing OCR..." : "Test OCR"}
            </Button>
            
            {ocrResults && (
              <div className="mt-4 p-4 bg-muted rounded">
                <h4 className="font-medium mb-2">OCR Results:</h4>
                <pre className="text-sm overflow-auto max-h-48">
                  {JSON.stringify(ocrResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ModelTester;
