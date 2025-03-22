
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedClip } from "@/types/analyzer";
import AssistantMessage from "./AssistantMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  clips?: SavedClip[];
}

interface MessageListProps {
  messages: Message[];
  onPlayClip?: (clip: SavedClip) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onPlayClip }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <AssistantMessage
            key={message.id}
            content={message.content}
            role={message.role}
            clips={message.clips}
            onPlayClip={onPlayClip}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
