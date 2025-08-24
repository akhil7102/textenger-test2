import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Conversation {
  id: string;
  other_user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

interface ChatListProps {
  onSelectChat: (userId: string) => void;
  selectedUserId?: string | null;
}

export function ChatList({ onSelectChat, selectedUserId }: ChatListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadConversations();
      const unsubscribe = subscribeToMessages();
      
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Get all direct messages involving this user
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          sender:sender_id (id, username, display_name, avatar_url),
          receiver:receiver_id (id, username, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      messages?.forEach((message: any) => {
        const isUserSender = message.sender_id === user?.id;
        const otherUser = isUserSender ? message.receiver : message.sender;
        const conversationKey = otherUser.id;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            other_user: otherUser,
            last_message: {
              content: message.content,
              created_at: message.created_at,
              sender_id: message.sender_id
            }
          });
        } else {
          // Update with the most recent message
          const existing = conversationMap.get(conversationKey)!;
          if (new Date(message.created_at) > new Date(existing.last_message?.created_at || '0')) {
            existing.last_message = {
              content: message.content,
              created_at: message.created_at,
              sender_id: message.sender_id
            };
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Only update if this message involves the current user
          if (newMessage.sender_id === user?.id || newMessage.receiver_id === user?.id) {
            // Reload conversations to get the updated list
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.other_user.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-80 border-r border-border bg-muted/30 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold gradient-text">Direct Messages</h2>
          <Button size="sm" variant="ghost" className="hover-glow">
            <Plus size={16} />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-0 hover-glow focus:glow-ring"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className={`w-full p-3 h-auto justify-start hover-glow ${
                  selectedUserId === conversation.other_user.id 
                    ? 'bg-muted text-foreground gradient-border' 
                    : 'text-muted-foreground'
                }`}
                onClick={() => onSelectChat(conversation.other_user.id)}
              >
                <div className="flex gap-3 w-full">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={conversation.other_user.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(conversation.other_user.display_name || conversation.other_user.username)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold truncate">
                        {conversation.other_user.display_name || conversation.other_user.username}
                      </h4>
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}