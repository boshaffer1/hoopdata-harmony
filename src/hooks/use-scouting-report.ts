
import { useState, useEffect } from "react";
import { ESPNService, ScoutingReport } from "@/utils/espn-service";
import { toast } from "sonner";

export function useScoutingReport(teamId: string | undefined) {
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!teamId) return;
      
      setLoading(true);
      try {
        const data = await ESPNService.getScoutingReport("basketball", "mens-college-basketball", teamId);
        setReport(data);
        
        // Set the first player as selected by default if players exist
        if (data.playerStats && data.playerStats.length > 0) {
          setSelectedPlayer(data.playerStats[0]?.id ?? null);
        }
        
        // Check if we're using mock data (this is a simple heuristic)
        setIsUsingMockData(data.id === teamId && data.teamName === "Boston Celtics" && teamId !== "1");
      } catch (error) {
        console.error("Error fetching scouting report:", error);
        toast.error("Failed to load scouting report");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [teamId]);

  const generateReport = () => {
    if (!report || !teamId) return;
    
    try {
      ESPNService.generateScoutingReportPDF(report);
      toast.success("Scouting report PDF generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const retryFetchReport = async () => {
    if (!teamId) return;
    
    // Try to fetch real data
    setLoading(true);
    toast.info("Attempting to fetch real scouting data...");
    
    try {
      // Force real API usage
      ESPNService.setUseMockData(false);
      const data = await ESPNService.getScoutingReport("basketball", "mens-college-basketball", teamId);
      setReport(data);
      
      // Check if we're using mock data (this is a simple heuristic)
      const stillUsingMock = data.id === teamId && data.teamName === "Boston Celtics" && teamId !== "1";
      setIsUsingMockData(stillUsingMock);
      
      if (stillUsingMock) {
        toast.warning("Still using demo data. ESPN API may be unavailable.");
      } else {
        toast.success("Successfully fetched real scouting data!");
      }
      
      // Update selected player
      if (data.playerStats && data.playerStats.length > 0) {
        setSelectedPlayer(data.playerStats[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Error fetching scouting report:", error);
      toast.error("Failed to load real scouting data");
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    loading,
    selectedPlayer,
    setSelectedPlayer,
    generateReport,
    isUsingMockData,
    retryFetchReport
  };
}
