import { useState, useEffect } from "react";
import { Search, Image, MoreHorizontal, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfilePanelProps {
  otherUserId?: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  favorite_game?: string;
  current_rank?: string;
}

export function ProfilePanel({ otherUserId }: ProfilePanelProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otherUserId) {
      loadUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [otherUserId]);

  const loadUserProfile = async () => {
    if (!otherUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (!otherUserId) {
    return (
      <div className="w-80 bg-background border-l border-border flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Select a conversation to view profile details</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-80 bg-background border-l border-border flex flex-col">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background border-l border-border flex flex-col">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-border">
        <Avatar className="h-20 w-20 mx-auto mb-4 avatar-glow">
          <AvatarImage src={userProfile?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl gradient-button">
            {(userProfile?.display_name || userProfile?.username || 'U')[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold text-foreground mb-1 gradient-text">
          {userProfile?.display_name || userProfile?.username}
        </h3>
        <p className="text-sm text-muted-foreground">@{userProfile?.username}</p>
        {userProfile?.bio && (
          <p className="text-xs text-muted-foreground mt-2">{userProfile.bio}</p>
        )}
      </div>

      {/* Gaming Info */}
      {(userProfile?.favorite_game || userProfile?.current_rank) && (
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-semibold gradient-text mb-2">Gaming</h4>
          {userProfile.favorite_game && (
            <p className="text-sm text-muted-foreground mb-1">
              Playing: {userProfile.favorite_game}
            </p>
          )}
          {userProfile.current_rank && (
            <p className="text-sm text-green-400">
              Rank: {userProfile.current_rank}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 gradient-border hover-glow"
        >
          <User size={16} />
          View full profile
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 hover-glow"
        >
          <Search size={16} />
          Search chat
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 hover-glow"
        >
          <Image size={16} />
          Shared images
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 hover-glow"
        >
          <MoreHorizontal size={16} />
          More options
        </Button>
      </div>
    </div>
  );
}