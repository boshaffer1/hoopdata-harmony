
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Target, Timer } from "lucide-react";

interface Detection {
  id: string;
  timestamp: number;
  jerseyNumber?: number;
  confidence: number;
  playerName?: string;
  action?: string;
}

interface RealTimeStatsProps {
  isAnalyzing?: boolean;
  onDetectionUpdate?: (detection: Detection) => void;
}

const RealTimeStats: React.FC<RealTimeStatsProps> = ({ 
  isAnalyzing = false, 
  onDetectionUpdate 
}) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [uniqueJerseys, setUniqueJerseys] = useState<Set<number>>(new Set());
  const [averageConfidence, setAverageConfidence] = useState<number>(0);
  const [detectionRate, setDetectionRate] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Simulate real-time detections when analyzing
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      const newDetection: Detection = {
        id: `detection-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        playerName: `Player ${Math.floor(Math.random() * 15) + 1}`,
        action: ['shot', 'pass', 'dribble', 'rebound', 'steal'][Math.floor(Math.random() * 5)]
      };

      setDetections(prev => {
        const updated = [...prev, newDetection].slice(-50); // Keep last 50 detections
        
        // Update unique jerseys
        const jerseys = new Set<number>();
        updated.forEach(d => {
          if (d.jerseyNumber) jerseys.add(d.jerseyNumber);
        });
        setUniqueJerseys(jerseys);
        
        // Update average confidence
        const avgConf = updated.reduce((sum, d) => sum + d.confidence, 0) / updated.length;
        setAverageConfidence(avgConf);
        
        // Update detection rate (detections per second)
        const timeElapsed = (Date.now() - startTime) / 1000;
        setDetectionRate(updated.length / timeElapsed);
        
        return updated;
      });

      if (onDetectionUpdate) {
        onDetectionUpdate(newDetection);
      }
    }, Math.random() * 2000 + 500); // Random interval between 0.5-2.5 seconds

    return () => clearInterval(interval);
  }, [isAnalyzing, onDetectionUpdate, startTime]);

  // Reset stats when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setDetections([]);
      setUniqueJerseys(new Set());
      setAverageConfidence(0);
      setDetectionRate(0);
      setStartTime(Date.now());
    }
  }, [isAnalyzing]);

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Real-Time Analysis Stats
            {isAnalyzing && (
              <Badge variant="secondary" className="animate-pulse">
                Analyzing...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Detections</span>
              </div>
              <span className="text-2xl font-bold">{detections.length}</span>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Unique Jerseys</span>
              </div>
              <span className="text-2xl font-bold">{uniqueJerseys.size}</span>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Avg Confidence</span>
              </div>
              <span className="text-2xl font-bold">
                {averageConfidence > 0 ? formatConfidence(averageConfidence) : '0%'}
              </span>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Detection Rate</span>
              </div>
              <span className="text-2xl font-bold">
                {detectionRate.toFixed(1)}/s
              </span>
            </div>
          </div>

          {/* Jersey Numbers List */}
          {uniqueJerseys.size > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Detected Jersey Numbers</h4>
              <div className="flex flex-wrap gap-1">
                {Array.from(uniqueJerseys).sort((a, b) => a - b).map(jersey => (
                  <Badge key={jersey} variant="outline" className="text-xs">
                    #{jersey}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Detections */}
          {detections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Detections</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {detections.slice(-5).reverse().map(detection => (
                  <div 
                    key={detection.id} 
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{detection.jerseyNumber}
                      </Badge>
                      <span>{detection.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(detection.confidence)}`}
                      />
                      <span className="font-mono">
                        {formatConfidence(detection.confidence)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isAnalyzing && detections.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start video analysis to see real-time stats</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
