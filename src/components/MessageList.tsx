import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface MessageProfile {
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  attachments?: Json;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  profiles?: MessageProfile;
}

interface MessageListProps {
  channelId: string;
}

const MessageList = ({ channelId }: MessageListProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channelId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [channelId]);

  const loadMessages = async () => {
    if (!channelId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_user_id_fkey (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderMessage = (message: Message, index: number) => {
    const profile = message.profiles;
    const displayName = profile?.display_name || profile?.username || 'Unknown User';
    const isOwn = message.user_id === user?.id;
    
    // Check if this message should be grouped with the previous one
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const shouldGroup = prevMessage && 
      prevMessage.user_id === message.user_id &&
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000; // 5 minutes

    return (
      <div
        key={message.id}
        className={`group px-4 py-1 hover:bg-message-hover transition-colors ${
          shouldGroup ? 'mt-0' : 'mt-4'
        }`}
      >
        <div className="flex items-start gap-3">
          {!shouldGroup && (
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                displayName[0]?.toUpperCase()
              )}
            </div>
          )}
          
          <div className={`flex-1 ${shouldGroup ? 'ml-13' : ''}`}>
            {!shouldGroup && (
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatMessageTime(message.created_at)}
                </span>
                {message.edited_at && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
            )}
            
            <div className="text-sm text-foreground leading-relaxed">
              {message.content || <em className="text-muted-foreground">Message deleted</em>}
            </div>
            
            {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment: any, i: number) => (
                  <div key={i} className="max-w-sm">
                    {attachment.type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt="Attachment"
                        className="rounded-lg max-h-96 object-cover border border-border"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-lg border border-border">
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Unknown size'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground">
            Be the first to send a message in this channel!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 custom-scrollbar">
      <div className="min-h-full flex flex-col justify-end">
        <div className="pb-4">
          {messages.map((message, index) => renderMessage(message, index))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MessageList;