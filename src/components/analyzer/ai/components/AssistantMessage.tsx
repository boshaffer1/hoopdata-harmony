
import React from "react";
import { SavedClip } from "@/types/analyzer";
import { toast } from "sonner";

interface MessageProps {
  content: string;
  role: "user" | "assistant";
  clips?: SavedClip[];
  onPlayClip?: (clip: SavedClip) => void;
}

const AssistantMessage: React.FC<MessageProps> = ({ 
  content, 
  role, 
  clips, 
  onPlayClip 
}) => {
  const handleClipClick = (clip: SavedClip) => {
    if (onPlayClip) {
      onPlayClip(clip);
      toast.success(`Playing: ${clip.label}`);
    }
  };

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div>{content}</div>
        
        {/* Display matched clips if any */}
        {clips && clips.length > 0 && (
          <div className="mt-2 space-y-2">
            {clips.map((clip) => (
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
  );
};

export default AssistantMessage;
