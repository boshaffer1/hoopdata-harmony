
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 w-full",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            HoopData
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-sm font-medium hover:text-primary transition-colors" 
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className="text-sm font-medium hover:text-primary transition-colors" 
          >
            Dashboard
          </Link>
          <Link 
            to="/analyzer" 
            className="text-sm font-medium hover:text-primary transition-colors" 
          >
            Video Analyzer
          </Link>
          <Link 
            to="/insights" 
            className="text-sm font-medium hover:text-primary transition-colors" 
          >
            Insights
          </Link>
        </nav>

        {/* Call to action button */}
        <div className="hidden md:block">
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full px-6 font-medium shadow-md bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 right-0 border-b animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-primary transition-colors py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium hover:text-primary transition-colors py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/analyzer" 
              className="text-sm font-medium hover:text-primary transition-colors py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Video Analyzer
            </Link>
            <Link 
              to="/insights" 
              className="text-sm font-medium hover:text-primary transition-colors py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Insights
            </Link>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full rounded-full py-4 font-medium shadow-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
