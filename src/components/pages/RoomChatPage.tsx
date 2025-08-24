import { useState, useEffect } from "react";
import { Plus, Users, Hash, Send, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  owner_id: string;
}

interface RoomMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export function RoomChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      subscribeToMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      console.log('Loading rooms for user:', user?.id);
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading rooms:', error);
        throw error;
      }
      
      console.log('Rooms loaded successfully:', data);
      setRooms(data || []);
      
      // Auto-select first room if available
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      let errorMessage = "Failed to load rooms";
      
      if (error.code === 'PGRST116') {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.code === 'PGRST301') {
        errorMessage = "Authentication required. Please sign in again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Failed to load messages");
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const channel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('room_messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              profiles:sender_id (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createRoom = async () => {
    if (!user || !newRoom.name.trim()) return;

    try {
      console.log('Creating room with user:', user.id);
      
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: newRoom.name,
          description: newRoom.description,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Room creation error:', error);
        throw error;
      }

      console.log('Room created successfully:', data);

      // Add user as a member of the room
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Error adding user to room members:', memberError);
        // Even if adding to members fails, the room was created
        // We can still proceed, but log the error
      }

      setNewRoom({ name: "", description: "" });
      setIsDialogOpen(false);
      loadRooms();
      toast.success("Room created successfully!");
    } catch (error: any) {
      console.error('Error creating room:', error);
      let errorMessage = "Failed to create room";
      
      if (error.code === 'PGRST116') {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.code === 'PGRST301') {
        errorMessage = "Authentication required. Please sign in again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });

      toast.success("Joined room successfully!");
      loadRooms();
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error("Failed to join room");
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedRoom || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('room_messages')
        .insert({
          room_id: selectedRoom.id,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background">
      {/* Room List Sidebar */}
      <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold gradient-text">Rooms</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-button hover-glow">
                  <Plus size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Create New Room</DialogTitle>
                  <DialogDescription>
                    Create a new chat room for your community. You'll be the owner and can manage members and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="Enter room name"
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomDescription">Description (Optional)</Label>
                    <Textarea
                      id="roomDescription"
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      placeholder="Describe your room"
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createRoom} className="w-full gradient-button hover-glow">
                    Create Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No rooms available</p>
              <p className="text-sm text-muted-foreground">Create your first room!</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-3 h-auto flex-col items-start gap-1",
                    selectedRoom?.id === room.id 
                      ? "bg-muted text-foreground gradient-border" 
                      : "hover-glow text-muted-foreground"
                  )}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Hash size={16} />
                    <span className="font-semibold truncate">{room.name}</span>
                  </div>
                  {room.description && (
                    <p className="text-xs text-muted-foreground truncate w-full text-left">
                      {room.description}
                    </p>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Hash size={20} className="text-primary" />
              <div>
                <h3 className="font-semibold gradient-text">{selectedRoom.name}</h3>
                {selectedRoom.description && (
                  <p className="text-sm text-muted-foreground">{selectedRoom.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to send a message!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {(message.profiles?.display_name || message.profiles?.username || 'U')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm gradient-text">
                        {message.profiles?.display_name || message.profiles?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-3">
              <Input
                placeholder={`Message #${selectedRoom.name}`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="flex-1 bg-muted border-0 hover-glow focus:glow-ring"
                disabled={sending}
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="gradient-button hover-glow"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold gradient-text mb-2">Welcome to Room Chat</h3>
            <p className="text-muted-foreground">Select a room from the sidebar to start chatting!</p>
          </div>
        </div>
      )}
    </div>
  );
}