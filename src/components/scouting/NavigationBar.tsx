
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle, RefreshCw } from "lucide-react";

interface NavigationBarProps {
  teamName: string;
  generateReport: () => void;
  isUsingMockData?: boolean;
  retryFetchReport?: () => void;
}

export function NavigationBar({ 
  teamName, 
  generateReport, 
  isUsingMockData,
  retryFetchReport
}: NavigationBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/scouting" className="hover:text-foreground transition-colors">
            Scouting
          </Link>
          <span>›</span>
          <span className="text-foreground">{teamName}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            asChild
            className="border-border/50"
          >
            <Link to="/scouting">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
          <Button 
            onClick={generateReport} 
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Mock Data Warning */}
      {isUsingMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-sm">Using Demo Data</h3>
            <p className="text-xs text-muted-foreground">
              This is demonstration data for preview purposes. ESPN API connection unavailable.
            </p>
            {retryFetchReport && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-1 h-7 text-xs" 
                onClick={retryFetchReport}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Connection
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
