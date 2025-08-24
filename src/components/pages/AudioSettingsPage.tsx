import { Mic, Headphones, Volume2, MicOff, Settings, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AudioSettingsPage() {
  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">Audio Settings</h1>
          <p className="text-muted-foreground">Configure your microphone and audio preferences</p>
        </div>

        {/* Quick Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="gradient-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold gradient-text">Microphone</h3>
                    <p className="text-sm text-muted-foreground">Currently enabled</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold gradient-text">Audio Output</h3>
                    <p className="text-sm text-muted-foreground">Currently enabled</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Settings */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Mic size={20} />
              Input Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Input Device</Label>
              <Select defaultValue="default">
                <SelectTrigger className="bg-muted border-0 hover-glow focus:glow-ring">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Microphone</SelectItem>
                  <SelectItem value="headset">Gaming Headset</SelectItem>
                  <SelectItem value="usb">USB Microphone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Input Volume</Label>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Slider defaultValue={[75]} max={100} step={1} className="hover-glow" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Microphone Sensitivity</Label>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <Slider defaultValue={[65]} max={100} step={1} className="hover-glow" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push to Talk</Label>
                <p className="text-sm text-muted-foreground">Hold key to speak</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Noise Suppression</Label>
                <p className="text-sm text-muted-foreground">Reduce background noise</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gradient-border hover-glow">
                <TestTube size={16} className="mr-2" />
                Test Microphone
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Settings */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Headphones size={20} />
              Output Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Output Device</Label>
              <Select defaultValue="headset">
                <SelectTrigger className="bg-muted border-0 hover-glow focus:glow-ring">
                  <SelectValue placeholder="Select output device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headset">Gaming Headset</SelectItem>
                  <SelectItem value="speakers">Desktop Speakers</SelectItem>
                  <SelectItem value="default">Default Output</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Master Volume</Label>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Slider defaultValue={[85]} max={100} step={1} className="hover-glow" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Voice Volume</Label>
                <span className="text-sm text-muted-foreground">90%</span>
              </div>
              <Slider defaultValue={[90]} max={100} step={1} className="hover-glow" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Sound Effects</Label>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Slider defaultValue={[60]} max={100} step={1} className="hover-glow" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Spatial Audio</Label>
                <p className="text-sm text-muted-foreground">Enhanced 3D audio positioning</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Settings size={20} />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Echo Cancellation</Label>
                <p className="text-sm text-muted-foreground">Prevent audio feedback</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Automatic Gain Control</Label>
                <p className="text-sm text-muted-foreground">Normalize microphone levels</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Low Latency Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce audio delay for gaming</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gradient-button hover-glow">
            <Settings size={16} className="mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}