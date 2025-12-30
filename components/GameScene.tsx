
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { TimeOfDay, GameState, NightEvent } from '../types';
import Player from './RealisticPlayer';  // CHANGED: Using realistic player
import Island from './Island';
import Nightflare from './Nightflare';
import Enemies from './Enemies';
import ResourceNodes from './ResourceNodes';
import Structures from './Structures';
import { DamageNumbers } from './FloatingText';
import { KillEffect } from './KillEffect';
import { ApexHazards } from './ApexHazards';
import EnvironmentalEffects from './EnvironmentalEffects';
import BossController from './BossController';
import PostProcessing from './PostProcessing';
import OrbitalStrike from './OrbitalStrike';
import LightningEffect from './LightningEffect';
import DroneSystem from './DroneSystem';
import GhostReplay from './GhostReplay';

const MapDecorations = React.memo(({ gameState }: { gameState: any }) => {
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const grassRef = useRef<THREE.InstancedMesh>(null);

  const isMobile = useMemo(() => /iPhone|iPad|Android/i.test(navigator.userAgent), []);
  const rockCount = isMobile ? 15 : 30;
  const grassCount = isMobile ? 30 : 60;

  const rockData = useMemo(() => {
    const data = [];
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 12 + Math.random() * 25;
      const size = 0.4 + Math.random() * 0.7;
      data.push({
        position: new THREE.Vector3(Math.cos(angle) * distance, size * 0.3, Math.sin(angle) * distance),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: new THREE.Vector3(size, size, size)
      });
    }
    return data;
  }, []);

  const grassData = useMemo(() => {
    const data = [];
    for (let i = 0; i < grassCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 40;
      const size = 0.8 + Math.random() * 1.5;
      data.push({
        position: new THREE.Vector3(Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist),
        rotation: new THREE.Euler(-Math.PI / 2, 0, Math.random() * Math.PI * 2),
        scale: new THREE.Vector3(size, size, size)
      });
    }
    return data;
  }, []);

  useFrame(() => {
    if (rockRef.current && grassRef.current) {
      const dummy = new THREE.Object3D();
      rockData.forEach((d, i) => {
        dummy.position.copy(d.position);
        dummy.rotation.copy(d.rotation);
        dummy.scale.copy(d.scale);
        dummy.updateMatrix();
        rockRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rockRef.current.instanceMatrix.needsUpdate = true;

      grassData.forEach((d, i) => {
        dummy.position.copy(d.position);
        dummy.rotation.copy(d.rotation);
        dummy.scale.copy(d.scale);
        dummy.updateMatrix();
        grassRef.current!.setMatrixAt(i, dummy.matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (gameState === GameState.MAIN_MENU) return null;

  return (
    <group>
      <instancedMesh ref={rockRef} args={[undefined, undefined, rockCount]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={grassRef} args={[undefined, undefined, grassCount]} receiveShadow>
        <circleGeometry args={[1, 8]} />
        <meshStandardMaterial color="#2d5016" transparent opacity={0.6} roughness={1} />
      </instancedMesh>
      {/* Small bushes - kept as few individual groups for better lighting control */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 15 + Math.random() * 12;
        return (
          <group key={`bush-${i}`} position={[Math.cos(angle) * distance, 0.3, Math.sin(angle) * distance]}>
            <mesh castShadow><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color="#1a3d0a" roughness={0.95} /></mesh>
            <mesh position={[0.2, 0.2, 0.2]} castShadow><sphereGeometry args={[0.3, 8, 8]} /><meshStandardMaterial color="#2d5016" roughness={0.95} /></mesh>
          </group>
        );
      })}
    </group>
  );
});


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
  const [killEffects, setKillEffects] = useState<{ id: string, pos: [number, number, number] }[]>([]);
  const [orbitalStrikes, setOrbitalStrikes] = useState<{ id: number; pos: [number, number, number] }[]>([]);
  const [lightningLinks, setLightningLinks] = useState<{ id: number; points: [number, number, number][] }[]>([]);

  useEffect(() => {
    const handleLightning = (e: any) => {
      const { chains } = e.detail; // Expecting { chains: [[p1, p2], [p2, p3]] }
      chains.forEach((points: [number, number, number][]) => {
        setLightningLinks(prev => [...prev, { id: Math.random(), points }]);
      });
    };
    window.addEventListener('lightning-vfx', handleLightning);
    return () => window.removeEventListener('lightning-vfx', handleLightning);
  }, []);

  useEffect(() => {
    const handleOrbital = (e: any) => {
      const playerPos = (window as any).playerPos || new THREE.Vector3();
      // Strike slightly ahead of player or at random nearby enemy if we wanted to be fancy, 
      // but for now, let's just do it at player's location or where they are looking.
      setOrbitalStrikes(prev => [...prev, { id: Date.now(), pos: [playerPos.x, playerPos.y, playerPos.z] }]);
    };
    window.addEventListener('orbital-strike-target', handleOrbital);
    return () => window.removeEventListener('orbital-strike-target', handleOrbital);
  }, []);

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

            // TITAN PROTOCOL: Boss Spawn
            const currentWave = useGameStore.getState().wave;
            if (currentWave % 10 === 0) {
              const isColossus = currentWave % 20 === 0;
              const bossType = isColossus ? 'VOID_WEAVER' : 'OBSIDIAN_GOLEM';
              const name = isColossus ? 'VOID WEAVER' : 'OBSIDIAN GOLEM';
              const hp = isColossus ? 5000 : 2500;
              const armor = isColossus ? 2000 : 0;

              useGameStore.setState(state => ({
                bossState: {
                  ...state.bossState,
                  active: true,
                  type: bossType,
                  health: hp,
                  maxHealth: hp,
                  armorHealth: armor,
                  maxArmor: armor,
                  name: name
                }
              }));
              useGameStore.getState().recordBestiaryDiscovery(bossType);
              useGameStore.getState().showNotification('⚠ TITAN DETECTED ⚠', `The ${name} Rises`, 'night');
            } else {
              useGameStore.getState().showNotification(
                useGameStore.getState().getNightName(useGameStore.getState().wave),
                "Nightfall Detected",
                "night"
              );
            }
            return 0;
          } else if (timeOfDay === TimeOfDay.NIGHT && next >= 70) {
            setTimeOfDay(TimeOfDay.DAY);
            useGameStore.getState().showNotification("DAWN BREAK", "Shadows Retreat", "day");
            nextWave();
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    const handleImpact = (e: any) => {
      const id = Date.now() + Math.random(); // Guaranteed unique
      setImpacts(prev => [...prev, { id, pos: e.detail.position }]);

      // TRIGGER HIT-STOP: Brief freeze for impact weight (60ms)
      const state = useGameStore.getState();
      (window as any).hitStopTime = performance.now() / 1000 + 0.06;

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
    const handleEnemyKilled = (e: any) => {
      const id = Date.now().toString() + Math.random();
      setKillEffects(prev => [...prev, { id, pos: e.detail.position }]);
    };

    window.addEventListener('resource-collected', handleResourceCollect);
    window.addEventListener('enemy-killed', handleEnemyKilled);

    return () => {
      clearInterval(interval);
      window.removeEventListener('attack-impact', handleImpact);
      window.removeEventListener('nightflare-nova', handleNova);
      window.removeEventListener('pylon-fire', handlePylonFire);
      window.removeEventListener('resource-collected', handleResourceCollect);
      window.removeEventListener('enemy-killed', handleEnemyKilled);
    };
  }, [gameState, timeOfDay, setTimeOfDay, nextWave, decrementTimer, updateChallenge, challengeState]);

  return (
    <group>
      <Island />

      <MapDecorations gameState={gameState} />

      <Nightflare />
      {gameState !== GameState.MAIN_MENU && (
        <>
          <Structures />
          <DroneSystem />
          <GhostReplay />
          <Player />
          <ResourceNodes />
        </>
      )}
      {gameState !== GameState.MAIN_MENU && <Enemies />}
      {gameState !== GameState.MAIN_MENU && <DamageNumbers />}
      {gameState !== GameState.MAIN_MENU && <EnvironmentalEffects />}
      {gameState !== GameState.MAIN_MENU && <ApexHazards />}
      {gameState !== GameState.MAIN_MENU && <BossController />}

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

      {killEffects.map(k => (
        <KillEffect
          key={k.id}
          position={k.pos}
          onComplete={() => setKillEffects(prev => prev.filter(e => e.id !== k.id))}
        />
      ))}


      {orbitalStrikes.map(s => (
        <OrbitalStrike
          key={s.id}
          position={s.pos}
          onComplete={() => setOrbitalStrikes(prev => prev.filter(strike => strike.id !== s.id))}
        />
      ))}

      {lightningLinks.map(link => (
        <LightningEffect
          key={link.id}
          points={link.points}
          onComplete={() => setLightningLinks(prev => prev.filter(l => l.id !== link.id))}
        />
      ))}

      {/* {gameState === GameState.PLAYING && <PostProcessing />} */}
    </group>
  );
};

const ResourceParticleEffect: React.FC<{ startPos: [number, number, number], type: string }> = ({ startPos, type }) => {
  const ref = useRef<THREE.Group>(null);
  const startTime = useRef(performance.now());
  const [popScale, setPopScale] = useState(0.1);
  const color = type === 'wood' ? '#fbbf24' : (type === 'stone' ? '#94a3b8' : (type === 'lightShards' ? '#22d3ee' : '#ef4444'));

  useEffect(() => {
    // Initial "pop" out of the node
    const t = { s: 0.1 };
    const animatePop = () => {
      if (t.s < 1.0) {
        t.s += 0.15;
        setPopScale(t.s);
        requestAnimationFrame(animatePop);
      }
    };
    animatePop();
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const elapsed = (performance.now() - startTime.current) / 1000;
    const playerPos = (window as any).playerPos || new THREE.Vector3();

    // 1. Initial "burst" upwards for first 0.2s
    if (elapsed < 0.2) {
      ref.current.position.y += delta * 5;
    }

    // 2. Magnetic Flight to Player
    const target = playerPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    const speed = 5 + (elapsed * 25); // Accelerate over time

    // Non-linear interpolation for "snappy" feel
    const alpha = 1 - Math.exp(-speed * delta);
    ref.current.position.lerp(target, alpha);

    // Dynamic scale/rotation
    ref.current.scale.setScalar(popScale * Math.max(0.2, 1 - elapsed));
    ref.current.rotation.y += delta * 20;
    ref.current.rotation.z += delta * 15;
  });

  return (
    <group ref={ref} position={startPos as any}>
      <mesh castShadow>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={25}
          roughness={0}
          metalness={1}
        />
      </mesh>
      <pointLight color={color} intensity={25} distance={5} />
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
  const ringRef = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.InstancedMesh>(null);

  const sparkCount = 12;
  const sparkData = useMemo(() => {
    return Array.from({ length: sparkCount }).map(() => ({
      velocity: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 12, (Math.random() - 0.5) * 8),
      size: 0.1 + Math.random() * 0.2
    }));
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.scale.multiplyScalar(Math.pow(0.92, delta * 60));
    }
    if (ringRef.current) {
      ringRef.current.scale.addScalar(delta * 25);
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity -= delta * 3.5;
    }
    if (sparksRef.current) {
      const dummy = new THREE.Object3D();
      sparkData.forEach((s, i) => {
        s.velocity.y -= delta * 25; // Gravity
        dummy.position.addScaledVector(s.velocity, delta);
        dummy.scale.setScalar(s.size * (1 - state.clock.getElapsedTime() % 0.6));
        dummy.updateMatrix();
        sparksRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparksRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={ref}>
      {/* Dynamic Hit Flash */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={100} transparent opacity={0.6} />
      </mesh>

      {/* Expandnd Shockwave Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.4, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={20} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Spark Shards */}
      <instancedMesh ref={sparksRef} args={[undefined, undefined, sparkCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={50} />
      </instancedMesh>

      <pointLight color="#00ffff" intensity={80} distance={15} decay={2} />
    </group>
  );
};

export default GameScene;
