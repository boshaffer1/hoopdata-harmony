
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon } from "lucide-react";
import { Marker } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";

interface MarkersListProps {
  markers: Marker[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (index: number) => void;
  onMarkerNotesChange: (index: number, notes: string) => void;
}

const MarkersList: React.FC<MarkersListProps> = ({
  markers,
  onSeekToMarker,
  onRemoveMarker,
  onMarkerNotesChange,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Markers & Notes</CardTitle>
        <CardDescription>
          Create and manage video markers and notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {markers.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Add markers by playing the video and clicking "Mark" at specific timestamps.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {markers.map((marker, index) => (
              <li 
                key={index} 
                className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => onSeekToMarker(marker.time)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full mt-1.5" 
                      style={{ backgroundColor: marker.color }}
                    ></div>
                    <div>
                      <p className="font-medium">{marker.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatVideoTime(marker.time)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMarker(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Add notes..."
                  className="mt-2 text-sm"
                  value={marker.notes || ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    onMarkerNotesChange(index, e.target.value);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MarkersList;
