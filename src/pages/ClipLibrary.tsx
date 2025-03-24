
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { FolderList } from "@/components/library/FolderList";
import { LibraryClipList } from "@/components/library/LibraryClipList";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClipLibrary } from "@/hooks/analyzer/use-clip-library";
import { useAnalyzer } from "@/hooks/analyzer";

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
    getClipsByFolder
  } = useClipLibrary(undefined);
  
  const { handlePlaySavedClip } = useAnalyzer();

  const filteredClips = getClipsByFolder(activeFolder);
  
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportLibrary}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Library
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/analyzer")}
            >
              Go to Analyzer
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Organize and access your saved video clips
        </p>
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
