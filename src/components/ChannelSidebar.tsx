import { useState, useEffect } from 'react';
import { Hash, Volume2, Settings, UserPlus, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Channel {
  id: string;
  room_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
  created_at: string;
}

const ChannelSidebar = () => {
  const { user } = useAuth();
  const {
    currentRoomId,
    currentChannelId,
    setCurrentChannel,
    channels,
    setChannels,
    rooms
  } = useAppStore();
  const [loading, setLoading] = useState(false);

  const currentRoom = rooms.find(r => r.id === currentRoomId);

  useEffect(() => {
    if (currentRoomId) {
      loadChannels();
    } else {
      setChannels([]);
    }
  }, [currentRoomId]);

  const loadChannels = async () => {
    if (!currentRoomId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('room_id', currentRoomId)
        .order('position', { ascending: true });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setCurrentChannel(channelId);
  };

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  if (!currentRoomId) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Direct Messages</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a room to see channels</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Room Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg truncate">
            {currentRoom?.name || 'Unknown Room'}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Text Channels */}
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Text Channels
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {textChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={currentChannelId === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start px-2 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </Button>
                ))}
                
                {textChannels.length === 0 && !loading && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    No text channels yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voice Channels */}
          {voiceChannels.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Voice Channels
                  </span>
                  <Button variant="ghost" size="icon" className="h-4 w-4">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-0.5">
                  {voiceChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="ghost"
                      className="w-full justify-start px-2 h-8 text-muted-foreground hover:text-foreground"
                    >
                      <Volume2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelSidebar;