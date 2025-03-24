
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

interface NavigationBarProps {
  teamName: string;
  generateReport: () => void;
}

export function NavigationBar({ teamName, generateReport }: NavigationBarProps) {
  return (
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
  );
}
