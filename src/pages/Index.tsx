import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiceGame } from "@/components/DiceGame";
import { AdminPanel } from "@/components/AdminPanel";
import { Settings, Gamepad2 } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'game' | 'admin'>('game');

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setCurrentView('game')}
            variant="outline"
            className="casino-glass"
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Access Button */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="casino-glass">
          <CardContent className="p-4">
            <Button
              onClick={() => setCurrentView('admin')}
              variant="outline"
              className="casino-neon-border hover:casino-gold-gradient"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Game */}
      <DiceGame />
    </div>
  );
};

export default Index;
