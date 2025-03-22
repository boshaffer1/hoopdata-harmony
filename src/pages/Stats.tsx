
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import AnalyticsOverview from "@/components/analyzer/stats/AnalyticsOverview";
import { useAnalyzer } from "@/hooks/analyzer/use-analyzer";
import { calculateStats } from "@/utils/analyzer-stats";

const Stats = () => {
  const { savedClips } = useAnalyzer();
  const [analyticsData, setAnalyticsData] = useState(null);
  
  useEffect(() => {
    if (savedClips.length > 0) {
      const stats = calculateStats(savedClips);
      setAnalyticsData(stats);
    } else {
      setAnalyticsData(null);
    }
  }, [savedClips]);

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Statistics & Analytics</h1>
        <p className="text-muted-foreground">
          Dive deep into your team and player performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-3">
          <AnalyticsOverview data={analyticsData} />
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
