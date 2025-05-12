import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { 
  ExpandableChat, 
  ExpandableChatHeader, 
  ExpandableChatBody, 
  ExpandableChatFooter 
} from "@/components/ui/expandable-chat";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";
import { SendHorizontal } from "lucide-react";
import { Basketball } from "@/components/ui/icons/Basketball";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { queryGemini } from "@/utils/gemini";
import { getDatabaseContext } from "@/utils/database-context";
import { toast } from "sonner";
import { 
  listTables, 
  queryTable, 
  getTableSchema 
} from "@/utils/supabase-query";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  role?: 'system' | 'user' | 'assistant';
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "👋 Welcome to HoopData! How can I help with your basketball analytics today?",
      isUser: false,
      timestamp: new Date(),
      role: 'assistant'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [databaseContext, setDatabaseContext] = useState("");
  const [isLLMConfigured, setIsLLMConfigured] = useState(false);
  
  // Check if Gemini is configured
  useEffect(() => {
    const checkLLM = async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      setIsLLMConfigured(!!apiKey);
      
      if (!apiKey) {
        console.warn("Google Gemini API key not configured. Add VITE_GEMINI_API_KEY to your environment variables.");
      }
    };
    
    checkLLM();
  }, []);
  
  // Load database context on mount
  useEffect(() => {
    const loadDatabaseContext = async () => {
      try {
        const context = await getDatabaseContext();
        setDatabaseContext(context);
        console.log("Database context loaded for LLM");
      } catch (error) {
        console.error("Failed to load database context:", error);
      }
    };
    
    if (!isHomePage) {
      loadDatabaseContext();
    }
  }, [isHomePage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    // Find the chat body element and scroll to bottom
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      let response: string;
      
      // Format chat history for Gemini
      const chatHistory = messages.map(msg => ({
        role: msg.role || (msg.isUser ? 'user' : 'assistant'),
        content: msg.content
      }));
      
      // Use Gemini if configured, otherwise fall back to simple responses
      if (isLLMConfigured) {
        response = await queryGemini(inputValue);
      } else {
        response = await fallbackQueryHandler(inputValue);
      }
      
      // Add assistant response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          isUser: false,
          timestamp: new Date(),
          role: 'assistant'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error processing query:", error);
      
      // Add error message
      setTimeout(() => {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: "I encountered an error while trying to process your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
          role: 'assistant'
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Fallback query handler when Gemini is not configured
  const fallbackQueryHandler = async (query: string): Promise<string> => {
    const queryLower = query.toLowerCase().trim();
    let result = "I'm not sure how to help with that specific query. ";
    
    try {
      // List all tables in the database
      if (queryLower.includes('list all tables') || 
          queryLower.includes('show all tables') || 
          queryLower.includes('what tables') ||
          queryLower.includes('available tables')) {
        const { tables, error } = await listTables();
        
        if (error) {
          console.error("Error listing tables:", error);
          return `I had trouble retrieving the table list: ${error.message || "Unknown error"}`;
        }
        
        if (tables && tables.length > 0) {
          return `Here are all the tables in the database: ${tables.join(', ')}`;
        } else {
          return "I couldn't find any tables in the database. There might be an issue with database permissions.";
        }
      }
      
      // Get table schema
      const schemaMatch = queryLower.match(/schema (?:for|of) ([a-z0-9_\s]+)/i);
      if (schemaMatch || 
          (queryLower.includes('schema') && queryLower.includes('table'))) {
        // Extract table name from query or use a default
        let tableName = schemaMatch ? schemaMatch[1].trim() : '';
        
        // If no exact match, try to extract a table name from the query
        if (!tableName) {
          const { tables } = await listTables();
          for (const table of tables || []) {
            if (queryLower.includes(table.toLowerCase())) {
              tableName = table;
              break;
            }
          }
        }
        
        if (!tableName) {
          return "Please specify which table you want the schema for. Example: 'Show schema for players'";
        }
        
        const { schema, error } = await getTableSchema(tableName);
        
        if (error) {
          console.error(`Error getting schema for ${tableName}:`, error);
          return `I had trouble retrieving the schema for ${tableName}: ${error.message || "Unknown error"}`;
        }
        
        if (schema && schema.length > 0) {
          const schemaInfo = schema.map((col: any) => 
            `${col.column_name} (${col.data_type}${col.is_nullable ? ', nullable' : ''})`
          ).join('\n- ');
          
          return `Schema for table ${tableName}:\n- ${schemaInfo}`;
        } else {
          return `I couldn't find schema information for the ${tableName} table. The table might not exist or you may not have permission to access it.`;
        }
      }
      
      // Query handling for various data types
      // Check for queries about available data
      if (queryLower.includes('what data') || 
          queryLower.includes('what tables') || 
          queryLower.includes('what information')) {
        return `I can access information about teams, players, game statistics, videos, and clips. What would you like to know about?`;
      }
      
      // Check for typos in common words
      const playerKeywords = ['player', 'players', 'plaers', 'roster', 'plyers', 'plyrs'];
      const hasPlayerKeyword = playerKeywords.some(keyword => queryLower.includes(keyword));
      
      // Determine if the query is asking for a specific player
      const specificPlayerQuery = queryLower.match(/(?:about|find|search|get|show)\s+([a-z\s]+)(?:\s+player)?/i);
      let specificPlayer: string | null = null;
      
      if (specificPlayerQuery) {
        specificPlayer = specificPlayerQuery[1].trim();
        console.log("Specific player query detected:", specificPlayer);
      }
      
      // Players related queries - check more broadly
      if (hasPlayerKeyword || queryLower.match(/who|name|person|people|athlete/)) {
        try {
          console.log("Attempting to query players table");
          
          if (specificPlayer) {
            // Query for a specific player
            const { data, error } = await queryTable('players', '*', 10, {
              name: specificPlayer
            });
            
            if (!error && data && data.length > 0) {
              // Format player details
              const playerDetails = data.map(player => {
                let details = `Name: ${player.name || 'Unknown'}`;
                
                // Add additional information if available
                if (player.team) details += `, Team: ${player.team}`;
                if (player.position) details += `, Position: ${player.position}`;
                if (player.number) details += `, #${player.number}`;
                if (player.height) details += `, Height: ${player.height}`;
                if (player.weight) details += `, Weight: ${player.weight}lbs`;
                
                return details;
              }).join('\n');
              
              return `Player information:\n${playerDetails}`;
            }
            
            // Try NBA roster as fallback for specific player
            const { data: nbaData, error: nbaError } = await queryTable('NBA roster', '*', 10, {
              name: specificPlayer
            });
            
            if (!nbaError && nbaData && nbaData.length > 0) {
              // Format player details
              const playerDetails = nbaData.map(player => {
                let details = `Name: ${player.name || 'Unknown'}`;
                
                // Add additional information if available
                if (player.team) details += `, Team: ${player.team}`;
                if (player.position) details += `, Position: ${player.position}`;
                if (player.number) details += `, #${player.number}`;
                if (player.height) details += `, Height: ${player.height}`;
                if (player.weight) details += `, Weight: ${player.weight}lbs`;
                
                return details;
              }).join('\n');
              
              return `NBA Player information:\n${playerDetails}`;
            }
            
            return `I couldn't find information for a player named "${specificPlayer}".`;
          }
          
          // Try the players table first for general player queries
          const { data, error } = await queryTable('players', '*', 10);
              
          if (!error && data && data.length > 0) {
            console.log(`Found ${data.length} players in players table`);
            
            // Safely extract names
            const playerList = data
              .filter(player => player && typeof player === 'object')
              .map(player => {
                if ('name' in player && typeof player.name === 'string') {
                  return player.name;
                }
                return 'Unknown player';
              })
              .join(', ');
              
            if (playerList) {
              return `Here are some players in our database: ${playerList}. Would you like more specific information?`;
            }
          }
          
          // Try NBA roster as fallback
          const { data: nbaData, error: nbaError } = await queryTable('NBA roster', '*', 10);
            
          if (!nbaError && nbaData && nbaData.length > 0) {
            console.log(`Found ${nbaData.length} players in NBA roster table`);
            
            // Safely extract names
            const playerList = nbaData
              .filter(player => player && typeof player === 'object')
              .map(player => {
                if ('name' in player && typeof player.name === 'string') {
                  return player.name;
                }
                return 'Unknown NBA player';
              })
              .join(', ');
              
            if (playerList) {
              return `Here are some NBA players in our database: ${playerList}. Would you like more specific information?`;
            }
          }
          
          // Fallback message if no data found
          return "I can find information about players, but I'm having trouble retrieving the specific data right now. You can also check the Players section in the app for complete listings.";
        } catch (e) {
          console.error("Player query error:", e);
          return "I had trouble retrieving player information. Please try asking a different way or check the Players section in the app.";
        }
      }
      
      // Teams related queries
      if (queryLower.includes('team') || queryLower.includes('teams')) {
        // Check for specific team
        const specificTeamQuery = queryLower.match(/(?:about|find|search|get|show)\s+([a-z\s]+)(?:\s+team)?/i);
        let specificTeam: string | null = null;
        
        if (specificTeamQuery) {
          specificTeam = specificTeamQuery[1].trim();
          console.log("Specific team query detected:", specificTeam);
        }
        
        if (specificTeam) {
          // Query for a specific team
          const { data, error } = await queryTable('teams', '*', 10, {
            name: specificTeam
          });
          
          if (!error && data && data.length > 0) {
            // Format team details
            const teamDetails = data.map(team => {
              let details = `Name: ${team.name || 'Unknown'}`;
              
              // Add additional information if available
              if (team.league) details += `, League: ${team.league}`;
              if (team.city) details += `, City: ${team.city}`;
              if (team.mascot) details += `, Mascot: ${team.mascot}`;
              if (team.coach) details += `, Coach: ${team.coach}`;
              
              return details;
            }).join('\n');
            
            return `Team information:\n${teamDetails}`;
          }
          
          return `I couldn't find information for a team named "${specificTeam}".`;
        }
        
        // General team query
        try {
          console.log("Querying teams table");
          const { data, error } = await queryTable('teams', '*', 10);
            
          if (!error && data && data.length > 0) {
            // Extract data safely with type checking
            const teamList = data.map(team => {
              const teamName = team.name || 'Unknown';
              const league = team.league || 'Unknown';
              return `${teamName} (${league})`;
            }).join(', ');
            
            return `Here are some teams in our database: ${teamList}. Would you like more specific information?`;
          }
        } catch (e) {
          console.error("Team query error:", e);
          return "I had trouble retrieving team information. Please try asking a different way or check the Teams section in the app.";
        }
      }
      
      // Stats related queries
      if (queryLower.includes('stat') || queryLower.includes('score') || queryLower.includes('stats')) {
        // Check if query is for a specific player's stats
        const playerStatsMatch = queryLower.match(/(?:stats|statistics|scores)\s+for\s+([a-z\s]+)/i);
        let playerName: string | null = null;
        
        if (playerStatsMatch) {
          playerName = playerStatsMatch[1].trim();
          console.log("Player stats query detected for:", playerName);
          
          const { data, error } = await queryTable('nba_player_box_scores', '*', 5, {
            player_name: playerName
          });
          
          if (!error && data && data.length > 0) {
            const statsList = data.map(stats => {
              return `Game on ${stats.game_date || 'unknown date'}: ${stats.points || 0} pts, ${stats.rebounds || 0} reb, ${stats.assists || 0} ast, ${stats.steals || 0} stl, ${stats.blocks || 0} blk`;
            }).join('\n');
            
            return `Statistics for ${playerName}:\n${statsList}`;
          }
        }
        
        // General stats query
        try {
          console.log("Querying stats table");
          const { data, error } = await queryTable('nba_player_box_scores', '*', 5);
            
          if (!error && data && data.length > 0) {
            const playerName = data[0].player_name || 'Unknown player';
            const points = data[0].points || 0;
            const rebounds = data[0].rebounds || 0;
            const assists = data[0].assists || 0;
            const gameDate = data[0].game_date || 'an unspecified date';
            
            return `I found some player statistics. For example, ${playerName} had ${points} points, ${rebounds} rebounds, and ${assists} assists in a game on ${gameDate}. Would you like more specific stats?`;
          }
        } catch (e) {
          console.error("Stats query error:", e);
          return "I had trouble retrieving statistics. Please try asking a different way or check the Stats section in the app.";
        }
      }
      
      // Video related queries
      if (queryLower.includes('video') || queryLower.includes('clip') || queryLower.includes('clips')) {
        try {
          console.log("Querying videos table");
          const { data, error } = await queryTable('video_files', '*', 5);
            
          if (!error && data && data.length > 0) {
            const videoList = data.map(video => video.title || video.filename || 'Untitled video').join(', ');
            return `Here are some videos in our database: ${videoList}. You can view these in the Clip Library section.`;
          }
        } catch (e) {
          console.error("Video query error:", e);
          return "I had trouble retrieving video information. Please try asking a different way or check the Library section in the app.";
        }
      }
      
      // Default response if no matches
      result += "Would you like to know what information is available in the database?";
      
      // Notify about Gemini not being configured
      result += "\n\nNote: For more advanced responses, please configure the Gemini integration by adding your API key to the environment variables.";
    } catch (e: any) {
      console.error("Error in fallbackQueryHandler:", e);
      result = `I encountered an error while trying to access the database: ${e.message || "Unknown error"}. Please try again or ask in a different way.`;
    }
    
    return result;
  };

  // Handle key press for sending messages
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={cn("flex-1 px-4 sm:px-6 md:px-8 py-8", className)}>
        {children}
      </main>
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HoopData Harmony. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Expandable Chat - only shown on non-homepage routes */}
      {!isHomePage && (
        <ExpandableChat size="md" position="bottom-right" icon={<Basketball className="h-6 w-6" />}>
          <ExpandableChatHeader>
            <div className="flex items-center space-x-2">
              <ChatBubbleAvatar fallback="HD" />
              <div>
                <h3 className="font-medium">HoopData Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {isLLMConfigured ? "Gemini Connected" : "Database Connected"}
                </p>
              </div>
            </div>
          </ExpandableChatHeader>
          
          <ExpandableChatBody className="p-4 chat-body">
            {messages.map(message => (
              <ChatBubble key={message.id} variant={message.isUser ? "sent" : "received"}>
                {!message.isUser && <ChatBubbleAvatar fallback="HD" />}
                <ChatBubbleMessage variant={message.isUser ? "sent" : "received"}>
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
            
            {isTyping && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="HD" />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ExpandableChatBody>
          
          <ExpandableChatFooter>
            <div className="flex items-center gap-2">
              <Input 
                className="flex-1" 
                placeholder="Ask about your data... (e.g. 'What players are in the database?')" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </ExpandableChatFooter>
        </ExpandableChat>
      )}
    </div>
  );
};

export default Layout;
