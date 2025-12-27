
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState, TimeOfDay } from '../types';
import GameScene from './GameScene';
import HUD from './HUD';
import MainMenu from './MainMenu';
import GameOver from './GameOver';
import PauseMenu from './PauseMenu';
import CraftingMenu from './CraftingMenu';
import InventoryPanel from './InventoryPanel';
import TutorialOverlay from './TutorialOverlay';
import AmbientSounds from './AmbientSounds';
import LevelClearMenu from './LevelClearMenu';

const SceneLighting: React.FC = () => {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const gameState = useGameStore(s => s.gameState);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);
  
  useFrame((_, delta) => {
    const isNight = timeOfDay === TimeOfDay.NIGHT;
    const isMenu = gameState === GameState.MAIN_MENU;
    
    // Constant clear lighting for menu background, gradual lerp for gameplay
    const targetAmbient = isMenu ? 0.6 : (isNight ? 0.15 : 0.7);
    const targetDir = isMenu ? 1.4 : (isNight ? 0.3 : 1.6);
    const targetFogColor = new THREE.Color(isNight && !isMenu ? '#050505' : '#1a2e35');
    
    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetAmbient, delta * (isMenu ? 2 : 0.2));
    if (directionalRef.current) directionalRef.current.intensity = THREE.MathUtils.lerp(directionalRef.current.intensity, targetDir, delta * (isMenu ? 2 : 0.2));
    if (fogRef.current) {
        fogRef.current.color.lerp(targetFogColor, delta * 0.2);
        fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isNight ? 10 : 20, delta * 0.2);
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isNight ? 45 : 65, delta * 0.2);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.6} />
      <directionalLight 
        ref={directionalLight => {
          if (directionalLight) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.set(1024, 1024);
            directionalLight.shadow.camera.left = -30;
            directionalLight.shadow.camera.right = 30;
            directionalLight.shadow.camera.top = 30;
            directionalLight.shadow.camera.bottom = -30;
          }
        }}
        position={[50, 50, 50]} 
        intensity={1.2} 
      />
      <fog ref={fogRef} attach="fog" args={['#1a2e35', 20, 65]} />
      {timeOfDay === TimeOfDay.DAY || gameState === GameState.MAIN_MENU ? (
        <Sky sunPosition={[100, 40, 100]} turbidity={0.1} rayleigh={0.5} />
      ) : (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
    </>
  );
};

const App: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const screenShake = useGameStore(s => s.screenShake);
  const saveGame = useGameStore(s => s.saveGame);
  
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      const interval = setInterval(saveGame, 60000);
      return () => clearInterval(interval);
    }
  }, [gameState, saveGame]);

  const shakeStyle = screenShake > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * screenShake * 60}px, ${(Math.random() - 0.5) * screenShake * 60}px)`
  } : {};

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden">
      <AmbientSounds />
      
      {/* 3D Content Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={shakeStyle}>
        <Canvas 
          shadows 
          camera={{ position: [20, 20, 20], fov: 38 }} 
          gl={{ antialias: true, stencil: false, alpha: false, powerPreference: "high-performance" }} 
          dpr={[1, 2]}
          resize={{ scroll: false, offsetSize: true }}
        >
          <SceneLighting />
          <Suspense fallback={null}>
            <GameScene />
            <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.6} far={20} color="#000000" />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Layer Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden safe-padding">
        {gameState === GameState.MAIN_MENU && <MainMenu />}
        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.TUTORIAL || gameState === GameState.LEVEL_CLEAR) && (
          <HUD 
            onOpenInventory={() => setShowInventory(true)} 
            onOpenCrafting={() => setShowCrafting(true)}
          />
        )}
        {gameState === GameState.PAUSED && <PauseMenu />}
        {gameState === GameState.GAME_OVER && <GameOver />}
        {gameState === GameState.TUTORIAL && <TutorialOverlay />}
        {gameState === GameState.LEVEL_CLEAR && <LevelClearMenu />}
        
        <CraftingMenu isOpen={showCrafting} onClose={() => setShowCrafting(false)} />
        {showInventory && <InventoryPanel onClose={() => setShowInventory(false)} />}
      </div>
    </div>
  );
};

export default App;
