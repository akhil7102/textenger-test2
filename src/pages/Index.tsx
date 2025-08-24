import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading Textenger...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Dashboard />;
};

export default Index;
