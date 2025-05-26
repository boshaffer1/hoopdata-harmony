
import React from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LineChart, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      
      {/* How It Works Section */}
      <Section className="bg-background">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How PlaysWise Works
          </h2>
          <p className="text-xl text-muted-foreground">
            A simple three-step process to transform your basketball analysis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-primary/10 mb-6">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Upload Your Data</h3>
            <p className="text-muted-foreground">
              Import your CSV files with game data, player statistics, and event timestamps.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-primary/10 mb-6">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Sync With Video</h3>
            <p className="text-muted-foreground">
              Connect your footage with timestamp data for synchronized analysis and clip creation.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-primary/10 mb-6">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Analyze & Improve</h3>
            <p className="text-muted-foreground">
              Visualize performance metrics, identify patterns, and generate actionable insights.
            </p>
          </div>
        </div>
      </Section>
      
      {/* CTA Section */}
      <Section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Transform Your Basketball Analytics?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get started with PlaysWise today and unlock powerful insights for your team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard">
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8 font-medium"
              >
                Explore Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>
      
      {/* Analytics Preview Section */}
      <Section>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-display font-bold mb-4">
              Advanced Basketball Analytics
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Transform raw data into actionable insights with our comprehensive analytics tools.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="rounded-full p-1 bg-primary/10 text-primary mt-0.5">
                  <LineChart className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium">Performance Trends</span>
                  <p className="text-sm text-muted-foreground">Track player and team performance over time</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="rounded-full p-1 bg-primary/10 text-primary mt-0.5">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium">Comparative Analysis</span>
                  <p className="text-sm text-muted-foreground">Compare stats across games, players, and seasons</p>
                </div>
              </li>
            </ul>
            <Link to="/insights">
              <Button 
                variant="outline" 
                className="mt-6"
              >
                View Analytics Features
              </Button>
            </Link>
          </div>
          
          <div className="md:w-1/2 glass rounded-xl border p-6">
            <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary/60 mb-2 mx-auto" />
                <p className="text-muted-foreground">Analytics Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default Index;
