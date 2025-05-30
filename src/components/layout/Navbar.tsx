
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, BarChart, Bot, Users, Target, FileText, Library, LogOut, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

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
            PlaysWise
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
            to="/library" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" 
          >
            <Library className="h-4 w-4" />
            My Library
          </Link>
          <Link 
            to="/stats" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" 
          >
            <BarChart className="h-4 w-4" />
            Stats
          </Link>
          <Link 
            to="/myteam" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" 
          >
            <Users className="h-4 w-4" />
            My Team
          </Link>
          <Link 
            to="/scouting" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" 
          >
            <Target className="h-4 w-4" />
            Scouting
          </Link>
          <Link 
            to="/assistant" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" 
          >
            <Bot className="h-4 w-4" />
            Assistant
          </Link>
          <Link 
            to="/insights" 
            className="text-sm font-medium hover:text-primary transition-colors" 
          >
            Insights
          </Link>
        </nav>

        {/* User authentication and actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <span className="text-sm truncate max-w-[200px]">{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/settings" className="flex w-full">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full px-6 font-medium shadow-md bg-primary hover:bg-primary/90 transition-all duration-300"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
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
              to="/library" 
              className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Library className="h-4 w-4" />
              My Library
            </Link>
            <Link 
              to="/stats" 
              className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart className="h-4 w-4" />
              Stats
            </Link>
            <Link 
              to="/myteam" 
              className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              My Team
            </Link>
            <Link 
              to="/scouting" 
              className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Target className="h-4 w-4" />
              Scouting
            </Link>
            <Link 
              to="/assistant" 
              className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Bot className="h-4 w-4" />
              Assistant
            </Link>
            <Link 
              to="/insights" 
              className="text-sm font-medium hover:text-primary transition-colors py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Insights
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/settings" 
                  className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-1" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full rounded-full py-4 font-medium shadow-md"
                onClick={() => {
                  navigate('/auth');
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
