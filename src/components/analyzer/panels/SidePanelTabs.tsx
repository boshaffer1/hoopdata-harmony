
import React, { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Library, Users } from "lucide-react";

interface SidePanelTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  markersPanel: ReactNode;
  libraryPanel: ReactNode;
  rosterPanel: ReactNode;
}

const SidePanelTabs: React.FC<SidePanelTabsProps> = ({
  activeTab,
  onTabChange,
  markersPanel,
  libraryPanel,
  rosterPanel
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="markers" className="flex items-center gap-2">
          <BookmarkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Markers</span>
        </TabsTrigger>
        <TabsTrigger value="library" className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Library</span>
        </TabsTrigger>
        <TabsTrigger value="roster" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Rosters</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="markers" className="mt-0">
        {markersPanel}
      </TabsContent>
      
      <TabsContent value="library" className="mt-0">
        {libraryPanel}
      </TabsContent>
      
      <TabsContent value="roster" className="mt-0">
        {rosterPanel}
      </TabsContent>
    </Tabs>
  );
};

export default SidePanelTabs;
