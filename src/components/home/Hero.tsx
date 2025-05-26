
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 pt-20 pb-24 sm:pt-32 sm:pb-40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium animate-slide-down">
            <span>Beta Release</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 animate-slide-down" style={{ animationDelay: "100ms" }}>
            Transform your basketball analytics with <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">PlaysWise</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-down" style={{ animationDelay: "200ms" }}>
            Seamlessly analyze game footage, track player stats, and generate 
            actionable insights with our comprehensive basketball analytics platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-slide-down" style={{ animationDelay: "300ms" }}>
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full px-8 shadow-lg">
                Explore Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/analyzer">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Try Video Analyzer
              </Button>
            </Link>
          </div>
          
          {/* Preview Image with glass effect */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none"></div>
            <div className="relative glass rounded-2xl overflow-hidden aspect-video">
              <div className="bg-primary/5 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Dashboard Preview</p>
                  <p className="text-sm text-muted-foreground">Click to explore our interactive demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
