
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ClipFolder } from "@/types/analyzer";

interface BulkMoveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folders: ClipFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolderClick: () => void;
  onMoveConfirm: () => void;
  selectedClipsCount: number;
}

export const BulkMoveDialog: React.FC<BulkMoveDialogProps> = ({
  isOpen,
  onOpenChange,
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolderClick,
  onMoveConfirm,
  selectedClipsCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Clips to Folder</DialogTitle>
          <DialogDescription>
            Select a destination folder for the {selectedClipsCount} selected clips
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Destination Folder</Label>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
              <div 
                className={`p-2 flex items-center gap-2 rounded-md cursor-pointer ${
                  selectedFolderId === null ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => onFolderSelect(null)}
              >
                {selectedFolderId === null && <Check className="h-4 w-4 text-primary" />}
                <span>Root (No folder)</span>
              </div>
              {folders.map(folder => (
                <div 
                  key={folder.id}
                  className={`p-2 flex items-center gap-2 rounded-md cursor-pointer ${
                    selectedFolderId === folder.id ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  {selectedFolderId === folder.id && <Check className="h-4 w-4 text-primary" />}
                  <span>{folder.name}</span>
                </div>
              ))}
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={onCreateFolderClick}
          >
            <FolderPlus className="h-4 w-4" />
            Create New Folder
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onMoveConfirm}>
            Move {selectedClipsCount} Clips
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
