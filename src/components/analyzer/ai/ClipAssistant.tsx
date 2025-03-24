
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SavedClip } from "@/types/analyzer";
import { Search, SendIcon, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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
      const matchedClips = searchClips(query);
      
      // Create assistant message
      let assistantMessage: Message;
      
      if (matchedClips.length > 0) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I found ${matchedClips.length} clips that might match what you're looking for. Click on a clip to play it.`
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
      
      // Scroll to bottom of chat
      setTimeout(scrollToBottom, 100);
    }, 1000);
  };

  const searchClips = (query: string): SavedClip[] => {
    const searchTerms = query.toLowerCase().split(" ");
    
    // Using a basic keyword matching approach for now
    return savedClips.filter(clip => {
      const clipText = [
        clip.label.toLowerCase(),
        clip.notes.toLowerCase(),
        clip.situation,
        ...clip.players?.map(p => p.playerName.toLowerCase()) || []
      ].join(" ");
      
      // Check if the clip contains all search terms
      return searchTerms.every(term => clipText.includes(term));
    });
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your clip assistant. Ask me to find specific clips in your library."
    }]);
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
                    {message.content}
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
