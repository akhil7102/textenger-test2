import { useState } from "react";
import { Phone, Video, Smile, Paperclip, Mic, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "No honestly I'm thinking of a career pivot",
    isOutgoing: true,
    timestamp: "9:41 AM"
  },
  {
    id: "2", 
    text: "This is the main chat template",
    isOutgoing: true,
    timestamp: "9:41 AM"
  },
  {
    id: "3",
    text: "Oh?",
    isOutgoing: false,
    timestamp: "9:42 AM"
  },
  {
    id: "4",
    text: "Cool",
    isOutgoing: false,
    timestamp: "9:42 AM"
  },
  {
    id: "5",
    text: "How does it work?",
    isOutgoing: false,
    timestamp: "9:43 AM"
  },
  {
    id: "6",
    text: "Simple",
    isOutgoing: true,
    timestamp: "9:44 AM"
  },
  {
    id: "7",
    text: "You just edit any text to type in the conversation you want to show, and delete any bubbles you don't want to use",
    isOutgoing: true,
    timestamp: "9:44 AM"
  },
  {
    id: "8",
    text: "Boom",
    isOutgoing: true,
    timestamp: "9:44 AM"
  },
  {
    id: "9",
    text: "Hmmm",
    isOutgoing: false,
    timestamp: "9:45 AM"
  },
  {
    id: "10",
    text: "I think I get it",
    isOutgoing: false,
    timestamp: "9:45 AM"
  },
  {
    id: "11",
    text: "Will head to the Help Center if I have more questions tho",
    isOutgoing: false,
    timestamp: "9:46 AM"
  }
];

export function ChatWindow() {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-chat-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 glow-ring">
            <AvatarFallback className="bg-primary text-primary-foreground">HH</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground gradient-text">Helena Hills</h3>
            <p className="text-sm text-muted-foreground">Active 20m ago</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover-glow">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="hover-glow">
            <Video size={18} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.isOutgoing ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-300",
                msg.isOutgoing
                  ? "gradient-button text-white hover-glow"
                  : "bg-muted text-foreground hover:bg-muted/80 hover-glow"
              )}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {/* Timestamp */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground">Nov 30, 2023, 9:41 AM</span>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-20 bg-muted border-0 hover-glow focus:glow-ring"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
                <Smile size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
                <Paperclip size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
                <Mic size={16} />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="icon"
            className="gradient-button hover-glow"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}