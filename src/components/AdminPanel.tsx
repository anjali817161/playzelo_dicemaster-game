import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Shield,
  Database,
  Gamepad2,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface GameSettings {
  winMultiplier: number;
  lossDeduction: number;
  maxBetAmount: number;
  minBetAmount: number;
  houseEdge: number;
  autoRollEnabled: boolean;
  soundEnabled: boolean;
  maxPlayersOnline: number;
}

interface PlayerStats {
  id: string;
  username: string;
  balance: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  lastActive: string;
  status: 'online' | 'offline';
}

interface SystemStats {
  totalPlayers: number;
  activeNow: number;
  totalGamesPlayed: number;
  totalRevenue: number;
  serverUptime: string;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export const AdminPanel = () => {
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    winMultiplier: 2.0,
    lossDeduction: 50,
    maxBetAmount: 1000,
    minBetAmount: 10,
    houseEdge: 5.5,
    autoRollEnabled: false,
    soundEnabled: true,
    maxPlayersOnline: 100
  });

  const [players, setPlayers] = useState<PlayerStats[]>([
    {
      id: '1',
      username: 'Player_001',
      balance: 2500,
      totalBets: 45,
      totalWins: 18,
      totalLosses: 27,
      lastActive: '2 mins ago',
      status: 'online'
    },
    {
      id: '2', 
      username: 'LuckyGamer',
      balance: 1200,
      totalBets: 23,
      totalWins: 12,
      totalLosses: 11,
      lastActive: '5 mins ago',
      status: 'online'
    },
    {
      id: '3',
      username: 'DiceKing',
      balance: 850,
      totalBets: 67,
      totalWins: 22,
      totalLosses: 45,
      lastActive: '1 hour ago',
      status: 'offline'
    }
  ]);

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalPlayers: 1247,
    activeNow: 23,
    totalGamesPlayed: 15680,
    totalRevenue: 45230,
    serverUptime: '99.8%',
    systemHealth: 'excellent'
  });

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Update settings
  const updateGameSettings = (key: keyof GameSettings, value: any) => {
    setGameSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast("Settings updated successfully!");
  };

  // Player management functions
  const adjustPlayerBalance = (playerId: string, amount: number) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, balance: Math.max(0, player.balance + amount) }
        : player
    ));
    toast(`Player balance ${amount > 0 ? 'increased' : 'decreased'} by $${Math.abs(amount)}`);
  };

  const forceWin = (playerId: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { 
            ...player, 
            totalWins: player.totalWins + 1,
            balance: player.balance + gameSettings.winMultiplier * 100
          }
        : player
    ));
    toast("Forced win applied to player!");
  };

  const forceLoss = (playerId: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { 
            ...player, 
            totalLosses: player.totalLosses + 1,
            balance: Math.max(0, player.balance - gameSettings.lossDeduction)
          }
        : player
    ));
    toast("Forced loss applied to player!");
  };

  const kickPlayer = (playerId: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, status: 'offline' as const }
        : player
    ));
    toast("Player has been disconnected!");
  };

  // Auto-update system stats
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeNow: Math.floor(Math.random() * 50) + 10,
        totalGamesPlayed: prev.totalGamesPlayed + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🛡️ CASINO ADMIN CONTROL PANEL 🛡️
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete control over your 3D Dice Casino - Manage players, settings, and game outcomes
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="casino-glass">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{systemStats.activeNow}</p>
                <p className="text-sm text-muted-foreground">Online Now</p>
              </CardContent>
            </Card>
            <Card className="casino-glass">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold">{systemStats.totalGamesPlayed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Games</p>
              </CardContent>
            </Card>
            <Card className="casino-glass">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">${systemStats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </CardContent>
            </Card>
            <Card className="casino-glass">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold">{systemStats.serverUptime}</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 casino-glass">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Game Settings
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Player Management
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Game Control
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Game Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Game Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Win Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={gameSettings.winMultiplier}
                      onChange={(e) => updateGameSettings('winMultiplier', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Loss Deduction ($)</Label>
                    <Input
                      type="number"
                      value={gameSettings.lossDeduction}
                      onChange={(e) => updateGameSettings('lossDeduction', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>House Edge (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={gameSettings.houseEdge}
                      onChange={(e) => updateGameSettings('houseEdge', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Players Online</Label>
                    <Input
                      type="number"
                      value={gameSettings.maxPlayersOnline}
                      onChange={(e) => updateGameSettings('maxPlayersOnline', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Betting Limits & Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Maximum Bet ($)</Label>
                    <Input
                      type="number"
                      value={gameSettings.maxBetAmount}
                      onChange={(e) => updateGameSettings('maxBetAmount', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum Bet ($)</Label>
                    <Input
                      type="number"
                      value={gameSettings.minBetAmount}
                      onChange={(e) => updateGameSettings('minBetAmount', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto Roll Feature</Label>
                    <Switch
                      checked={gameSettings.autoRollEnabled}
                      onCheckedChange={(checked) => updateGameSettings('autoRollEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Global Sound Effects</Label>
                    <Switch
                      checked={gameSettings.soundEnabled}
                      onCheckedChange={(checked) => updateGameSettings('soundEnabled', checked)}
                    />
                  </div>

                  <Button 
                    className="w-full casino-gold-gradient"
                    onClick={() => toast("All settings have been applied to live games!")}
                  >
                    Apply Settings to Live Games
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Player Management Tab */}
          <TabsContent value="players">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Players</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                  >
                    {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showSensitiveData ? 'Hide' : 'Show'} Balances
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="casino-glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-bold text-lg">{player.username}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant={player.status === 'online' ? 'default' : 'secondary'}>
                                {player.status}
                              </Badge>
                              <span>Last active: {player.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {showSensitiveData && (
                            <div className="text-right">
                              <p className="font-bold text-lg">${player.balance}</p>
                              <p className="text-sm text-muted-foreground">
                                W:{player.totalWins} L:{player.totalLosses}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => adjustPlayerBalance(player.id, 100)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                +$100
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustPlayerBalance(player.id, -100)}
                              >
                                -$100
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => forceWin(player.id)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Force Win
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => forceLoss(player.id)}
                              >
                                Force Loss
                              </Button>
                            </div>
                          </div>
                          
                          {player.status === 'online' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => kickPlayer(player.id)}
                            >
                              Kick
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Game Control Tab */}
          <TabsContent value="control">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Dice Control Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Label className="text-center font-semibold">Force Next Roll:</Label>
                    <div></div>
                    <div></div>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        className="h-12 text-lg font-bold hover:bg-primary hover:text-primary-foreground"
                        onClick={() => toast(`Next dice roll will be: ${num}`)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => toast("Random mode enabled - dice outcomes are now truly random")}
                    >
                      Enable Random Mode
                    </Button>
                    <Button 
                      className="w-full bg-yellow-500 hover:bg-yellow-600" 
                      onClick={() => toast("House advantage mode activated!")}
                    >
                      Activate House Edge
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full casino-gold-gradient"
                    onClick={() => toast("Jackpot event triggered! All players receive bonus!")}
                  >
                    🎉 Trigger Jackpot Event
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    onClick={() => toast("Lucky hour activated - increased win rates for 60 minutes!")}
                  >
                    ⭐ Start Lucky Hour
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast("All player statistics have been reset!")}
                  >
                    Reset All Player Stats
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => toast("Emergency shutdown initiated - all games paused!")}
                  >
                    🚨 Emergency Shutdown
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Today's Revenue:</span>
                      <span className="font-bold text-green-400">$2,340</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week:</span>
                      <span className="font-bold text-green-400">$16,780</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold text-green-400">$45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span>House Edge:</span>
                      <span className="font-bold text-primary">{gameSettings.houseEdge}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle>Player Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Registered:</span>
                      <span className="font-bold">{systemStats.totalPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Today:</span>
                      <span className="font-bold">{systemStats.activeNow + 45}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Session:</span>
                      <span className="font-bold">24 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return Rate:</span>
                      <span className="font-bold text-green-400">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glass">
                <CardHeader>
                  <CardTitle>Game Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Games Played:</span>
                      <span className="font-bold">{systemStats.totalGamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Bet Size:</span>
                      <span className="font-bold">$127</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-bold">16.67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Health:</span>
                      <Badge className="bg-green-500">
                        {systemStats.systemHealth}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};