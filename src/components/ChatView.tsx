import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Hash, Users, Search } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

interface Channel {
  id: string;
  room_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
  created_at: string;
}

const ChatView = () => {
  const { roomId, channelId } = useParams<{ roomId: string; channelId: string }>();
  const { user } = useAuth();
  const { toggleMembers, isMembersVisible, rooms, channels } = useAppStore();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  const currentRoom = rooms.find(r => r.id === roomId);
  
  useEffect(() => {
    if (channelId) {
      loadChannel();
    }
  }, [channelId]);

  const loadChannel = async () => {
    if (!channelId) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();

      if (error) throw error;
      setChannel(data);
    } catch (error) {
      console.error('Error loading channel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Channel not found</h3>
          <p className="text-muted-foreground">
            This channel doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{channel.name}</h2>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">
            {currentRoom?.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="w-64 pl-9 h-8"
            />
          </div>
          
          <Button
            variant={isMembersVisible ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleMembers}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList channelId={channelId!} />
        <MessageComposer channelId={channelId!} />
      </div>
    </div>
  );
};

export default ChatView;