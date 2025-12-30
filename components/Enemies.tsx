
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { EnemyType, GameState, EnemyClass, EnemyTarget, EnemyBehavior, IslandTheme, NightEvent, TimeOfDay } from '../types';
import PremiumZombie from './PremiumZombie';
import { soundEffects } from '../utils/soundEffects';

const _centerVec = new THREE.Vector3(0, 0, 0);
const _avoidVec = new THREE.Vector3();
const _desiredVec = new THREE.Vector3();
const _sepVec = new THREE.Vector3();
const _tempVec = new THREE.Vector3();
const _currPos = new THREE.Vector3();
const _otherPos = new THREE.Vector3();

// Mutable enemy class to avoid React state thrashing
class EnemyEntity implements EnemyType {
  id: string;
  type: EnemyClass;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  target: EnemyTarget;
  behavior: EnemyBehavior;

  // Runtime props
  dying: boolean = false;
  deathTime: number = 0;
  hitTime: number = 0;
  stateTimer: number = 0;
  attackAnimTimer: number = 0;
  attackPhase: 'IDLE' | 'WINDUP' | 'STRIKE' | 'RECOVERY' = 'IDLE';
  waypoints: THREE.Vector3[] = [];
  currentWaypointIdx: number = 0;
  lastVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  lastAttackTime: number = 0;
  seed: number;
  scored: boolean = false; // CRITICAL: Prevent duplicate score awards
  killRecorded: boolean = false; // CRITICAL: Prevent duplicate kill records
  lerpPosition: THREE.Vector3;
  stunTimer: number = 0; // New: Logic to stun enemy


  constructor(base: EnemyType) {
    this.id = base.id;
    this.type = base.type;
    this.position = base.position;
    this.health = base.health;
    this.maxHealth = base.maxHealth;
    this.speed = base.speed;
    this.target = base.target;
    this.behavior = base.behavior;
    this.seed = Math.random();
    this.lerpPosition = new THREE.Vector3(...base.position);

    // Default Waypoints
    this.waypoints = [
      new THREE.Vector3(15, 0, 0),
      new THREE.Vector3(0, 0, 15),
      new THREE.Vector3(-15, 0, 0),
      new THREE.Vector3(0, 0, -15)
    ];
    this.currentWaypointIdx = Math.floor(Math.random() * 4);
    this.stateTimer = performance.now() / 1000;
  }
}

// Enhanced Enemy Components
const EnhancedStalker = ({ position, seed }: { position: [number, number, number], seed: number }) => (
  <group position={position}>
    <pointLight intensity={0.5} distance={3} color="#ff4400" />
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[0.4, 0.6, 0.6]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} emissive="#ff4400" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0.9, 0]} castShadow>
      <boxGeometry args={[0.35, 0.35, 0.35]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[-0.1, 0.95, 0.18]}>
      <boxGeometry args={[0.06, 0.06, 0.02]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
    </mesh>
    <mesh position={[0.1, 0.95, 0.18]}>
      <boxGeometry args={[0.06, 0.06, 0.02]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
    </mesh>
    <mesh position={[-0.3, 0.3, 0.3]} rotation={[0, 0, -0.5]} castShadow>
      <coneGeometry args={[0.05, 0.4, 4]} />
      <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0.3, 0.3, 0.3]} rotation={[0, 0, 0.5]} castShadow>
      <coneGeometry args={[0.05, 0.4, 4]} />
      <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
    </mesh>
    {[-0.15, 0.15].map((x, i) => (
      <React.Fragment key={i}>
        <mesh position={[x, 0.15, 0.2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[x, 0.15, -0.2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
      </React.Fragment>
    ))}
    <mesh position={[0, 0.5, -0.4]}>
      <sphereGeometry args={[0.1]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.5} />
    </mesh>
  </group>
);

const EnhancedBrute = ({ position, seed }: { position: [number, number, number], seed: number }) => (
  <group position={position}>
    <pointLight intensity={0.8} distance={4} color="#ff6600" />
    <mesh position={[0, 1, 0]} castShadow>
      <boxGeometry args={[1.2, 1.6, 0.8]} />
      <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.2} emissive="#ff6600" emissiveIntensity={0.2} />
    </mesh>
    <mesh position={[0, 1.2, 0.41]} castShadow>
      <boxGeometry args={[1.1, 1.4, 0.1]} />
      <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[-0.7, 1.8, 0]} rotation={[0, 0, -0.5]} castShadow>
      <coneGeometry args={[0.15, 0.6, 6]} />
      <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} metalness={0.8} />
    </mesh>
    <mesh position={[0.7, 1.8, 0]} rotation={[0, 0, 0.5]} castShadow>
      <coneGeometry args={[0.15, 0.6, 6]} />
      <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} metalness={0.8} />
    </mesh>
    <mesh position={[0, 2.1, 0]} castShadow>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0, 2.1, 0.36]}>
      <boxGeometry args={[0.5, 0.15, 0.02]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
    </mesh>
    <mesh position={[-0.8, 1, 0]} rotation={[0, 0, 0.3]} castShadow>
      <boxGeometry args={[0.3, 1.2, 0.3]} />
      <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0.8, 1, 0]} rotation={[0, 0, -0.3]} castShadow>
      <boxGeometry args={[0.3, 1.2, 0.3]} />
      <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

const EnhancedWraith = ({ position, seed }: { position: [number, number, number], seed: number }) => {
  const floatOffset = Math.sin(Date.now() * 0.003 + seed) * 0.3;
  return (
    <group position={[position[0], position[1] + floatOffset, position[2]]}>
      <pointLight intensity={1} distance={5} color="#9d00ff" />
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#9d00ff" emissive="#9d00ff" emissiveIntensity={2} transparent opacity={0.7} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation={[0, Date.now() * 0.001, 0]}>
        <coneGeometry args={[0.6, 1.5, 6]} />
        <meshStandardMaterial color="#5a00a0" emissive="#9d00ff" emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const EnhancedVoidWalker = ({ position, seed }: { position: [number, number, number], seed: number }) => (
  <group position={position}>
    <pointLight intensity={3} distance={15} color="#00ffff" />
    <mesh position={[0, 2, 0]} castShadow>
      <boxGeometry args={[2, 3, 1.5]} />
      <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} emissive="#00ffff" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 2.5, 0.76]}>
      <sphereGeometry args={[0.5]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} transparent opacity={0.8} />
    </mesh>
    <group rotation={[0, Date.now() * 0.002, 0]}>
      <mesh position={[0, 2.5, 0]}>
        <torusGeometry args={[1, 0.1, 16, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
    </group>
    <mesh position={[0, 3.8, 0]} castShadow>
      <octahedronGeometry args={[0.8]} />
      <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0} emissive="#00ffff" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

const Enemies: React.FC = () => {
  const { wave, level, islandTheme, damageNightflare, damagePlayer, recordEnemyKill, gameState, nodes, structures, triggerScreenShake } = useGameStore();
  const lastSpawnTime = useRef(0);
  const enemiesRef = useRef<EnemyEntity[]>([]);
  const [enemyIds, setEnemyIds] = useState<string[]>([]);

  const obstacleMap = useMemo(() => [
    ...nodes.map(n => ({ pos: new THREE.Vector3(...n.position), radius: n.type === 'ROCK' ? 4.5 : 3.5 })),
    ...structures.map(s => ({ pos: new THREE.Vector3(...s.position), radius: 3.5 }))
  ], [nodes, structures]);

  useEffect(() => {
    const handleAttack = (e: any) => {
      const { position, range, damage, rotation, weaponType } = e.detail;
      const attackPos = position as THREE.Vector3;
      let hits = 0;

      const activeEnemies = enemiesRef.current
        .map(en => ({ entity: en, dist: new THREE.Vector3(...en.position).distanceTo(attackPos) }))
        .sort((a, b) => a.dist - b.dist);

      activeEnemies.forEach(({ entity: en, dist }) => {
        if (en.dying) return;

        let isHit = false;
        if (weaponType === 'SWORD') {
          const tempPos = new THREE.Vector3(...en.position);
          const dx = tempPos.x - attackPos.x;
          const dz = tempPos.z - attackPos.z;
          const angleToEnemy = Math.atan2(dx, dz);
          let diff = angleToEnemy - rotation;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (dist < range && Math.abs(diff) < 1.0) isHit = true;
        } else if (weaponType === 'BOW') {
          const tempPos = new THREE.Vector3(...en.position);
          const dx = tempPos.x - attackPos.x;
          const dz = tempPos.z - attackPos.z;
          const angleToEnemy = Math.atan2(dx, dz);
          let diff = angleToEnemy - rotation;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (dist < 20 && Math.abs(diff) < 0.15 && hits < 3) {
            isHit = true;
            hits++;
          }
        } else if (weaponType === 'LIGHTNING_STAFF') {
          // Find first enemy in range
          if (dist < range && hits === 0) {
            isHit = true;
            hits++;

            // Chain to others
            const chains: [number, number, number][][] = [];
            let currentPos = new THREE.Vector3(...en.position);
            let alreadyHit = new Set([en.id]);

            for (let i = 0; i < 3; i++) { // Max 3 chains
              let nextNearest = null;
              let nextDist = 8;

              enemiesRef.current.forEach(other => {
                if (other.dying || alreadyHit.has(other.id)) return;
                const d = new THREE.Vector3(...other.position).distanceTo(currentPos);
                if (d < nextDist) {
                  nextDist = d;
                  nextNearest = other;
                }
              });

              if (nextNearest) {
                const target = nextNearest as any;
                chains.push([[currentPos.x, currentPos.y + 1, currentPos.z], [target.position[0], target.position[1] + 1, target.position[2]]]);
                target.health -= damage * 0.7; // Chain damage 70%
                target.hitTime = performance.now() / 1000;
                alreadyHit.add(target.id);
                currentPos.set(...target.position);

                if (target.health <= 0) {
                  target.dying = true;
                  target.deathTime = performance.now() / 1000;
                  recordEnemyKill(target.type);
                }
              } else break;
            }

            if (chains.length > 0) {
              window.dispatchEvent(new CustomEvent('lightning-vfx', { detail: { chains } }));
            }
          }
        } else {
          if (dist < range) isHit = true;
        }

        if (isHit) {
          en.health -= damage;
          en.hitTime = performance.now() / 1000;

          window.dispatchEvent(new CustomEvent('enemy-hit-visual', {
            detail: { position: en.position, damage: damage, isCrit: damage > 50 }
          }));

          if (en.health <= 0 && !en.dying) {
            en.dying = true;
            en.deathTime = performance.now() / 1000;
            if (!en.killRecorded) {
              en.killRecorded = true;
              recordEnemyKill(en.type);
            }
            soundEffects.enemyDeath();
            window.dispatchEvent(new CustomEvent('enemy-killed', { detail: { position: en.position, type: en.type } }));
          } else {
            soundEffects.enemyHit();
          }
        }
      });
    };

    const handleOrbitalImpact = (e: any) => {
      const { position, radius, damage } = e.detail;
      const impactPos = position as THREE.Vector3;

      enemiesRef.current.forEach(en => {
        if (en.dying) return;
        const dist = new THREE.Vector3(...en.position).distanceTo(impactPos);
        if (dist < radius) {
          en.health -= damage;
          en.hitTime = performance.now() / 1000;
          if (en.health <= 0 && !en.dying) {
            en.dying = true;
            en.deathTime = performance.now() / 1000;
            if (!en.killRecorded) {
              en.killRecorded = true;
              recordEnemyKill(en.type);
            }
            soundEffects.enemyDeath();
          }
        }
      });
    };

    const handleEnemyHit = (e: any) => {
      const { id, damage } = e.detail || {};
      if (!id) return;
      const now = performance.now() / 1000;
      enemiesRef.current.forEach(en => {
        if (en.id === id || id === 'any') {
          if (en.dying) return;
          en.health -= (damage || 35);
          en.hitTime = now;
          if (en.health <= 0) {
            en.dying = true;
            en.deathTime = now;
            if (!en.killRecorded) {
              en.killRecorded = true;
              recordEnemyKill(en.type);
            }
            soundEffects.enemyDeath();
          } else {
            soundEffects.enemyHit();
          }
        }
      });
    };

    const handleNova = () => {
      const now = performance.now() / 1000;
      enemiesRef.current.forEach(en => {
        if (!en.dying) {
          en.health = 0;
          en.dying = true;
          en.deathTime = now;
          if (!en.killRecorded) {
            en.killRecorded = true;
            recordEnemyKill(en.type);
          }
          soundEffects.enemyDeath();
        }
      });
    };

    window.addEventListener('player-attack-hitbox', handleAttack);
    window.addEventListener('orbital-impact', handleOrbitalImpact);
    window.addEventListener('enemy-hit', handleEnemyHit);
    window.addEventListener('nightflare-nova', handleNova);

    return () => {
      window.removeEventListener('player-attack-hitbox', handleAttack);
      window.removeEventListener('orbital-impact', handleOrbitalImpact);
      window.removeEventListener('enemy-hit', handleEnemyHit);
      window.removeEventListener('nightflare-nova', handleNova);
    };
  }, [damageNightflare, damagePlayer, recordEnemyKill]);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;
    const timeOfDay = useGameStore.getState().timeOfDay;

    // Allow spawning during day but at reduced rate
    const isDayTime = timeOfDay === TimeOfDay.DAY;

    const currentTime = state.clock.getElapsedTime();
    const nowMs = performance.now();
    const playerPos = (window as any).playerPos || new THREE.Vector3(1000, 0, 1000);

    const currentEvent = useGameStore.getState().currentNightEvent;
    let spawnRate = Math.max(0.3, 3.2 / (1 + (level - 1) * 0.9 + (wave - 1) * 0.5));
    let maxEnemies = Math.min(25, 12 + level * 7 + wave * 3);

    // Reduce spawn rate and max enemies during day for playability
    if (isDayTime) {
      spawnRate *= 3.0; // Spawn 3x slower during day
      maxEnemies = Math.floor(maxEnemies * 0.4); // 40% max enemies during day
    }

    if (currentEvent === NightEvent.RUSH) { spawnRate *= 0.4; maxEnemies *= 1.8; }
    else if (currentEvent === NightEvent.SIEGE) { spawnRate *= 1.5; maxEnemies *= 0.6; }

    const survivors: EnemyEntity[] = [];
    let listChanged = false;

    // Batch spawn new enemies if needed
    if (currentTime - lastSpawnTime.current > spawnRate && enemiesRef.current.length < maxEnemies) {
      // ... same spawn logic ...
      const angle = Math.random() * Math.PI * 2;
      const radius = 55 + Math.random() * 20;
      const spawnPos: [number, number, number] = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
      const { titanAwakeningProgress, setTitanAwakeningProgress } = useGameStore.getState();

      let type: EnemyClass = 'STALKER';
      let isBoss = false;

      if (titanAwakeningProgress >= 100) {
        // Spawn THE TITAN
        if (islandTheme === IslandTheme.ARCTIC) type = 'TITAN_YMIR';
        else if (islandTheme === IslandTheme.VOLCANO) type = 'TITAN_PROMETHEUS';
        else if (islandTheme === IslandTheme.ABYSS) type = 'TITAN_KRAKEN';
        else type = 'VOID_WALKER'; // Fallback

        isBoss = true;
        setTitanAwakeningProgress(0);
        useGameStore.getState().showNotification('TITAN AWAKENED', 'A Colossal Threat Emerges', 'night');
      } else {
        const roll = Math.random();
        // Location-specific enemy spawning (20% chance)
        const locationRoll = Math.random();
        if (locationRoll < 0.2 && !currentEvent) {
          // Spawn location-specific enemy
          if (islandTheme === IslandTheme.FOREST && wave >= 2) {
            type = 'FOREST_WOLF';
          } else if (islandTheme === IslandTheme.VOLCANO && wave >= 3) {
            type = 'FIRE_ELEMENTAL';
          } else if (islandTheme === IslandTheme.ARCTIC && wave >= 4) {
            type = 'ICE_WRAITH';
          }
        } else if (currentEvent === NightEvent.SIEGE) {
          if (roll < 0.6) type = 'BRUTE';
          else if (roll < 0.9) type = 'WRAITH';
          else type = 'STALKER';
        } else if (currentEvent === NightEvent.RUSH) {
          if (roll < 0.9) type = 'STALKER';
          else type = 'WRAITH';
        } else {
          const biome = islandTheme;
          if (biome === IslandTheme.FOREST) {
            if (roll < 0.3) type = 'FOREST_WOLF';
            else if (roll < 0.1) type = 'BRUTE';
          } else if (biome === IslandTheme.DESERT) {
            if (roll < 0.4) type = 'SAND_RAVAGER';
            else type = 'STALKER';
          } else if (biome === IslandTheme.VOLCANO) {
            if (roll < 0.4) type = 'FIRE_ELEMENTAL';
            else type = 'BRUTE';
          } else if (biome === IslandTheme.ARCTIC) {
            if (roll < 0.4) type = 'ICE_WRAITH';
            else type = 'WRAITH';
          } else if (biome === IslandTheme.VOID) {
            if (roll < 0.5) type = 'VOID_SPECTER';
            else type = 'VOID_WALKER';
          } else if (biome === IslandTheme.CELESTIAL) {
            if (roll < 0.6) type = 'STAR_REAVER';
          } else if (biome === IslandTheme.CRYSTAL) {
            if (roll < 0.4) type = 'CRYSTAL_GOLEM';
          } else if (biome === IslandTheme.CORRUPTION) {
            type = roll < 0.5 ? 'CORRUPTED_STALKER' : 'WRAITH';
          } else if (biome === IslandTheme.ABYSS) {
            type = roll < 0.6 ? 'DEEP_DWELLER' : 'VOID_WALKER';
          } else if (biome === IslandTheme.ETERNAL_SHADOW) {
            type = level >= 90 && roll < 0.2 ? 'SHADOW_LORD' : 'VOID_WALKER';
          }
        }
      }

      const statsMap: Record<string, any> = {
        STALKER: { health: 220, speed: 12.0 },
        BRUTE: { health: 2200, speed: 5.5 },
        WRAITH: { health: 550, speed: 17.0 },
        VOID_WALKER: { health: 8500, speed: 4.8 },
        FOREST_WOLF: { health: 300, speed: 14.0 },
        FIRE_ELEMENTAL: { health: 450, speed: 10.0 },
        ICE_WRAITH: { health: 500, speed: 15.0 },
        SAND_RAVAGER: { health: 400, speed: 13.0 },
        VOID_SPECTER: { health: 600, speed: 18.0 },
        STAR_REAVER: { health: 900, speed: 14.0 },
        CRYSTAL_GOLEM: { health: 5000, speed: 4.0 },
        CORRUPTED_STALKER: { health: 1200, speed: 11.0 },
        DEEP_DWELLER: { health: 4500, speed: 6.0 },
        SHADOW_LORD: { health: 50000, speed: 7.0 },
        OBSIDIAN_GOLEM: { health: 12000, speed: 3.5 },
        VOID_WEAVER: { health: 3500, speed: 9.0 },
        TITAN_YMIR: { health: 100000, speed: 2.5 },
        TITAN_PROMETHEUS: { health: 120000, speed: 3.0 },
        TITAN_KRAKEN: { health: 150000, speed: 2.0 }
      };
      const baseStats = statsMap[type] || statsMap.STALKER;
      let mult = 1 + (level - 1) * 0.8 + (wave - 1) * 0.4;
      if (currentEvent === NightEvent.RUSH) mult *= 0.6;
      if (currentEvent === NightEvent.SIEGE) mult *= 1.5;

      const newEntity = new EnemyEntity({
        id: isBoss ? `titan-${Date.now()}` : `enemy-${nowMs}-${Math.random()}`,
        type,
        position: spawnPos,
        health: baseStats.health * mult,
        maxHealth: baseStats.health * mult,
        speed: baseStats.speed * 0.4 * (1 + level * 0.08),
        target: isBoss ? 'PLAYER' : 'NIGHTFLARE',
        behavior: isBoss ? EnemyBehavior.CHASE : EnemyBehavior.PATROL
      });
      enemiesRef.current.push(newEntity);
      useGameStore.getState().recordBestiaryDiscovery(type);
      lastSpawnTime.current = currentTime;
      listChanged = true;

      // Play spawn sound
      if (isBoss || type === 'VOID_WALKER') {
        soundEffects.bossRoar();
      } else {
        soundEffects.enemySpawn();
      }
    }

    for (const enemy of enemiesRef.current) {
      if (enemy.dying) {
        if (!enemy.killRecorded) {
          recordEnemyKill(enemy.type);
          enemy.killRecorded = true;
          enemy.scored = true;
          window.dispatchEvent(new CustomEvent('enemy-killed', { detail: { position: enemy.position, type: enemy.type } }));

          // PHASE 5: Blueprint Archeology (5% chance)
          if (Math.random() < 0.05) {
            window.dispatchEvent(new CustomEvent('resource-collected', { detail: { position: enemy.position, type: 'blueprint' } }));
          }

          _tempVec.set(...enemy.position);
          // Simplified stun logic for performance
          enemiesRef.current.forEach(other => {
            if (other !== enemy && !other.dying) {
              _otherPos.set(...other.position);
              if (_otherPos.distanceToSquared(_tempVec) < 144) other.stunTimer = nowMs + 1200;
            }
          });
        }
        // INCREASED DEATH DURATION TO 3 SECONDS
        if (nowMs - enemy.deathTime > 3000) continue;
        survivors.push(enemy); continue;
      }
      _currPos.set(...enemy.position);

      if (nowMs < enemy.stunTimer) {
        // Procedural jitter when stunned
        enemy.lerpPosition.set(
          enemy.position[0] + (Math.sin(nowMs * 0.05) * 0.1),
          0,
          enemy.position[2] + (Math.cos(nowMs * 0.05) * 0.1)
        );
        survivors.push(enemy); continue;
      }

      const distToPlayer = _currPos.distanceTo(playerPos);
      const distToCore = _currPos.length();
      const visionRange = 45 + level * 5;

      if (enemy.behavior === EnemyBehavior.PATROL && distToPlayer < visionRange) { enemy.behavior = EnemyBehavior.CHASE; enemy.stateTimer = currentTime; }
      else if (enemy.behavior === EnemyBehavior.CHASE && distToPlayer > visionRange + 25) { enemy.behavior = EnemyBehavior.PATROL; enemy.stateTimer = currentTime; }

      let moveTarget = _centerVec;
      let spdMult = useGameStore.getState().isTimeSlowed ? 0.3 : 1.0; // BUFF: 70% speed reduction during Nova

      if (enemy.behavior === EnemyBehavior.PATROL) {
        const wp = enemy.waypoints[enemy.currentWaypointIdx];
        if (_currPos.distanceToSquared(wp) < 25) enemy.currentWaypointIdx = (enemy.currentWaypointIdx + 1) % 4;
        moveTarget = wp; spdMult = 0.6;
      } else { moveTarget = playerPos; spdMult = 1.6; }

      const isAttacking = enemy.attackPhase !== 'IDLE';
      const attackRangeSq = enemy.type === 'BRUTE' ? 144 : 81;
      if (!isAttacking && (_currPos.distanceToSquared(moveTarget) < attackRangeSq || distToCore < 10) && currentTime - enemy.lastAttackTime > (enemy.type === 'BRUTE' ? 6 : 3.5)) {
        enemy.attackPhase = 'WINDUP'; enemy.attackAnimTimer = currentTime;
      }

      if (isAttacking) {
        const animElapsed = currentTime - enemy.attackAnimTimer;
        if (enemy.attackPhase === 'WINDUP') { spdMult *= 0.1; if (animElapsed > 0.6) { enemy.attackPhase = 'STRIKE'; enemy.attackAnimTimer = currentTime; soundEffects.enemyAttack(); const dmg = (enemy.type === 'BRUTE' ? 350 : 100) * (1 + level * 0.4); if (_currPos.distanceTo(playerPos) < 4.0) { damagePlayer(dmg * 0.15); if (enemy.type === 'BRUTE') triggerScreenShake(1.2); } else if (distToCore < 12) damageNightflare(dmg * 0.3); window.dispatchEvent(new CustomEvent('attack-impact', { detail: { position: enemy.position } })); } }
        else if (enemy.attackPhase === 'STRIKE') { spdMult *= 5.0; if (animElapsed > 0.3) { enemy.attackPhase = 'RECOVERY'; enemy.attackAnimTimer = currentTime; } }
        else if (enemy.attackPhase === 'RECOVERY') { spdMult *= 0.2; if (animElapsed > 0.6) { enemy.attackPhase = 'IDLE'; enemy.lastAttackTime = currentTime; } }
      }

      _desiredVec.copy(moveTarget).sub(_currPos).normalize();
      _sepVec.set(0, 0, 0);
      // Group separation optimization: only check every few frames or reduce radius
      for (const other of survivors) {
        if (other === enemy || other.dying) continue;
        _otherPos.set(...other.position);
        if (_currPos.distanceToSquared(_otherPos) < 16) {
          _tempVec.copy(_currPos).sub(_otherPos).normalize();
          _sepVec.add(_tempVec);
        }
      }

      _avoidVec.set(0, 0, 0);
      for (const obs of obstacleMap) {
        _tempVec.copy(obs.pos).sub(_currPos);
        const distSq = _tempVec.lengthSq();
        if (distSq < 144) {
          _tempVec.projectOnVector(_desiredVec).sub(_tempVec).normalize().multiplyScalar(40);
          _avoidVec.add(_tempVec);
        }
      }

      const steering = _desiredVec.add(_avoidVec).add(_sepVec).normalize();
      const velocity = steering.multiplyScalar(enemy.speed * spdMult * delta);
      enemy.lastVelocity.copy(steering);
      enemy.position = [enemy.position[0] + velocity.x, 0, enemy.position[2] + velocity.z];
      enemy.lerpPosition.lerp(new THREE.Vector3(...enemy.position), 1 - Math.exp(-15 * delta));
      survivors.push(enemy);
    }

    // Check if list size changed (spawn or death cleanup)
    if (enemiesRef.current.length !== survivors.length) listChanged = true;

    enemiesRef.current = survivors;

    // Update global for HUD
    (window as any).gameEnemies = survivors;

    // ONLY update state if the list structure actually changed
    if (listChanged) {
      setEnemyIds(survivors.map(e => e.id));
    }
  });

  return (
    <group>
      {enemiesRef.current.map(enemy => (
        <EnemyRenderer key={enemy.id} entity={enemy} />
      ))}
    </group>
  );
};

import ColossalTitan from './ColossalTitan';

const EnemyRenderer: React.FC<{ entity: EnemyEntity }> = ({ entity }) => {
  const ref = useRef<THREE.Group>(null);
  const splashRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Position already lerped in parent loop for performance
    ref.current.position.copy(entity.lerpPosition);

    const targetRotation = Math.atan2(entity.lastVelocity.x, entity.lastVelocity.z);
    let rotDiff = targetRotation - ref.current.rotation.y;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    ref.current.rotation.y += rotDiff * (1 - Math.exp(-15 * delta));

    if (entity.dying && splashRef.current) {
      splashRef.current.visible = true;
      const dp = (performance.now() - entity.deathTime) / 1000;
      splashRef.current.scale.setScalar(Math.max(0, 1 + dp * 2));
      splashRef.current.children.forEach(c => {
        if (c instanceof THREE.Mesh) {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat.opacity = Math.max(0, 1 - dp * 0.8);
          mat.transparent = true;
        }
      });
    }
  });

  const renderModel = () => {
    const isStunned = performance.now() < entity.stunTimer;

    if (entity.type.startsWith('TITAN_')) {
      return (
        <ColossalTitan
          type={entity.type}
          isAttacking={entity.attackPhase !== 'IDLE'}
          hitTime={entity.hitTime}
        />
      );
    }

    return (
      <PremiumZombie
        position={[0, 0, 0]}
        seed={entity.seed}
        type={entity.type}
        isAttacking={entity.attackPhase !== 'IDLE'}
        isDying={entity.dying}
        isStunned={isStunned}
        hitTime={entity.hitTime}
      />
    );
  };

  const skinColor = entity.type === 'WRAITH' ? '#9d00ff' : (entity.type === 'BRUTE' ? '#ff6600' : '#ff4400');

  useEffect(() => {
    if (ref.current) {
      (ref.current as any).isEnemyHeuristic = true;
    }
  }, []);

  return (
    <group ref={ref}>
      <group ref={splashRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 2, 32]} />
          <meshStandardMaterial color={skinColor} transparent opacity={0.6} />
        </mesh>
      </group>
      {renderModel()}
    </group>
  );
};

export default Enemies;
