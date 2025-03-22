
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SavedClip } from "@/types/analyzer";
import { SendIcon, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  clips?: SavedClip[];
}

interface ClipAssistantProps {
  savedClips: SavedClip[];
  onPlayClip: (clip: SavedClip) => void;
}

const ClipAssistant: React.FC<ClipAssistantProps> = ({ 
  savedClips,
  onPlayClip
}) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your clip assistant. Ask me to find specific clips in your library."
    }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug the saved clips when they change
  useEffect(() => {
    console.log("ClipAssistant: savedClips changed", savedClips);
  }, [savedClips]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsSearching(true);
    
    // Clear input
    setQuery("");
    
    // Process the query
    setTimeout(() => {
      console.log("Searching for clips with query:", query);
      const matchedClips = searchClips(query);
      console.log("Found matched clips:", matchedClips);
      
      // Create assistant message
      let assistantMessage: Message;
      
      if (matchedClips.length > 0) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I found ${matchedClips.length} clips that might match what you're looking for. Click on a clip to play it.`,
          clips: matchedClips
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I couldn't find any clips matching your criteria. Try a different search or add more clips to your library."
        };
      }
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsSearching(false);
      
      // Auto-play the first clip if any are found
      if (matchedClips.length > 0) {
        onPlayClip(matchedClips[0]);
      }
    }, 1000);
  };

  const searchClips = (query: string): SavedClip[] => {
    // If there are no saved clips, return empty array
    if (!savedClips || savedClips.length === 0) {
      console.log("No saved clips available for search");
      return [];
    }

    console.log(`Searching through ${savedClips.length} clips for "${query}"`);
    
    const searchTerms = query.toLowerCase().split(" ");
    
    // Using a more permissive search approach with debug logging
    return savedClips.filter(clip => {
      // Guard against undefined or null values
      const clipLabel = (clip.label || "").toLowerCase();
      const clipNotes = (clip.notes || "").toLowerCase();
      const clipSituation = (clip.situation || "").toLowerCase();
      
      // Map through players carefully to avoid errors
      let playerNames: string[] = [];
      if (clip.players && Array.isArray(clip.players)) {
        playerNames = clip.players
          .filter(p => p && p.playerName) // Filter out null/undefined players
          .map(p => p.playerName.toLowerCase());
      }
      
      // Collect all text to search within
      const clipText = [
        clipLabel,
        clipNotes,
        clipSituation,
        ...playerNames
      ].join(" ");
      
      // Check if ANY search term is found
      const matches = searchTerms.some(term => clipText.includes(term));
      
      if (matches) {
        console.log(`Match found in clip: "${clip.label}" for query: "${query}"`);
      }
      
      return matches;
    });
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your clip assistant. Ask me to find specific clips in your library."
    }]);
  };

  const handleClipClick = (clip: SavedClip) => {
    onPlayClip(clip);
    toast.success(`Playing: ${clip.label}`);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Clip Assistant</CardTitle>
            <CardDescription>
              Search for specific clips using natural language
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Clear chat</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div>{message.content}</div>
                    
                    {/* Display matched clips if any */}
                    {message.clips && message.clips.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.clips.map((clip) => (
                          <div 
                            key={clip.id}
                            onClick={() => handleClipClick(clip)}
                            className="p-2 bg-background rounded border border-border cursor-pointer hover:bg-accent transition-colors"
                          >
                            <div className="font-medium text-sm">{clip.label}</div>
                            {clip.notes && (
                              <div className="text-xs text-muted-foreground truncate">{clip.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <Separator />
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find clips with Jayson Tatum shooting 3s..."
                disabled={isSearching}
              />
              <Button type="submit" size="icon" disabled={isSearching}>
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClipAssistant;
