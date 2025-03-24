
import { useState, useEffect } from "react";
import { ESPNService, ScoutingReport } from "@/utils/espn-service";
import { toast } from "sonner";

export function useScoutingReport(teamId: string | undefined) {
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!teamId) return;
      
      setLoading(true);
      try {
        const data = await ESPNService.getScoutingReport("basketball", "mens-college-basketball", teamId);
        setReport(data);
        
        // Set the first player as selected by default if players exist
        if (data.summary && data.summary.starPlayers && data.summary.starPlayers.length > 0) {
          setSelectedPlayer(data.playerStats?.[0]?.id ?? null);
        }
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

  return {
    report,
    loading,
    selectedPlayer,
    setSelectedPlayer,
    generateReport
  };
}
