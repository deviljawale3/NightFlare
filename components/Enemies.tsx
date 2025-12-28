
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { EnemyType, GameState, EnemyClass, EnemyTarget, EnemyBehavior, IslandTheme, NightEvent } from '../types';

const _centerVec = new THREE.Vector3(0, 0, 0);
const _avoidVec = new THREE.Vector3();
const _desiredVec = new THREE.Vector3();
const _sepVec = new THREE.Vector3();

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
      const { position, range, damage } = e.detail;
      const attackPos = position as THREE.Vector3;
      const now = performance.now();
      enemiesRef.current.forEach(en => {
        if (en.dying) return;
        if (new THREE.Vector3(...en.position).distanceTo(attackPos) < range) {
          en.health -= damage;
          if (en.health <= 0) { en.health = 0; en.dying = true; en.deathTime = now; }
          else { en.hitTime = now; en.behavior = EnemyBehavior.CHASE; en.stateTimer = now / 1000; }
        }
      });
    };
    const handleEnemyHit = (e: any) => {
      const { id, damage } = e.detail || {};
      if (!id) return;
      const now = performance.now();
      enemiesRef.current.forEach(en => {
        if (en.id === id || id === 'any') {
          if (en.dying) return;
          en.health -= (damage || 35);
          if (en.health <= 0) { en.dying = true; en.deathTime = now; }
          else { en.hitTime = now; en.behavior = EnemyBehavior.CHASE; }
        }
      });
    };
    const handleNova = () => {
      const now = performance.now();
      enemiesRef.current.forEach(en => { if (!en.dying) { en.health = 0; en.dying = true; en.deathTime = now; en.hitTime = now; } });
    };
    window.addEventListener('player-attack-hitbox', handleAttack);
    window.addEventListener('enemy-hit', handleEnemyHit);
    window.addEventListener('nightflare-nova', handleNova);
    return () => {
      window.removeEventListener('player-attack-hitbox', handleAttack);
      window.removeEventListener('enemy-hit', handleEnemyHit);
      window.removeEventListener('nightflare-nova', handleNova);
    };
  }, []);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;
    const currentTime = state.clock.getElapsedTime();
    const nowMs = performance.now();
    const playerPos = (window as any).playerPos || new THREE.Vector3(1000, 0, 1000);

    const currentEvent = useGameStore(s => s.currentNightEvent);
    let spawnRate = Math.max(0.3, 3.2 / (1 + (level - 1) * 0.9 + (wave - 1) * 0.5));
    let maxEnemies = 12 + level * 7 + wave * 3;

    if (currentEvent === NightEvent.RUSH) { spawnRate *= 0.4; maxEnemies *= 1.8; }
    else if (currentEvent === NightEvent.SIEGE) { spawnRate *= 1.5; maxEnemies *= 0.6; }

    if (currentTime - lastSpawnTime.current > spawnRate && enemiesRef.current.length < maxEnemies) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 55 + Math.random() * 20;
      const spawnPos: [number, number, number] = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
      let type: EnemyClass = 'STALKER';
      const roll = Math.random();

      if (currentEvent === NightEvent.SIEGE) {
        if (roll < 0.6) type = 'BRUTE';
        else if (roll < 0.9) type = 'WRAITH';
        else type = 'STALKER';
      } else if (currentEvent === NightEvent.RUSH) {
        if (roll < 0.9) type = 'STALKER';
        else type = 'WRAITH';
      } else {
        if ((level >= 3 || wave >= 8) && roll < 0.2) type = 'VOID_WALKER';
        else if ((level >= 2 || wave >= 5) && roll < 0.4) type = 'WRAITH';
        else if (wave >= 3 && roll < 0.6) type = 'BRUTE';
      }

      const statsMap: Record<EnemyClass, any> = {
        STALKER: { health: 220, speed: 12.0 },
        BRUTE: { health: 2200, speed: 5.5 },
        WRAITH: { health: 550, speed: 17.0 },
        VOID_WALKER: { health: 8500, speed: 4.8 }
      };
      const baseStats = statsMap[type];
      let mult = 1 + (level - 1) * 0.8 + (wave - 1) * 0.4;
      if (currentEvent === NightEvent.RUSH) mult *= 0.6;
      if (currentEvent === NightEvent.SIEGE) mult *= 1.5;

      const newEntity = new EnemyEntity({
        id: `enemy-${nowMs}-${Math.random()}`,
        type,
        position: spawnPos,
        health: baseStats.health * mult,
        maxHealth: baseStats.health * mult,
        speed: baseStats.speed * (1 + level * 0.12),
        target: 'NIGHTFLARE',
        behavior: EnemyBehavior.PATROL
      });
      enemiesRef.current.push(newEntity);
      setEnemyIds(enemiesRef.current.map(e => e.id));
      lastSpawnTime.current = currentTime;
    }

    const killedThisFrame: EnemyClass[] = [];
    const survivors: EnemyEntity[] = [];
    for (const enemy of enemiesRef.current) {
      if (enemy.dying) {
        if (nowMs - enemy.deathTime > 1600) { killedThisFrame.push(enemy.type); continue; }
        survivors.push(enemy); continue;
      }
      const currentPos = new THREE.Vector3(...enemy.position);
      const toPlayer = playerPos.clone().sub(currentPos);
      const distToPlayer = toPlayer.length();
      const distToCore = currentPos.length();
      const visionRange = 45 + level * 5;

      if (enemy.behavior === EnemyBehavior.PATROL && distToPlayer < visionRange) { enemy.behavior = EnemyBehavior.CHASE; enemy.stateTimer = currentTime; }
      else if (enemy.behavior === EnemyBehavior.CHASE && distToPlayer > visionRange + 20) { enemy.behavior = EnemyBehavior.PATROL; enemy.stateTimer = currentTime; }

      let moveTarget = _centerVec.clone();
      let spdMult = 1.0;
      if (enemy.behavior === EnemyBehavior.PATROL) {
        const wp = enemy.waypoints[enemy.currentWaypointIdx];
        if (currentPos.distanceTo(wp) < 5) enemy.currentWaypointIdx = (enemy.currentWaypointIdx + 1) % 4;
        moveTarget.copy(wp); spdMult = 0.6;
      } else { moveTarget.copy(playerPos); spdMult = 1.6; }

      const isAttacking = enemy.attackPhase !== 'IDLE';
      const attackRange = enemy.type === 'BRUTE' ? 12 : 9;
      if (!isAttacking && (currentPos.distanceTo(moveTarget) < attackRange || distToCore < 10) && currentTime - enemy.lastAttackTime > (enemy.type === 'BRUTE' ? 4 : 2)) {
        enemy.attackPhase = 'WINDUP'; enemy.attackAnimTimer = currentTime;
      }
      if (isAttacking) {
        const animElapsed = currentTime - enemy.attackAnimTimer;
        if (enemy.attackPhase === 'WINDUP') {
          spdMult *= 0.1;
          if (animElapsed > 0.6) {
            enemy.attackPhase = 'STRIKE'; enemy.attackAnimTimer = currentTime;
            const dmg = (enemy.type === 'BRUTE' ? 350 : 100) * (1 + level * 0.4);
            if (currentPos.distanceTo(playerPos) < 4.0) { damagePlayer(dmg * 0.15); if (enemy.type === 'BRUTE') triggerScreenShake(1.2); }
            else if (distToCore < 12) damageNightflare(dmg * 0.3);
            window.dispatchEvent(new CustomEvent('attack-impact', { detail: { position: currentPos.toArray() } }));
          }
        } else if (enemy.attackPhase === 'STRIKE') {
          spdMult *= 5.0;
          if (animElapsed > 0.3) { enemy.attackPhase = 'RECOVERY'; enemy.attackAnimTimer = currentTime; }
        } else if (enemy.attackPhase === 'RECOVERY') {
          spdMult *= 0.2;
          if (animElapsed > 0.6) { enemy.attackPhase = 'IDLE'; enemy.lastAttackTime = currentTime; }
        }
      }

      _desiredVec.copy(moveTarget).sub(currentPos).normalize();
      _sepVec.set(0, 0, 0);
      for (const other of enemiesRef.current) {
        if (other === enemy || other.dying) continue;
        const op = new THREE.Vector3(...other.position);
        const dst = currentPos.distanceTo(op);
        if (dst < 5.0) _sepVec.add(currentPos.clone().sub(op).normalize().multiplyScalar(8 / (dst + 0.1)));
      }
      _avoidVec.set(0, 0, 0);
      for (const obs of obstacleMap) {
        const toObs = obs.pos.clone().sub(currentPos);
        if (toObs.length() < 12) _avoidVec.add(toObs.clone().projectOnVector(_desiredVec).sub(toObs).normalize().multiplyScalar(40));
      }
      const steering = _desiredVec.clone().add(_avoidVec).add(_sepVec).normalize();
      const velocity = steering.multiplyScalar(enemy.speed * spdMult * delta);
      enemy.lastVelocity.copy(steering);
      enemy.position = [enemy.position[0] + velocity.x, 0, enemy.position[2] + velocity.z];
      survivors.push(enemy);
    }
    enemiesRef.current = survivors;
    setEnemyIds(survivors.map(e => e.id));
    if (killedThisFrame.length > 0) killedThisFrame.forEach(t => recordEnemyKill(t));
  });

  return (
    <group>
      {enemiesRef.current.map(enemy => (
        <EnemyRenderer key={enemy.id} entity={enemy} />
      ))}
    </group>
  );
};

const EnemyRenderer: React.FC<{ entity: EnemyEntity }> = ({ entity }) => {
  const ref = useRef<THREE.Group>(null);
  const splashRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.lerp(new THREE.Vector3(...entity.position), 0.2);
    const targetRotation = Math.atan2(entity.lastVelocity.x, entity.lastVelocity.z);
    let rotDiff = targetRotation - ref.current.rotation.y;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    ref.current.rotation.y += rotDiff * 0.15;

    if (entity.dying && splashRef.current) {
      splashRef.current.visible = true;
      const dp = (performance.now() - entity.deathTime) / 1000;
      splashRef.current.scale.setScalar(Math.max(0, 1 + dp * 2));
      splashRef.current.children.forEach(c => {
        if (c instanceof THREE.Mesh) c.material.opacity = Math.max(0, 1 - dp * 0.8);
      });
    }
  });

  const renderModel = () => {
    switch (entity.type) {
      case 'STALKER': return <EnhancedStalker position={[0, 0, 0]} seed={entity.seed} />;
      case 'BRUTE': return <EnhancedBrute position={[0, 0, 0]} seed={entity.seed} />;
      case 'WRAITH': return <EnhancedWraith position={[0, 0, 0]} seed={entity.seed} />;
      case 'VOID_WALKER': return <EnhancedVoidWalker position={[0, 0, 0]} seed={entity.seed} />;
      default: return null;
    }
  };

  const skinColor = entity.type === 'WRAITH' ? '#9d00ff' : (entity.type === 'BRUTE' ? '#ff6600' : '#ff4400');

  return (
    <group ref={ref}>
      <group ref={splashRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 2, 32]} />
          <meshStandardMaterial color={skinColor} transparent opacity={0.6} />
        </mesh>
      </group>
      {!entity.dying && renderModel()}
    </group>
  );
};

export default Enemies;
