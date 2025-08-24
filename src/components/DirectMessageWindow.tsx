import { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
}

interface OtherUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface DirectMessageWindowProps {
  otherUserId: string;
}

export function DirectMessageWindow({ otherUserId }: DirectMessageWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (otherUserId && user) {
      loadOtherUser();
      loadMessages();
      const unsubscribe = subscribeToMessages();
      
      return () => {
        unsubscribe();
      };
    }
  }, [otherUserId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadOtherUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      if (error) throw error;
      setOtherUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error("Failed to load user information");
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          // Only add if it's part of this conversation
          if ((newMsg.sender_id === user?.id && newMsg.receiver_id === otherUserId) ||
              (newMsg.sender_id === otherUserId && newMsg.receiver_id === user?.id)) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
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
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 glow-ring">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {(otherUser.display_name || otherUser.username)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground gradient-text">
              {otherUser.display_name || otherUser.username}
            </h3>
            <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-4">
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {(otherUser.display_name || otherUser.username)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold gradient-text mb-2">
                {otherUser.display_name || otherUser.username}
              </h3>
              <p className="text-muted-foreground">
                This is the beginning of your conversation with @{otherUser.username}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-300",
                  message.sender_id === user?.id
                    ? "gradient-button text-white hover-glow"
                    : "bg-muted text-foreground hover:bg-muted/80 hover-glow"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder={`Message @${otherUser.username}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="pr-20 bg-muted border-0 hover-glow focus:glow-ring"
              disabled={sending}
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
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
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
  );
}