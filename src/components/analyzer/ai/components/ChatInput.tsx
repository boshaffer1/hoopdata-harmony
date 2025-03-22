
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isSearching: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isSearching }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSubmit(query);
    setQuery("");
  };

  return (
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
  );
};

export default ChatInput;
