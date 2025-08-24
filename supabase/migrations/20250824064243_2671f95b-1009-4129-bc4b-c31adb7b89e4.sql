-- Add gaming profile fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_game TEXT,
ADD COLUMN IF NOT EXISTS current_rank TEXT,
ADD COLUMN IF NOT EXISTS steam_id TEXT;

-- Create direct_messages table for 1-on-1 conversations
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_messages table (separate from channels/messages for simplicity)
CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add description to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_messages
CREATE POLICY "Users can view their own direct messages" 
ON public.direct_messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send direct messages" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" 
ON public.direct_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
ON public.direct_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- RLS Policies for room_messages (users must be room members)
CREATE POLICY "Room members can view room messages" 
ON public.room_messages 
FOR SELECT 
USING (user_is_room_member(room_id, auth.uid()));

CREATE POLICY "Room members can send messages" 
ON public.room_messages 
FOR INSERT 
WITH CHECK (user_is_room_member(room_id, auth.uid()) AND auth.uid() = sender_id);

-- Fix RLS policy for rooms - allow authenticated users to view all rooms
-- This is necessary for room creation and browsing
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.rooms;
CREATE POLICY "Authenticated users can view all rooms" 
ON public.rooms 
FOR SELECT 
TO authenticated 
USING (true);

-- Fix RLS policy for room_members - allow users to insert themselves
-- This is necessary for room creation and joining
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_members;
CREATE POLICY "Users can join rooms or create room memberships" 
ON public.room_members 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to view room members for rooms they can see
DROP POLICY IF EXISTS "Room members can view member list" ON public.room_members;
CREATE POLICY "Users can view room members for all rooms" 
ON public.room_members 
FOR SELECT 
TO authenticated 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_direct_messages_updated_at
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;

-- Set replica identity for realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.room_messages REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;