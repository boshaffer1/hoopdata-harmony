
import React from "react";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface BulkExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  exportFormat: "json" | "mp4" | "webm";
  onExportFormatChange: (format: "json" | "mp4" | "webm") => void;
  onExportConfirm: () => void;
  selectedClipsCount: number;
}

export const BulkExportDialog: React.FC<BulkExportDialogProps> = ({
  isOpen,
  onOpenChange,
  exportFormat,
  onExportFormatChange,
  onExportConfirm,
  selectedClipsCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Clips</DialogTitle>
          <DialogDescription>
            Choose export format for the {selectedClipsCount} selected clips
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-2">
              <Button 
                variant={exportFormat === "json" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => onExportFormatChange("json")}
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
              <Button 
                variant={exportFormat === "webm" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onExportFormatChange("webm")}
              >
                Video (WebM)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {exportFormat === "json" 
                ? "Export clip metadata as a JSON file" 
                : "Export actual video clips (may take some time)"
              }
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onExportConfirm}>
            Export {selectedClipsCount} Clips
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
