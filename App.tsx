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
import ConstellationMenu from './components/ConstellationMenu';
import NexusShop from './components/NexusShop';
import OrientationLock from './components/OrientationLock';
import BestiaryMenu from './components/BestiaryMenu';
import ClassSelection from './components/ClassSelection';
import OperationsPanel from './components/OperationsPanel';
import VanguardMusic from './components/VanguardMusic';

const SceneLighting: React.FC = () => {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const gameState = useGameStore(s => s.gameState);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);

  const currentNightEvent = useGameStore(s => s.currentNightEvent);

  useFrame((_, delta) => {
    const isNight = timeOfDay === TimeOfDay.NIGHT;
    const isMenu = gameState === GameState.MAIN_MENU;
    const isTutorial = gameState === GameState.TUTORIAL;

    let targetAmbient = isMenu ? 0.65 : (isNight ? 0.45 : 0.8);
    let targetDirIntensity = isMenu ? 1.5 : (isNight ? 0.7 : 1.8);
    let targetFogColor = new THREE.Color(isNight && !isMenu ? '#0a0a0a' : '#1a2e35');
    let targetFogNear = isNight ? 18 : 25;
    let targetFogFar = isNight ? 65 : 80;

    // Weather Overrides
    if (isNight && currentNightEvent === 'DENSE_FOG') {
      targetFogNear = 2;
      targetFogFar = 16;
      targetFogColor = new THREE.Color('#050505');
      targetAmbient = 0.2;
    } else if (isNight && currentNightEvent === 'ION_STORM') {
      targetFogColor = new THREE.Color('#1a0b2e'); // Deep violet
      targetAmbient = 0.3;
    }

    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetAmbient, delta * (isMenu || isTutorial ? 3 : 0.5));
    if (directionalRef.current) directionalRef.current.intensity = THREE.MathUtils.lerp(directionalRef.current.intensity, targetDirIntensity, delta * (isMenu || isTutorial ? 3 : 0.5));

    if (fogRef.current) {
      fogRef.current.color.lerp(targetFogColor, delta * 0.5);
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, targetFogNear, delta * 0.5);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFogFar, delta * 0.5);
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
        case 'TOP_DOWN': offset.set(0, 25, 0); targetFov = 30; break;
        case 'SIDE': offset.set(15, 4, 0); targetFov = 45; break;
        case 'ISOMETRIC': offset.set(12, 10, 12); targetFov = 40; break;
        default: offset.set(0, 8, 11); targetFov = 50; break; // OPTIMIZED: Slightly higher and further for better tactical view
      }
    }

    // 4. TRANSITION EFFECTS (The Dramatic Polish)
    const isTransitioning = useGameStore.getState().isTransitioning;
    if (isTransitioning) {
      const time = performance.now() * 0.001;
      const orbitRadius = 10;
      offset.set(
        Math.sin(time) * orbitRadius,
        4,
        Math.cos(time) * orbitRadius
      );
      targetFov = 40;
    }

    // 5. SNAPPY APPLICATION (Pro Response)
    const targetPos = playerPos.clone().add(offset);
    camera.position.lerp(targetPos, isTransitioning ? 0.05 : 0.15);

    lookAtTarget.current.lerp(playerPos, 0.2);
    camera.lookAt(lookAtTarget.current);

    // 6. Hard Matrix Sync
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== targetFov) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

const TransitionOverlay: React.FC = () => {
  const isTransitioning = useGameStore(s => s.isTransitioning);
  return (
    <div className={`fixed inset-0 z-[200] pointer-events-none transition-all duration-700 bg-black ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
    </div>
  );
};

const AppOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] sm:shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
    </div>
  );
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
  const [showConstellation, setShowConstellation] = useState(false);
  const [showNexus, setShowNexus] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showClassSelection, setShowClassSelection] = useState(false);
  const [showOperations, setShowOperations] = useState(false);

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

  const isModalOpen = showTournament || showFriends || showAnalytics || showSeason || settings.isOpen || showNexus || showConstellation || showBestiary || showClassSelection || showOperations;

  return (
    <ErrorBoundary>
      <div style={shakeStyle} className="fixed inset-0 w-full h-[100dvh] bg-[#050505] overflow-hidden select-none safe-padding">
        <VanguardMusic />
        <OrientationLock />
        <SoundEffects />
        <HapticFeedback />
        <TransitionOverlay />
        <AppOverlay />
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
                showNexus={() => setShowNexus(true)}
                showBestiary={() => setShowBestiary(true)}
                showClassSelection={() => setShowClassSelection(true)}
                showOperations={() => setShowOperations(true)}
              />
            )}

            {showClassSelection && <ClassSelection onSelect={() => setShowClassSelection(false)} />}

            {showTournament && <TournamentHub onBack={() => setShowTournament(false)} />}
            {showFriends && <FriendsPanel onBack={() => setShowFriends(false)} />}
            {showAnalytics && <AnalyticsDashboard onBack={() => setShowAnalytics(false)} />}
            {showSeason && <SeasonPanel onBack={() => setShowSeason(false)} />}
            {showConstellation && <ConstellationMenu onClose={() => setShowConstellation(false)} />}
            {showNexus && <NexusShop onClose={() => setShowNexus(false)} />}
            {showBestiary && <BestiaryMenu onClose={() => setShowBestiary(false)} />}
            {showOperations && <OperationsPanel onBack={() => setShowOperations(false)} />}

            {(gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.TUTORIAL || gameState === GameState.LEVEL_CLEAR) && (
              <PremiumHUD
                onOpenInventory={() => setShowInventory(true)}
                onOpenCrafting={() => setShowCrafting(true)}
                onOpenConstellation={() => setShowConstellation(true)}
                onOpenOperations={() => setShowOperations(true)}
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
