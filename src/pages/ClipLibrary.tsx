
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { useAnalyzer } from "@/hooks/analyzer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ClipLibrary = () => {
  const navigate = useNavigate();
  const {
    savedClips,
    folders,
    activeFolder,
    setActiveFolder,
    exportLibrary,
    exportClip,
    removeSavedClip,
    createFolder,
    updateFolder,
    deleteFolder,
    moveClipToFolder,
    getClipsByFolder,
    getStorageInfo
  } = useClipLibrary(undefined);
  
  const { handlePlaySavedClip } = useAnalyzer();
  const [showPersistenceInfo, setShowPersistenceInfo] = useState(false);

  const filteredClips = getClipsByFolder(activeFolder);
  const storageInfo = getStorageInfo();
  
  // Handle redirecting to analyzer to play clips
  const handlePlayClip = (clip: any) => {
    handlePlaySavedClip(clip);
    navigate("/analyzer");
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-display font-bold">My Clip Library</h1>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportLibrary}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Library
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export all clips as a JSON file for backup</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/analyzer")}
            >
              Go to Analyzer
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Organize and access your saved video clips
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPersistenceInfo(!showPersistenceInfo)}
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            Storage Info
          </Button>
        </div>
        
        {showPersistenceInfo && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Local Storage Information</AlertTitle>
            <AlertDescription>
              <p>Your clips and folders are automatically saved in your browser's local storage. They will persist even after closing the browser or turning off your device.</p>
              <p className="mt-2 text-sm">To ensure you never lose your data, you can export your library as a JSON file using the "Export Library" button.</p>
              <p className="mt-2 text-sm font-medium">Total clips: {savedClips.length} | Total folders: {folders.length} {storageInfo && `| Storage used: ${storageInfo.totalSizeKB} KB`}</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar - Folders */}
        <div className="lg:col-span-1">
          <FolderList
            folders={folders}
            activeFolder={activeFolder}
            onCreateFolder={createFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
            onSelectFolder={setActiveFolder}
          />
        </div>
        
        {/* Main content - Clips */}
        <div className="lg:col-span-3">
          <LibraryClipList
            clips={filteredClips}
            folders={folders}
            activeFolder={activeFolder}
            onPlayClip={handlePlayClip}
            onExportClip={exportClip}
            onRemoveClip={removeSavedClip}
            onMoveToFolder={moveClipToFolder}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClipLibrary;
