
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon } from "lucide-react";
import { Marker } from "@/types/analyzer";
import { formatVideoTime } from "@/components/video/utils";

interface MarkersListProps {
  markers: Marker[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (id: string) => void;
  onMarkerNotesChange: (id: string, notes: string) => void;
  onExportAllMarkers: () => void;
}

const MarkersList: React.FC<MarkersListProps> = ({
  markers,
  onSeekToMarker,
  onRemoveMarker,
  onMarkerNotesChange,
  onExportAllMarkers,
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Markers & Notes</CardTitle>
          <CardDescription>
            Create and manage video markers and notes
          </CardDescription>
        </div>
        {markers.length > 0 && (
          <Button variant="outline" size="sm" onClick={onExportAllMarkers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
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
            {markers.map((marker) => (
              <li 
                key={marker.id} 
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
                      onRemoveMarker(marker.id);
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
                    onMarkerNotesChange(marker.id, e.target.value);
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
