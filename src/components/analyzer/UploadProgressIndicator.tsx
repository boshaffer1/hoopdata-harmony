
import React from "react";
import { Progress } from "@/components/ui/progress";

interface UploadProgressIndicatorProps {
  isUploading: boolean;
  uploadProgress: number;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  isUploading,
  uploadProgress
}) => {
  if (!isUploading) return null;
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
      <p className="mb-2 font-medium">Uploading video to your account</p>
      <Progress value={uploadProgress} className="h-2" />
      <p className="mt-1 text-xs text-muted-foreground">{uploadProgress}% complete</p>
    </div>
  );
};

export default UploadProgressIndicator;
