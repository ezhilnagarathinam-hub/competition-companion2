import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Phone, Globe, Shield, Palette, Save, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAdminAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { adminId, adminName } = useAdminAuth();

  // Platform settings (stored in localStorage for now)
  const [platformName, setPlatformName] = useState(() => localStorage.getItem('platform_name') || 'COMPETE ME');
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem('contact_phone') || '9487277924');
  const [contactEmail, setContactEmail] = useState(() => localStorage.getItem('contact_email') || '');
  const [welcomeMessage, setWelcomeMessage] = useState(() => localStorage.getItem('welcome_message') || 'Welcome to the competition platform!');
  const [autoLockAfterSubmit, setAutoLockAfterSubmit] = useState(() => localStorage.getItem('auto_lock') !== 'false');
  const [showResultsDefault, setShowResultsDefault] = useState(() => localStorage.getItem('show_results_default') === 'true');
  const [showLeaderboardDefault, setShowLeaderboardDefault] = useState(() => localStorage.getItem('show_leaderboard_default') === 'true');

  // Admin profile
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (adminId) fetchAdminProfile();
  }, [adminId]);

  async function fetchAdminProfile() {
    const { data } = await supabase.from('admins').select('email').eq('id', adminId).single();
    if (data) setAdminEmail(data.email);
  }

  function savePlatformSettings() {
    localStorage.setItem('platform_name', platformName);
    localStorage.setItem('contact_phone', contactPhone);
    localStorage.setItem('contact_email', contactEmail);
    localStorage.setItem('welcome_message', welcomeMessage);
    localStorage.setItem('auto_lock', String(autoLockAfterSubmit));
    localStorage.setItem('show_results_default', String(showResultsDefault));
    localStorage.setItem('show_leaderboard_default', String(showLeaderboardDefault));
    toast.success('Platform settings saved!');
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) {
      toast.error('Fill in both current and new password');
      return;
    }
    try {
      // SECURITY WARNING: Insecure client-side password verification against direct database column.
      // This should be replaced with Supabase Auth or server-side hashing in a production environment.
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', adminId)
        .eq('password_hash', currentPassword)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Current password is incorrect');
        return;
      }

      // SECURITY WARNING: Insecure client-side password update.
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: newPassword })
        .eq('id', adminId);

      if (updateError) throw updateError;
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to change password');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-display">SETTINGS</h1>
        <p className="text-muted-foreground mt-1">Manage platform configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Platform Information
            </CardTitle>
            <CardDescription>General platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>Displayed to students for enrollment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="9487277924" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Competition Defaults */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Competition Defaults
            </CardTitle>
            <CardDescription>Default settings for new competitions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-lock after submission</Label>
                <p className="text-xs text-muted-foreground">Lock students automatically after they submit</p>
              </div>
              <Switch checked={autoLockAfterSubmit} onCheckedChange={setAutoLockAfterSubmit} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show results by default</Label>
                <p className="text-xs text-muted-foreground">New competitions show results to students</p>
              </div>
              <Switch checked={showResultsDefault} onCheckedChange={setShowResultsDefault} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show leaderboard by default</Label>
                <p className="text-xs text-muted-foreground">New competitions show leaderboard</p>
              </div>
              <Switch checked={showLeaderboardDefault} onCheckedChange={setShowLeaderboardDefault} />
            </div>
          </CardContent>
        </Card>

        {/* Admin Profile */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Profile
            </CardTitle>
            <CardDescription>Manage your admin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{adminName}</p>
                <p className="text-sm text-muted-foreground">{adminEmail}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button onClick={changePassword} variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={savePlatformSettings} className="gradient-primary text-primary-foreground shadow-primary">
        <Save className="w-4 h-4 mr-2" />
        Save Platform Settings
      </Button>
    </div>
  );
}
