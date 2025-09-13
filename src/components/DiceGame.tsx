import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Trophy, Coins, Target } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameStats {
  totalRolls: number;
  wins: number;
  losses: number;
  score: number;
  streak: number;
  history: Array<{prediction: number, result: number, win: boolean}>;
}

export const DiceGame = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const diceRef = useRef<THREE.Mesh>();
  const animationRef = useRef<number>();
  
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalRolls: 0,
    wins: 0,
    losses: 0,
    score: 1000,
    streak: 0,
    history: []
  });

  // Audio effects
  const playSound = useCallback((type: 'roll' | 'win' | 'lose' | 'click') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      roll: [200, 300, 400],
      win: [523, 659, 784, 880],
      lose: [146, 123, 98],
      click: [800]
    };
    
    const freq = frequencies[type];
    oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
    
    if (type === 'win') {
      freq.forEach((f, i) => {
        oscillator.frequency.setValueAtTime(f, audioContext.currentTime + i * 0.1);
      });
    } else if (type === 'roll') {
      freq.forEach((f, i) => {
        oscillator.frequency.setValueAtTime(f, audioContext.currentTime + i * 0.05);
      });
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [soundEnabled]);

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Spotlight for dramatic effect
    const spotlight = new THREE.SpotLight(0xffd700, 2, 30, Math.PI / 4);
    spotlight.position.set(0, 15, 0);
    spotlight.castShadow = true;
    scene.add(spotlight);

    // Dice geometry and material
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(1)
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(6)
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(2)
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(5)
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(3)
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: createDiceTexture(4)
      })
    ];

    const dice = new THREE.Mesh(geometry, materials);
    dice.castShadow = true;
    dice.position.y = 2;
    scene.add(dice);
    diceRef.current = dice;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0f3460,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (diceRef.current && !isRolling) {
        diceRef.current.rotation.x += 0.005;
        diceRef.current.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRolling]);

  // Create dice texture for each face
  function createDiceTexture(number: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 128;
    
    // Background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 128, 128);
    
    // Border
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeRect(4, 4, 120, 120);
    
    // Dots
    context.fillStyle = '#000000';
    const dotRadius = 8;
    const positions: { [key: number]: number[][] } = {
      1: [[64, 64]],
      2: [[32, 32], [96, 96]],
      3: [[32, 32], [64, 64], [96, 96]],
      4: [[32, 32], [96, 32], [32, 96], [96, 96]],
      5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
      6: [[32, 32], [96, 32], [32, 64], [96, 64], [32, 96], [96, 96]]
    };
    
    positions[number].forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, dotRadius, 0, Math.PI * 2);
      context.fill();
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Roll dice animation
  const rollDice = useCallback(() => {
    if (isRolling || prediction === null) return;

    setIsRolling(true);
    playSound('roll');

    // Generate result immediately
    const result = Math.floor(Math.random() * 6) + 1;

    let rollCount = 0;
    const maxRolls = 60; // 3 seconds at 50ms per roll

    const rollAnimation = () => {
      if (diceRef.current && rollCount < maxRolls) {
        diceRef.current.rotation.x += 0.3;
        diceRef.current.rotation.y += 0.3;
        diceRef.current.rotation.z += 0.2;

        rollCount++;
        setTimeout(rollAnimation, 50);
      } else {
        // Final result
        setDiceResult(result);

        // Check win/loss
        const isWin = result === prediction;
        const pointsChange = isWin ? 100 : -50;

        setGameStats(prev => ({
          totalRolls: prev.totalRolls + 1,
          wins: prev.wins + (isWin ? 1 : 0),
          losses: prev.losses + (isWin ? 0 : 1),
          score: Math.max(0, prev.score + pointsChange),
          streak: isWin ? prev.streak + 1 : 0,
          history: [...prev.history.slice(-9), {prediction, result, win: isWin}]
        }));

        // Position dice to show result
        if (diceRef.current) {
          const rotations: { [key: number]: [number, number, number] } = {
            1: [0, 0, 0],
            2: [0, 0, -Math.PI/2],
            3: [0, 0, -Math.PI],
            4: [0, 0, Math.PI/2],
            5: [-Math.PI/2, 0, 0],
            6: [Math.PI/2, 0, 0]
          };

          const [x, y, z] = rotations[result];
          diceRef.current.rotation.set(x, y, z);
        }

        playSound(isWin ? 'win' : 'lose');
        toast(isWin ?
          `🎉 You won! Predicted ${prediction}, rolled ${result}` :
          `😔 You lost! Predicted ${prediction}, rolled ${result}`
        );

        setShowResultPopup(true);
        setIsRolling(false);
      }
    };

    rollAnimation();
  }, [isRolling, prediction, playSound]);

  const makePrediction = (number: number) => {
    playSound('click');
    setPrediction(number);
    setDiceResult(null);
    setShowResultPopup(false);
  };

  const resetGame = () => {
    playSound('click');
    setGameStats({
      totalRolls: 0,
      wins: 0,
      losses: 0,
      score: 1000,
      streak: 0,
      history: []
    });
    setPrediction(null);
    setDiceResult(null);
    setShowResultPopup(false);
    toast("Game reset! Good luck! 🎲");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            🎲 CASINO DICE MASTER 🎲
          </h1>
          <p className="text-xl text-muted-foreground">
            Predict the dice roll and win big! Test your luck in this premium 3D experience.
          </p>
        </div>

        <div className="flex flex-row justify-center gap-6 min-h-[600px]">
          {/* Left Side - Tabs for Game Stats and History */}
          <div className="w-1/4">
            <Tabs defaultValue="stats" className="space-y-4">
              <TabsList>
                <TabsTrigger value="stats">Game Stats</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="stats">
                <Card className="casino-glass animate-fade-in-up">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Score:</span>
                      <Badge variant="default" className="casino-gold-gradient animate-pulse-subtle">
                        <Coins className="w-3 h-3 mr-1" />
                        {gameStats.score}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Rolls:</span>
                      <span className="font-bold">{gameStats.totalRolls}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">Wins:</span>
                      <span className="font-bold text-green-400">{gameStats.wins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Losses:</span>
                      <span className="font-bold text-red-400">{gameStats.losses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary">Win Streak:</span>
                      <span className="font-bold text-primary">{gameStats.streak}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="font-bold">
                        {gameStats.totalRolls > 0 ? Math.round((gameStats.wins / gameStats.totalRolls) * 100) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card className="casino-glass animate-fade-in-up max-h-[400px] overflow-y-auto">
                  <CardContent className="space-y-2 pt-6">
                    {gameStats.history.length === 0 ? (
                      <p className="text-muted-foreground text-center">No history yet.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {gameStats.history.map((entry, index) => (
                          <li key={index} className="flex justify-between">
                            <span>Predicted: {entry.prediction}</span>
                            <span>Result: {entry.result}</span>
                            <span className={entry.win ? "text-green-500" : "text-red-500"}>
                              {entry.win ? "Win" : "Loss"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Main Game Area */}
          <div className="flex-1">
            <Card className="casino-glass animate-fade-in-up h-full">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  3D Dice Arena
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="ml-auto"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6 flex flex-col h-full">
                {/* 3D Dice Container */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="casino-neon-border rounded-lg overflow-hidden">
                    <div ref={mountRef} className="w-[400px] h-[400px]" />
                  </div>
                </div>

                {/* Prediction Buttons */}
                <div>
                  <p className="text-lg mb-4 font-semibold">Choose your prediction:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        onClick={() => makePrediction(num)}
                        variant={prediction === num ? "default" : "outline"}
                        className={`h-16 text-xl font-bold transition-all ${
                          prediction === num
                            ? "casino-gold-gradient animate-gold-glow"
                            : "hover:scale-105"
                        } ${
                          diceResult === num && prediction === num
                            ? "ring-4 ring-green-400"
                            : diceResult === num
                            ? "ring-4 ring-primary"
                            : ""
                        }`}
                        disabled={isRolling}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Roll Button */}
                <Button
                  onClick={rollDice}
                  disabled={isRolling || prediction === null}
                  size="lg"
                  className="w-full h-16 text-xl font-bold casino-gold-gradient hover:scale-105 transition-all animate-pulse-subtle"
                >
                  {isRolling ? (
                    <span className="animate-spin-3d">🎲</span>
                  ) : (
                    "ROLL THE DICE!"
                  )}
                </Button>

                {/* Result Display */}
                {diceResult && !isRolling && (
                  <div className="text-center animate-fade-in-up">
                    <p className="text-2xl font-bold mb-2">
                      Result: <span className="text-primary text-4xl">{diceResult}</span>
                    </p>
                    {prediction === diceResult ? (
                      <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                        🎉 WINNER! +100 Points
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                        😔 Try Again! -50 Points
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Tabs for Game Controls and Rules */}
          <div className="w-1/4">
            <Tabs defaultValue="controls" className="space-y-4">
              <TabsList>
                <TabsTrigger value="controls">Game Controls</TabsTrigger>
                <TabsTrigger value="rules">Game Rules</TabsTrigger>
              </TabsList>
              <TabsContent value="controls">
                <Card className="casino-glass animate-fade-in-up">
                  <CardHeader>
                    <CardTitle>How to Play:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Select a number (1-6)</li>
                      <li>• Click "ROLL THE DICE!"</li>
                      <li>• Win: +100 points</li>
                      <li>• Loss: -50 points</li>
                      <li>• Build your winning streak!</li>
                    </ul>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="w-full hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Reset Game
                    </Button>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        Premium 3D Gaming Experience<br />
                        Powered by Three.js & WebGL
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rules">
                <Card className="casino-glass animate-fade-in-up">
                  <CardHeader>
                    <CardTitle>Game Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Choose a number between 1 and 6.</p>
                    <p>2. Click the "ROLL THE DICE!" button to roll the dice.</p>
                    <p>3. If your prediction matches the dice result, you win 100 points.</p>
                    <p>4. If your prediction does not match, you lose 50 points.</p>
                    <p>5. Build your winning streak to increase your score.</p>
                    <p>6. Have fun and test your luck!</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Result Popup */}
        <Dialog open={showResultPopup} onOpenChange={setShowResultPopup}>
          <DialogContent className="casino-glass animate-fade-in-up">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                🎲 Dice Roll Result 🎲
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary animate-bounce">
                {diceResult}
              </div>
              <div className="text-lg">
                You predicted: <span className="font-bold text-accent">{prediction}</span>
              </div>
              <div className="text-lg">
                Result: <span className="font-bold text-primary">{diceResult}</span>
              </div>
              {prediction === diceResult ? (
                <div className="animate-pulse text-green-400 text-xl font-bold">
                  🎉 WIN! +100 Points 🎉
                </div>
              ) : (
                <div className="animate-pulse text-red-400 text-xl font-bold">
                  😔 LOSS! -50 Points 😔
                </div>
              )}
              <div className="text-sm text-muted-foreground animate-fade-in mt-4 p-4 bg-muted rounded-lg">
                💡 The higher the bet amount, the more winning chances you got! 💰
              </div>
              <Button
                onClick={() => setShowResultPopup(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
