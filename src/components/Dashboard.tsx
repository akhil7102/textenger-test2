import { useState } from "react";
import { MainNavigation } from "./MainNavigation";
import { ChatList } from "./ChatList";
import { DirectMessageWindow } from "./DirectMessageWindow";
import { ProfilePanel } from "./ProfilePanel";
import { HomePage } from "./pages/HomePage";
import { BrowseFriendsPage } from "./pages/BrowseFriendsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RoomProfilePage } from "./pages/RoomProfilePage";
import { AudioSettingsPage } from "./pages/AudioSettingsPage";
import { RoomChatPage } from "./pages/RoomChatPage";

export function Dashboard() {
  const [activePage, setActivePage] = useState("home");
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

  const handleMessageUser = (userId: string) => {
    setSelectedChatUserId(userId);
    setActivePage("direct-messages");
  };

  const renderMainContent = () => {
    switch (activePage) {
      case "home":
        return <HomePage />;
      case "browse-friends":
        return <BrowseFriendsPage onMessageUser={handleMessageUser} />;
      case "profile":
        return <ProfilePage />;
      case "room-profile":
        return <RoomProfilePage />;
      case "audio-settings":
        return <AudioSettingsPage />;
      case "room-chat":
        return <RoomChatPage />;
      case "direct-messages":
      default:
        return (
          <>
            <ChatList onSelectChat={setSelectedChatUserId} selectedUserId={selectedChatUserId} />
            {selectedChatUserId ? (
              <DirectMessageWindow otherUserId={selectedChatUserId} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center">
                  <h3 className="text-xl font-semibold gradient-text mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging!</p>
                </div>
              </div>
            )}
            <ProfilePanel otherUserId={selectedChatUserId} />
          </>
        );
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <MainNavigation onPageChange={setActivePage} activePage={activePage} />
      {renderMainContent()}
    </div>
  );
}