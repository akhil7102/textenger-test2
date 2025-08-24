import { useState, useEffect } from "react";
import { Edit, Camera, Shield, Bell, Gamepad2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  favorite_game?: string;
  current_rank?: string;
  steam_id?: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    favorite_game: "",
    current_rank: "",
    steam_id: ""
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        display_name: data.display_name || "",
        username: data.username || "",
        bio: data.bio || "",
        favorite_game: data.favorite_game || "",
        current_rank: data.current_rank || "",
        steam_id: data.steam_id || ""
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          username: formData.username,
          bio: formData.bio,
          favorite_game: formData.favorite_game,
          current_rank: formData.current_rank,
          steam_id: formData.steam_id
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully!");
      loadProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded gradient-border"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded gradient-border"></div>
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded gradient-border"></div>
                <div className="h-48 bg-muted rounded gradient-border"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold gradient-text">Profile Settings</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Avatar Section */}
          <Card className="gradient-border hover-glow">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 avatar-glow">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl gradient-button">
                    {(profile?.display_name || profile?.username || 'U')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full gradient-button hover-glow flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera size={14} />
                  )}
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click the camera icon to change your avatar"}
              </p>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="gradient-border hover-glow">
              <CardHeader>
                <CardTitle className="gradient-text">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ""} 
                    disabled
                    className="bg-muted/50 border-0 opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..." 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-muted border-0 hover-glow focus:glow-ring"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border hover-glow">
              <CardHeader>
                <CardTitle className="gradient-text">Gaming Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="favoriteGame">Favorite Game</Label>
                    <Input 
                      id="favoriteGame" 
                      placeholder="Valorant, CS2, etc." 
                      value={formData.favorite_game}
                      onChange={(e) => setFormData({ ...formData, favorite_game: e.target.value })}
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank">Current Rank</Label>
                    <Input 
                      id="rank" 
                      placeholder="Diamond, Global Elite, etc." 
                      value={formData.current_rank}
                      onChange={(e) => setFormData({ ...formData, current_rank: e.target.value })}
                      className="bg-muted border-0 hover-glow focus:glow-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steamId">Steam ID</Label>
                  <Input 
                    id="steamId" 
                    placeholder="Your Steam profile URL" 
                    value={formData.steam_id}
                    onChange={(e) => setFormData({ ...formData, steam_id: e.target.value })}
                    className="bg-muted border-0 hover-glow focus:glow-ring"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground mb-3">Manage your privacy settings</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Bell className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Notifications</h3>
              <p className="text-sm text-muted-foreground mb-3">Customize your alerts</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Manage
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-border hover-glow">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold gradient-text mb-2">Gaming</h3>
              <p className="text-sm text-muted-foreground mb-3">Game integrations & status</p>
              <Button variant="outline" size="sm" className="gradient-border hover-glow">
                Setup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="gradient-button hover-glow"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Edit size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}