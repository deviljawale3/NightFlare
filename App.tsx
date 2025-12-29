import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './store';
import { GameState, TimeOfDay } from './types';
import GameScene from './components/GameScene';
import PremiumHUD from './components/PremiumHUD';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import PauseMenu from './components/PauseMenu';
import CraftingMenu from './components/CraftingMenu';
import InventoryPanel from './components/InventoryPanel';
import TutorialOverlay from './components/TutorialOverlay';
import AmbientSounds from './components/AmbientSounds';
import LevelClearMenu from './components/LevelClearMenu';
import TournamentHub from './components/TournamentHub';
import FriendsPanel from './components/FriendsPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SeasonPanel from './components/SeasonPanel';

// Premium Features
import LoadingScreen from './components/LoadingScreen';
import { AchievementPopup, useAchievementStore } from './components/AchievementSystem';
import { DailyRewardModal, useDailyRewardStore } from './components/DailyRewards';
import SettingsPanel, { useSettingsStore } from './components/SettingsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import SoundEffects from './components/SoundEffects';
import HapticFeedback from './components/HapticFeedback';
import ScreenEffects from './components/ScreenEffects';

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

    const targetAmbient = isMenu ? 0.65 : (isNight ? 0.45 : 0.8);
    const targetDirIntensity = isMenu ? 1.5 : (isNight ? 0.7 : 1.8);
    const targetFogColor = new THREE.Color(isNight && !isMenu ? '#0a0a0a' : '#1a2e35');

    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetAmbient, delta * (isMenu || isTutorial ? 3 : 0.5));
    if (directionalRef.current) directionalRef.current.intensity = THREE.MathUtils.lerp(directionalRef.current.intensity, targetDirIntensity, delta * (isMenu || isTutorial ? 3 : 0.5));

    if (fogRef.current) {
      fogRef.current.color.lerp(targetFogColor, delta * 0.5);
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isNight ? 18 : 25, delta * 0.5);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isNight ? 65 : 80, delta * 0.5);
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

// V8.0 HIGH PERFORMANCE CAMERA ENGINE - REDESIGNED FOR ABSOLUTE RELIABILITY
const CameraManager: React.FC = () => {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    // 1. Get Live State Directly from Store (Zero Latency)
    const settings = useSettingsStore.getState();
    const rawPos = (window as any).playerPos;
    const playerPos = rawPos ? rawPos.clone() : new THREE.Vector3(0, 0, 0);

    // 2. Logic Selection
    const offset = new THREE.Vector3();
    let targetFov = 50;

    if (settings.cameraPreset === 'FREE') {
      const rad = (settings.cameraAngle * Math.PI) / 180;
      const d = settings.cameraDistance;
      // Stable Orbital Sphere
      offset.set(
        Math.sin(rad) * d * 0.9,
        d * 0.55 + 2,
        Math.cos(rad) * d * 0.9
      );
      // Dynamic FOV for 'Cinematic' zoom feel
      targetFov = Math.max(45, Math.min(65, 75 - (d * 0.8)));
    } else {
      switch (settings.cameraPreset) {
        case 'CLOSE': offset.set(0, 1.8, 3.5); targetFov = 65; break;
        case 'TOP_DOWN': offset.set(0, 22, 0); targetFov = 35; break;
        case 'SIDE': offset.set(12, 3, 0); targetFov = 50; break;
        case 'ISOMETRIC': offset.set(8, 8, 8); targetFov = 45; break;
        default: offset.set(0, 6, 9); targetFov = 55; break; // Master Action Perspective
      }
    }

    // 3. SNAPPY APPLICATION (Pro Response)
    const targetPos = playerPos.clone().add(offset);
    camera.position.lerp(targetPos, 0.15);

    lookAtTarget.current.lerp(playerPos, 0.2);
    camera.lookAt(lookAtTarget.current);

    // 4. Hard Matrix Sync
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== targetFov) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

const App: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const screenShake = useGameStore(s => s.screenShake);
  const saveGame = useGameStore(s => s.saveGame);
  const [isLoading, setIsLoading] = useState(true);

  // Store Hooks
  const { initializeAchievements } = useAchievementStore();
  const { initializeRewards, canClaimToday, setShowRewardModal } = useDailyRewardStore();
  const settings = useSettingsStore();
  const cameraPreset = useSettingsStore(s => s.cameraPreset); // For Canvas key

  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showTournament, setShowTournament] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSeason, setShowSeason] = useState(false);

  useEffect(() => {
    initializeAchievements();
    initializeRewards();
    if (canClaimToday()) {
      setTimeout(() => setShowRewardModal(true), 3500);
    }
    if (settings.textSize === 'large') document.documentElement.style.fontSize = '18px';
    else if (settings.textSize === 'small') document.documentElement.style.fontSize = '14px';
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      const interval = setInterval(saveGame, 60000);
      return () => clearInterval(interval);
    }
  }, [gameState, saveGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;
      if (e.code === 'KeyI') setShowInventory(prev => !prev);
      if (e.code === 'KeyC') setShowCrafting(prev => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const shakeStyle = screenShake > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * screenShake * 50}px, ${(Math.random() - 0.5) * screenShake * 50}px)`
  } : {};

  const isModalOpen = showTournament || showFriends || showAnalytics || showSeason || settings.isOpen;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 w-full h-[100dvh] bg-[#050505] overflow-hidden select-none safe-padding">
        <SoundEffects />
        <HapticFeedback />
        {(gameState === GameState.PLAYING || gameState === GameState.TUTORIAL) && <ScreenEffects />}

        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        <AchievementPopup />
        <DailyRewardModal />
        {settings.isOpen && <SettingsPanel />}
        <AmbientSounds />

        {!isLoading && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={shakeStyle}>
            <Canvas
              shadows
              gl={{
                antialias: settings.quality !== 'low',
                stencil: false,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2
              }}
              dpr={[1, 2]}
            >
              <CameraManager />
              <SceneLighting />
              <Suspense fallback={null}>
                <GameScene />
                {settings.shadows && (
                  <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.65} far={20} color="#000000" />
                )}
              </Suspense>
            </Canvas>
          </div>
        )}

        {!isLoading && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden safe-padding font-['Outfit']">
            {gameState === GameState.MAIN_MENU && !isModalOpen && (
              <MainMenu
                showTournament={() => setShowTournament(true)}
                showFriends={() => setShowFriends(true)}
                showAnalytics={() => setShowAnalytics(true)}
                showSeason={() => setShowSeason(true)}
              />
            )}

            {showTournament && <TournamentHub onBack={() => setShowTournament(false)} />}
            {showFriends && <FriendsPanel onBack={() => setShowFriends(false)} />}
            {showAnalytics && <AnalyticsDashboard onBack={() => setShowAnalytics(false)} />}
            {showSeason && <SeasonPanel onBack={() => setShowSeason(false)} />}

            {(gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.TUTORIAL || gameState === GameState.LEVEL_CLEAR) && (
              <PremiumHUD
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
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
