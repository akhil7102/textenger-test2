import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, UserCheck, User } from 'lucide-react';

interface MemberProfile {
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface Member {
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  profiles: MemberProfile;
}

const MemberList = () => {
  const { currentRoomId } = useAppStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRoomId) {
      loadMembers();
    }
  }, [currentRoomId]);

  const loadMembers = async () => {
    if (!currentRoomId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles!room_members_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('room_id', currentRoomId)
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'admin':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'moderator':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const roleOrder = ['owner', 'admin', 'moderator', 'member'];

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <h3 className="font-semibold mb-4">Members</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Members ({members.length})</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {roleOrder.map((role) => {
            const roleMembers = groupedMembers[role];
            if (!roleMembers || roleMembers.length === 0) return null;

            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  {getRoleIcon(role)}
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {role}s ({roleMembers.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {roleMembers.map((member) => {
                    const profile = member.profiles;
                    const displayName = profile?.display_name || profile?.username || 'Unknown User';

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold relative">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            displayName[0]?.toUpperCase()
                          )}
                          
                          {/* Online indicator - placeholder for now */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {displayName}
                            </span>
                            {member.role !== 'member' && (
                              <Badge variant="secondary" className={`text-xs ${getRoleColor(member.role)}`}>
                                {member.role}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate">
                            @{profile?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MemberList;