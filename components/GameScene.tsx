
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { TimeOfDay, GameState, NightEvent } from '../types';
import Player from './Player';
import Island from './Island';
import Nightflare from './Nightflare';
import Enemies from './Enemies';
import ResourceNodes from './ResourceNodes';
import Structures from './Structures';
import { DamageNumbers } from './FloatingText';

const GameScene: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const setTimeOfDay = useGameStore(s => s.setTimeOfDay);
  const nextWave = useGameStore(s => s.nextWave);
  const decrementTimer = useGameStore(s => s.decrementTimer);
  const wave = useGameStore(s => s.wave);
  const getNightName = useGameStore(s => s.getNightName);
  const currentNightEvent = useGameStore(s => s.currentNightEvent);
  const updateChallenge = useGameStore(s => s.updateChallenge);
  const challengeState = useGameStore(s => s.challengeState);

  const [phaseTimer, setPhaseTimer] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [novaVisual, setNovaVisual] = useState(false);

  const [impacts, setImpacts] = useState<{ id: number, pos: [number, number, number] }[]>([]);
  const [beams, setBeams] = useState<{ id: number, from: [number, number, number], to: [number, number, number] }[]>([]);
  const [particles, setParticles] = useState<{ id: number, pos: [number, number, number], type: string }[]>([]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const interval = setInterval(() => {
      // Manage Level Timer
      decrementTimer();

      // Update Challenge if active
      if (challengeState?.isActive) {
        updateChallenge();
      }

      // Manage Day/Night Cycles (Skip if in challenge mode)
      if (!challengeState?.isActive) {
        setPhaseTimer(prev => {
          const next = prev + 1;
          if (timeOfDay === TimeOfDay.DAY && next >= 45) {
            setTimeOfDay(TimeOfDay.NIGHT);
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 4500);
            return 0;
          } else if (timeOfDay === TimeOfDay.NIGHT && next >= 70) {
            setTimeOfDay(TimeOfDay.DAY);
            nextWave();
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    const handleImpact = (e: any) => {
      const id = Date.now();
      setImpacts(prev => [...prev, { id, pos: e.detail.position }]);
      setTimeout(() => setImpacts(p => p.filter(i => i.id !== id)), 600);
    };

    const handleNova = () => {
      setNovaVisual(true);
      setTimeout(() => setNovaVisual(false), 2200);
    };

    const handlePylonFire = (e: any) => {
      const id = Date.now();
      setBeams(prev => [...prev, { id, from: e.detail.from, to: e.detail.to }]);
      setTimeout(() => setBeams(p => p.filter(b => b.id !== id)), 400);
      window.dispatchEvent(new CustomEvent('enemy-hit', { detail: { id: 'any', pos: e.detail.to, damage: 45 } }));
    };

    const handleResourceCollect = (e: any) => {
      const id = Date.now() + Math.random();
      setParticles(prev => [...prev, { id, pos: e.detail.position, type: e.detail.type }]);
      setTimeout(() => setParticles(p => p.filter(p => p.id !== id)), 800);
    };

    window.addEventListener('attack-impact', handleImpact);
    window.addEventListener('nightflare-nova', handleNova);
    window.addEventListener('pylon-fire', handlePylonFire);
    window.addEventListener('resource-collected', handleResourceCollect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('attack-impact', handleImpact);
      window.removeEventListener('nightflare-nova', handleNova);
      window.removeEventListener('pylon-fire', handlePylonFire);
      window.removeEventListener('resource-collected', handleResourceCollect);
    };
  }, [gameState, timeOfDay, setTimeOfDay, nextWave, decrementTimer, updateChallenge, challengeState]);

  return (
    <group>
      <Island />
      <Nightflare />
      {gameState !== GameState.MAIN_MENU && (
        <>
          <Structures />
          <Player />
          <ResourceNodes />
        </>
      )}
      {gameState !== GameState.MAIN_MENU && <Enemies />}
      {gameState !== GameState.MAIN_MENU && <DamageNumbers />}

      {novaVisual && <NovaVFX />}

      {impacts.map(imp => (
        <group key={imp.id} position={imp.pos as any}>
          <AttackImpactEffect />
        </group>
      ))}

      {beams.map(b => (
        <BeamEffect key={b.id} from={b.from} to={b.to} />
      ))}

      {particles.map(p => (
        <ResourceParticleEffect key={p.id} startPos={p.pos} type={p.type} />
      ))}

      {showBanner && (
        <Html center position={[0, 9, 0]}>
          <div className="flex flex-col items-center animate-in zoom-in fade-in slide-in-from-top-12 duration-1000 pointer-events-none">
            <div className="bg-slate-950/95 backdrop-blur-3xl px-28 py-14 text-center rounded-[5rem] border-2 border-red-600/50 shadow-[0_0_120px_rgba(239,68,68,0.5)]">
              <div className="text-red-600 font-black tracking-[0.9em] text-[13px] uppercase mb-6 animate-pulse">Nightfall Detected</div>
              <h1 className="text-white text-8xl md:text-9xl font-black italic tracking-tighter uppercase drop-shadow-[0_25px_50px_rgba(0,0,0,1)]">
                {getNightName(wave)}
              </h1>
              {currentNightEvent && currentNightEvent !== NightEvent.NONE && (
                <div className={`mt-4 text-4xl font-black tracking-[0.5em] uppercase animate-pulse 
                    ${currentNightEvent === NightEvent.RUSH ? 'text-red-500' : (currentNightEvent === NightEvent.SIEGE ? 'text-orange-500' : 'text-purple-500')}`}>
                  ⚠ {currentNightEvent} DETECTED ⚠
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const ResourceParticleEffect: React.FC<{ startPos: [number, number, number], type: string }> = ({ startPos, type }) => {
  const ref = useRef<THREE.Group>(null);
  const color = type === 'wood' ? '#fbbf24' : (type === 'stone' ? '#94a3b8' : (type === 'lightShards' ? '#22d3ee' : '#ef4444'));

  useFrame((state, delta) => {
    if (!ref.current) return;
    const playerPos = (window as any).playerPos || new THREE.Vector3();
    const target = playerPos.clone().add(new THREE.Vector3(0, 1.5, 0));
    ref.current.position.lerp(target, 0.15);
    ref.current.scale.multiplyScalar(0.96);
  });

  return (
    <group ref={ref} position={startPos as any}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={20} />
      </mesh>
    </group>
  );
};

const BeamEffect: React.FC<{ from: [number, number, number], to: [number, number, number] }> = ({ from, to }) => {
  const points = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from, to]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <line>
      <primitive object={lineGeometry} attach="geometry" />
      <lineBasicMaterial color="#00f2ff" linewidth={6} transparent opacity={0.9} />
    </line>
  );
};

const NovaVFX: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.scale.addScalar(delta * 110);
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity -= delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.scale.addScalar(delta * 140);
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity -= delta * 0.7;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#ffae00" transparent opacity={1} emissive="#ffae00" emissiveIntensity={150} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.0, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={1} emissive="#ffffff" emissiveIntensity={200} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const AttackImpactEffect: React.FC = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.scale.multiplyScalar(1.25);
      ref.current.position.y += delta * 2.5;
    }
  });
  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[0.55, 8, 8]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={60} transparent opacity={0.8} /></mesh>
      <pointLight color="#ff4400" intensity={50} distance={12} />
    </group>
  );
};

export default GameScene;
