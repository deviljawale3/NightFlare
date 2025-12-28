
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './store';
import { GameState, TimeOfDay } from './types';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import PauseMenu from './components/PauseMenu';
import CraftingMenu from './components/CraftingMenu';
import InventoryPanel from './components/InventoryPanel';
import TutorialOverlay from './components/TutorialOverlay';
import AmbientSounds from './components/AmbientSounds';
import LevelClearMenu from './components/LevelClearMenu';

const SceneLighting: React.FC = () => {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const gameState = useGameStore(s => s.gameState);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);

  useFrame((_, delta) => {
    const isNight = timeOfDay === TimeOfDay.NIGHT;
    const isMenu = gameState === GameState.MAIN_MENU;
    const isTutorial = gameState === GameState.TUTORIAL;

    // Increased night visibility
    const targetAmbient = isMenu ? 0.65 : (isNight ? 0.45 : 0.8); // Was 0.2
    const targetDirIntensity = isMenu ? 1.5 : (isNight ? 0.7 : 1.8); // Was 0.4
    const targetFogColor = new THREE.Color(isNight && !isMenu ? '#0a0a0a' : '#1a2e35'); // Slightly lighter black

    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetAmbient, delta * (isMenu || isTutorial ? 3 : 0.5));
    if (directionalRef.current) directionalRef.current.intensity = THREE.MathUtils.lerp(directionalRef.current.intensity, targetDirIntensity, delta * (isMenu || isTutorial ? 3 : 0.5));

    if (fogRef.current) {
      fogRef.current.color.lerp(targetFogColor, delta * 0.5);
      // Extended fog distance for better visibility
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isNight ? 18 : 25, delta * 0.5); // Was 12
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isNight ? 65 : 80, delta * 0.5); // Was 40
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.7} />
      <directionalLight
        ref={directionalRef}
        position={[40, 60, 40]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <fog ref={fogRef} attach="fog" args={['#1a2e35', 25, 80]} />
      {timeOfDay === TimeOfDay.DAY || gameState === GameState.MAIN_MENU ? (
        <Sky sunPosition={[100, 50, 100]} turbidity={0.05} rayleigh={0.2} />
      ) : (
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
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
    transform: `translate(${(Math.random() - 0.5) * screenShake * 50}px, ${(Math.random() - 0.5) * screenShake * 50}px)`
  } : {};

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden select-none">
      <AmbientSounds />

      {/* 3D RENDER LAYER */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={shakeStyle}>
        <Canvas
          shadows
          camera={{ position: [20, 20, 20], fov: 42 }}
          gl={{ antialias: true, stencil: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
          dpr={[1, 1.5]}
        >
          <SceneLighting />
          <Suspense fallback={null}>
            <GameScene />
            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.65} far={20} color="#000000" />
          </Suspense>
        </Canvas>
      </div>

      {/* UI INTERFACE LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden safe-padding font-['Outfit']">

        {/* State-specific UI components */}
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

        {/* Modals */}
        <CraftingMenu isOpen={showCrafting} onClose={() => setShowCrafting(false)} />
        {showInventory && <InventoryPanel onClose={() => setShowInventory(false)} />}
      </div>

      {gameState === GameState.PLAYING && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/5 text-[10px] font-black tracking-[0.6em] uppercase pointer-events-none drop-shadow-md">
          Nightflare Core Protection Protocol Active
        </div>
      )}
    </div>
  );
};

export default App;
