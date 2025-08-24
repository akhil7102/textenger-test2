import { useState, useEffect } from 'react';
import { Plus, Hash } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Room {
  id: string;
  name: string;
  icon_url?: string;
  owner_id: string;
  created_at: string;
}

const RoomRail = () => {
  const { user } = useAuth();
  const { rooms, setRooms, currentRoomId, setCurrentRoom } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserRooms();
    }
  }, [user]);

  const loadUserRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-12 h-12 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 h-full overflow-y-auto custom-scrollbar">
      {/* Home/Direct Messages */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={!currentRoomId ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 rounded-xl transition-all hover:rounded-lg"
            onClick={() => setCurrentRoom(null)}
          >
            <Hash className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Home</TooltipContent>
      </Tooltip>

      {/* Room List */}
      {rooms.map((room) => (
        <Tooltip key={room.id}>
          <TooltipTrigger asChild>
            <Button
              variant={currentRoomId === room.id ? "default" : "ghost"}
              size="icon"
              className="w-12 h-12 rounded-xl transition-all hover:rounded-lg relative group"
              onClick={() => handleRoomSelect(room.id)}
            >
              {room.icon_url ? (
                <img
                  src={room.icon_url}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-xl group-hover:rounded-lg transition-all"
                />
              ) : (
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center rounded-xl group-hover:rounded-lg transition-all text-lg font-semibold">
                  {room.name[0]?.toUpperCase()}
                </div>
              )}
              
              {/* Active indicator */}
              {currentRoomId === room.id && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-foreground rounded-r-full" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{room.name}</TooltipContent>
        </Tooltip>
      ))}

      {/* Add Room Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl transition-all hover:rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Add a Room</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default RoomRail;