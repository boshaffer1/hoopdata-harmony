
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedClip } from "@/types/analyzer";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { useClipSearch } from "@/hooks/analyzer/use-clip-search";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your clip assistant. Ask me to find specific clips in your library."
    }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchClips } = useClipSearch();

  // Debug the saved clips when they change
  useEffect(() => {
    console.log("ClipAssistant: savedClips changed", savedClips);
  }, [savedClips]);

  const handleSubmit = (query: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsSearching(true);
    
    // Process the query
    setTimeout(() => {
      console.log("Searching for clips with query:", query);
      const matchedClips = searchClips(query, savedClips);
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
          <MessageList 
            messages={messages} 
            onPlayClip={onPlayClip} 
          />
          
          <Separator />
          
          <ChatInput 
            onSubmit={handleSubmit} 
            isSearching={isSearching} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClipAssistant;
