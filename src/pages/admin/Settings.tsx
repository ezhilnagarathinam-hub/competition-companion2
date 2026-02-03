import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage platform settings</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Configure global settings for the test platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <SettingsIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Settings configuration coming soon.</p>
            <p className="text-sm mt-2">Competition-specific colors and timers can be set per competition.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
