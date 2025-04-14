
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  folderDescription: string;
  onFolderNameChange: (value: string) => void;
  onFolderDescriptionChange: (value: string) => void;
  onCreateConfirm: () => void;
  autoOrganize?: boolean;
  onAutoOrganizeChange?: (value: boolean) => void;
  isPlayNameFolder?: boolean;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onOpenChange,
  folderName,
  folderDescription,
  onFolderNameChange,
  onFolderDescriptionChange,
  onCreateConfirm,
  autoOrganize = false,
  onAutoOrganizeChange,
  isPlayNameFolder = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            {isPlayNameFolder 
              ? "Create a folder for clips with the same play name" 
              : "Create a new folder and move the selected clips"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              placeholder="Enter folder name"
              disabled={isPlayNameFolder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={folderDescription}
              onChange={(e) => onFolderDescriptionChange(e.target.value)}
              placeholder="Enter folder description"
              rows={3}
            />
          </div>
          
          {onAutoOrganizeChange && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="autoOrganize" 
                checked={autoOrganize}
                onCheckedChange={(checked) => 
                  onAutoOrganizeChange(checked === true)
                }
              />
              <Label htmlFor="autoOrganize" className="text-sm cursor-pointer">
                Auto-organize similar clips into play name folders
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onCreateConfirm}>
            {isPlayNameFolder ? "Create Play Folder" : "Create and Move Clips"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
