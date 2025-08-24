import { useState, useRef } from 'react';
import { Send, Paperclip, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageComposerProps {
  channelId: string;
}

const MessageComposer = ({ channelId }: MessageComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: message.trim(),
        });

      if (error) throw error;
      
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    try {
      const file = files[0];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('attachments')
        .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours

      if (!urlData?.signedUrl) throw new Error('Failed to get file URL');

      // Send message with attachment
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: message.trim() || null,
          attachments: [{
            key: fileName,
            url: urlData.signedUrl,
            name: file.name,
            size: file.size,
            type: file.type,
          }],
        });

      if (messageError) throw messageError;

      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been shared.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-[120px] pr-12 resize-none"
              disabled={sending || uploading}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            disabled={!message.trim() || sending || uploading}
          >
            {sending || uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;