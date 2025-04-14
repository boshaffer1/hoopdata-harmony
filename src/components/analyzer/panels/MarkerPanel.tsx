
import React from "react";
import MarkersList from "@/components/analyzer/MarkersList";
import { Marker } from "@/types/analyzer";

interface MarkerPanelProps {
  markers: Marker[];
  onSeekToMarker: (time: number) => void;
  onRemoveMarker: (index: number) => void;
  onMarkerNotesChange: (index: number, notes: string) => void;
  onExportAllMarkers: () => void;
}

const MarkerPanel: React.FC<MarkerPanelProps> = ({
  markers,
  onSeekToMarker,
  onRemoveMarker,
  onMarkerNotesChange,
  onExportAllMarkers
}) => {
  return (
    <MarkersList 
      markers={markers}
      onSeekToMarker={onSeekToMarker}
      onRemoveMarker={onRemoveMarker}
      onMarkerNotesChange={onMarkerNotesChange}
      onExportAllMarkers={onExportAllMarkers}
    />
  );
};

export default MarkerPanel;
