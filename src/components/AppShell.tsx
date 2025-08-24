import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import RoomRail from './RoomRail';
import ChannelSidebar from './ChannelSidebar';
import ChatView from './ChatView';
import MemberList from './MemberList';

const AppShell = () => {
  const { isMembersVisible } = useAppStore();

  return (
    <div className="h-screen flex bg-background">
      {/* Left Rail - Room Icons */}
      <div className="w-16 bg-sidebar flex-shrink-0">
        <RoomRail />
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-card border-r border-border flex-shrink-0">
        <ChannelSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<WelcomeView />} />
          <Route path="/r/:roomId" element={<RoomView />} />
          <Route path="/r/:roomId/c/:channelId" element={<ChatView />} />
        </Routes>
      </div>

      {/* Members List (conditional) */}
      {isMembersVisible && (
        <div className="w-60 bg-card border-l border-border flex-shrink-0">
          <MemberList />
        </div>
      )}
    </div>
  );
};

// Welcome view when no room is selected
const WelcomeView = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-6">💬</div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Textenger</h1>
      <p className="text-muted-foreground mb-6">
        Select a room from the sidebar to start chatting, or create a new room to get started.
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>• Join rooms with invite links</p>
        <p>• Create channels for different topics</p>
        <p>• Share files and images</p>
        <p>• Real-time messaging and presence</p>
      </div>
    </div>
  </div>
);

// Room view when room is selected but no channel
const RoomView = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="text-4xl mb-4">📺</div>
      <h2 className="text-xl font-semibold mb-2">Select a Channel</h2>
      <p className="text-muted-foreground">
        Choose a channel from the sidebar to start chatting with your room members.
      </p>
    </div>
  </div>
);

export default AppShell;