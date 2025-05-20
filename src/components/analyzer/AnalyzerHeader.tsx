
import React from "react";
import { Button } from "@/components/ui/button";

interface AnalyzerHeaderProps {
  showDemoData: boolean;
  onToggleDemoMode: () => void;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({ 
  showDemoData, 
  onToggleDemoMode 
}) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Video Analyzer</h1>
        <p className="text-muted-foreground">
          Sync game footage with data for comprehensive analysis
        </p>
      </div>
      <div>
        <Button
          variant={showDemoData ? "default" : "outline"}
          onClick={onToggleDemoMode}
        >
          {showDemoData ? "Analyzer Mode" : "Demo Data Mode"}
        </Button>
      </div>
    </div>
  );
};

export default AnalyzerHeader;
