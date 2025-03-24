
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { FolderIcon, FolderPlus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipFolder } from "@/types/analyzer";

interface FolderListProps {
  folders: ClipFolder[];
  activeFolder: string | null;
  onCreateFolder: (name: string, description: string) => void;
  onUpdateFolder: (id: string, updates: Partial<ClipFolder>) => void;
  onDeleteFolder: (id: string) => void;
  onSelectFolder: (id: string | null) => void;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  activeFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onSelectFolder
}) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [editingFolder, setEditingFolder] = useState<ClipFolder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName, newFolderDescription);
      setNewFolderName("");
      setNewFolderDescription("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolder && editingFolder.name.trim()) {
      onUpdateFolder(editingFolder.id, {
        name: editingFolder.name,
        description: editingFolder.description
      });
      setEditingFolder(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditClick = (folder: ClipFolder) => {
    setEditingFolder({ ...folder });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your clips
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* All Clips option */}
      <div 
        className={`p-3 rounded-md cursor-pointer transition-colors flex items-center gap-2 ${
          activeFolder === null 
            ? 'bg-primary/10 border border-primary/30' 
            : 'hover:bg-muted border border-transparent'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <FolderIcon className="h-5 w-5 text-primary" />
        <span className="font-medium">All Clips</span>
      </div>

      {/* Folder list */}
      {folders.length > 0 ? (
        <div className="space-y-2">
          {folders.map((folder) => (
            <div 
              key={folder.id}
              className={`p-3 rounded-md border hover:bg-muted/50 transition-colors ${
                activeFolder === folder.id 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <FolderIcon className={`h-5 w-5 ${activeFolder === folder.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    {folder.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{folder.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(folder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteFolder(folder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <FolderIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            No folders yet. Create one to organize your clips.
          </p>
        </div>
      )}

      {/* Edit folder dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder information
            </DialogDescription>
          </DialogHeader>
          {editingFolder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editFolderName">Folder Name</Label>
                <Input
                  id="editFolderName"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description (optional)</Label>
                <Textarea
                  id="editDescription"
                  value={editingFolder.description || ""}
                  onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder}>Update Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
