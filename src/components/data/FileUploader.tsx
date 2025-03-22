
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileLoaded: (data: any) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoaded,
  allowedFileTypes = [".csv"],
  maxSizeMB = 10,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(fileExtension)) {
      return `Invalid file type. Please upload a file with one of these extensions: ${allowedFileTypes.join(", ")}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File is too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 90) {
          clearInterval(progressInterval);
        }
        return Math.min(newProgress, 90);
      });
    }, 100);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        
        // Very basic CSV parsing - in a real app, use a proper CSV parser
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map(header => header.trim());
        
        const data = lines.slice(1).map(line => {
          if (!line.trim()) return null;
          
          const values = line.split(",").map(value => value.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, i) => {
            row[header] = values[i] || "";
          });
          
          return row;
        }).filter(Boolean);

        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          onFileLoaded(data);
          setIsLoading(false);
          toast.success("File successfully processed");
        }, 500);
      } catch (err) {
        clearInterval(progressInterval);
        setError("Failed to process the file. Please check the file format.");
        setIsLoading(false);
        toast.error("Error processing file");
      }
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setError("Error reading the file.");
      setIsLoading(false);
      toast.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetFileUpload = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={allowedFileTypes.join(",")}
        onChange={handleFileChange}
      />
      
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors text-center",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Drop your CSV file here
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: {allowedFileTypes.join(", ")} (Max: {maxSizeMB}MB)
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleButtonClick}
              className="mt-4"
            >
              Select File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-muted p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFileUpload}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {progress}% processed
              </p>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : progress === 100 ? (
            <div className="text-sm text-green-600 flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>File successfully processed</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
