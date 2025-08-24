import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface Room {
  id: string;
  name: string;
  icon_url?: string;
  owner_id: string;
  created_at: string;
}

interface Channel {
  id: string;
  room_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
  created_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  attachments?: any[];
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
}

interface AppState {
  // Current selections
  currentRoomId: string | null;
  currentChannelId: string | null;
  
  // Data
  rooms: Room[];
  channels: Channel[];
  messages: Message[];
  
  // UI state
  isMembersVisible: boolean;
  typingUsers: Set<string>;
  
  // Actions
  setCurrentRoom: (roomId: string | null) => void;
  setCurrentChannel: (channelId: string | null) => void;
  setRooms: (rooms: Room[]) => void;
  setChannels: (channels: Channel[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  toggleMembers: () => void;
  setTypingUsers: (users: Set<string>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // State
  currentRoomId: null,
  currentChannelId: null,
  rooms: [],
  channels: [],
  messages: [],
  isMembersVisible: false,
  typingUsers: new Set(),

  // Actions
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  setCurrentChannel: (channelId) => set({ currentChannelId: channelId }),
  setRooms: (rooms) => set({ rooms }),
  setChannels: (channels) => set({ channels }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })),
  toggleMembers: () => set((state) => ({ isMembersVisible: !state.isMembersVisible })),
  setTypingUsers: (users) => set({ typingUsers: users }),
}));