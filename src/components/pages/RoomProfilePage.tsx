import { Users, Crown, Shield, Settings, Mic, MicOff, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomMember {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  isOnline: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
}

const mockMembers: RoomMember[] = [
  {
    id: "1",
    name: "Helena Hills",
    role: "owner",
    isOnline: true
  },
  {
    id: "2", 
    name: "Alex Chen",
    role: "admin",
    isOnline: true,
    isMuted: false
  },
  {
    id: "3",
    name: "Sarah Johnson",
    role: "member", 
    isOnline: true,
    isMuted: true
  },
  {
    id: "4",
    name: "Mike Torres",
    role: "member",
    isOnline: false
  },
  {
    id: "5",
    name: "Emma Wilson", 
    role: "member",
    isOnline: true,
    isDeafened: true
  }
];

export function RoomProfilePage() {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">Room Profile</h1>
          <p className="text-muted-foreground">Manage your gaming room settings and members</p>
        </div>

        {/* Room Info */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Users size={20} />
              Gaming Room #general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">
                  {mockMembers.filter(m => m.isOnline).length}
                </p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">{mockMembers.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">24/7</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Room Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">Configure room preferences</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Manage
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Invite Members</h3>
              <p className="text-sm text-muted-foreground mb-3">Add friends to your room</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Invite
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Moderation</h3>
              <p className="text-sm text-muted-foreground mb-3">Manage room permissions</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">Room Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover-glow"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 ${member.isOnline ? 'glow-ring' : ''}`}>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{member.name}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-xs text-muted-foreground">
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.isOnline && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
                          {member.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
                          <Volume2 size={14} className={member.isDeafened ? 'text-red-400' : ''} />
                        </Button>
                      </>
                    )}
                    {member.role !== 'owner' && (
                      <Button variant="ghost" size="sm" className="hover-glow">
                        Manage
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}