
import React from "react";
import Section from "../layout/Section";
import { 
  LineChart, 
  VideoIcon, 
  FileUp, 
  BarChart3, 
  PieChart, 
  TimerIcon 
} from "lucide-react";

const features = [
  {
    icon: <FileUp className="h-10 w-10 text-primary" />,
    title: "CSV Import & Parsing",
    description: "Easily import and parse CSV files with game data and player statistics for immediate analysis."
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Interactive Visualizations",
    description: "Transform complex data into clear, interactive visualizations that reveal key patterns and insights."
  },
  {
    icon: <VideoIcon className="h-10 w-10 text-primary" />,
    title: "Video Synchronization",
    description: "Seamlessly sync your game footage with timeline data for contextualized visual analysis."
  },
  {
    icon: <TimerIcon className="h-10 w-10 text-primary" />,
    title: "Timestamp References",
    description: "Create and manage clip references based on timestamps for easy retrieval and review."
  },
  {
    icon: <LineChart className="h-10 w-10 text-primary" />,
    title: "Performance Tracking",
    description: "Track player and team performance metrics over time to identify trends and improvement areas."
  },
  {
    icon: <PieChart className="h-10 w-10 text-primary" />,
    title: "Advanced Analytics",
    description: "Leverage advanced statistical methods to gain deeper insights into gameplay and strategy."
  }
];

const Features = () => {
  return (
    <Section id="features" className="bg-secondary/50">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Powerful Features for Basketball Analysis
        </h2>
        <p className="text-xl text-muted-foreground">
          Our comprehensive toolkit equips coaches, analysts, and players with everything 
          needed for in-depth basketball analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex flex-col p-6 rounded-2xl bg-background border animate-hover"
          >
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-primary/10 mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Features;
