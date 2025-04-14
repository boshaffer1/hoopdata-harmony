
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClipListHeaderProps {
  totalClips: number;
  selectedClips: string[];
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  onSelectAll: () => void;
  onBulkMoveClick: () => void;
  onBulkExportClick: () => void;
  onBulkDeleteClick: () => void;
}

export const ClipListHeader: React.FC<ClipListHeaderProps> = ({
  totalClips,
  selectedClips,
  isSelectMode,
  onToggleSelectMode,
  onSelectAll,
  onBulkMoveClick,
  onBulkExportClick,
  onBulkDeleteClick
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">
          {isSelectMode 
            ? `${selectedClips.length} of ${totalClips} selected` 
            : `${totalClips} clips`}
        </h3>
        {isSelectMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSelectAll}
            className="h-8 text-xs"
          >
            {selectedClips.length === totalClips ? "Deselect All" : "Select All"}
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {isSelectMode ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={selectedClips.length === 0}>
                  <MoreVertical className="h-4 w-4 mr-1" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={onBulkMoveClick}>
                  Move to folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBulkExportClick}>
                  Export selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onBulkDeleteClick}
                  className="text-destructive"
                >
                  Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={onToggleSelectMode}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onToggleSelectMode}>
            Select Clips
          </Button>
        )}
      </div>
    </div>
  );
};
