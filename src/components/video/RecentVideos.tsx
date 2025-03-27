
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileVideo, Clock, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentVideosProps {
  videos: {url: string, name: string, timestamp: number}[];
  onSelectVideo: (url: string) => void;
  className?: string;
}

const RecentVideos: React.FC<RecentVideosProps> = ({ 
  videos, 
  onSelectVideo,
  className 
}) => {
  if (!videos.length) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {videos.map((video, index) => (
            <li key={video.timestamp} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileVideo className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{video.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(video.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-shrink-0"
                onClick={() => onSelectVideo(video.url)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentVideos;
