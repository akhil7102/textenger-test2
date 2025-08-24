import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Textenger - Home</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to your gaming communication hub
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="gradient-border hover-glow">
          <CardHeader>
            <CardTitle className="gradient-text">About Textenger</CardTitle>
            <CardDescription>
              A modern chat app built for gamers, combining speed, simplicity, and a clean design.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Textenger is a modern chat app built for gamers, combining speed, simplicity, and a clean design. 
              Whether you're coordinating with your squad, hanging out with friends, or building a community, 
              Textenger makes it seamless to chat, share, and connect without distractions.
            </p>
            <p className="text-foreground">
              Lightweight yet powerful, it's the perfect companion for gamers who want smooth communication 
              without the clutter.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="gradient-border hover-glow">
            <CardHeader>
              <CardTitle className="text-lg gradient-text">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Optimized for speed with minimal latency for real-time gaming communication.</p>
            </CardContent>
          </Card>
          
          <Card className="gradient-border hover-glow">
            <CardHeader>
              <CardTitle className="text-lg gradient-text">Gamer Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Built specifically for gaming communities with features that matter to gamers.</p>
            </CardContent>
          </Card>
          
          <Card className="gradient-border hover-glow">
            <CardHeader>
              <CardTitle className="text-lg gradient-text">Clean Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Distraction-free design that keeps you focused on what matters most.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}