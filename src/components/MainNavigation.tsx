import { Home, Users, MessageSquare, User, Settings, Volume2, Shield, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainNavigationProps {
  onPageChange: (pageId: string) => void;
  activePage: string;
}

export function MainNavigation({ onPageChange, activePage }: MainNavigationProps) {
  return (
    <div className="w-60 bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold gradient-text">Textenger</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {/* Discover Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Discover
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'home' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("home")}
            >
              <Home size={18} />
              Home
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'browse-friends' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("browse-friends")}
            >
              <Users size={18} />
              Browse Friends
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'direct-messages' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("direct-messages")}
            >
              <MessageSquare size={18} />
              Direct Messages
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'room-chat' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("room-chat")}
            >
              <Hash size={18} />
              Room Chat
            </Button>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Settings
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'profile' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("profile")}
            >
              <User size={18} />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'room-profile' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("room-profile")}
            >
              <Shield size={18} />
              Room Profile
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${activePage === 'audio-settings' ? 'bg-muted text-foreground gradient-border' : 'text-muted-foreground hover-glow'}`}
              onClick={() => onPageChange("audio-settings")}
            >
              <Volume2 size={18} />
              Audio Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}