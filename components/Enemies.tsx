
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

const Enemies: React.FC = () => {
  const { wave, level, islandTheme, damageNightflare, damagePlayer, recordEnemyKill, gameState, nodes, structures, triggerScreenShake } = useGameStore();
  const lastSpawnTime = useRef(0);

  // The master list of mutable enemies
  const enemiesRef = useRef<EnemyEntity[]>([]);
  // React state only for mounting/unmounting Mesh components
  const [enemyIds, setEnemyIds] = useState<string[]>([]);

  const obstacleMap = useMemo(() => {
    return [
      ...nodes.map(n => ({ pos: new THREE.Vector3(...n.position), radius: n.type === 'ROCK' ? 4.5 : 3.5 })),
      ...structures.map(s => ({ pos: new THREE.Vector3(...s.position), radius: 3.5 }))
    ];
  }, [nodes, structures]);

  useEffect(() => {
    const handleAttack = (e: any) => {
      const { position, range, damage } = e.detail;
      const attackPos = position as THREE.Vector3;
      const now = performance.now();

      enemiesRef.current.forEach(en => {
        if (en.dying) return;
        const enPos = new THREE.Vector3(...en.position);
        if (enPos.distanceTo(attackPos) < range) {
          en.health -= damage;
          if (en.health <= 0) {
            en.health = 0;
            en.dying = true;
            en.deathTime = now;
          } else {
            en.hitTime = now;
            en.behavior = EnemyBehavior.CHASE;
            en.stateTimer = now / 1000;
          }
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
          if (en.health <= 0) {
            en.dying = true;
            en.deathTime = now;
          } else {
            en.hitTime = now;
            en.behavior = EnemyBehavior.CHASE;
          }
        }
      });
    };

    const handleNova = () => {
      const now = performance.now();
      enemiesRef.current.forEach(en => {
        if (!en.dying) {
          en.health = 0;
          en.dying = true;
          en.deathTime = now;
          en.hitTime = now;
        }
      });
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

    // Spawning Logic
    const currentEvent = useGameStore(s => s.currentNightEvent);

    let spawnRate = Math.max(0.3, 3.2 / (1 + (level - 1) * 0.9 + (wave - 1) * 0.5));
    let maxEnemies = 12 + level * 7 + wave * 3;

    if (currentEvent === NightEvent.RUSH) {
      spawnRate *= 0.4; // MUCH faster spawns
      maxEnemies *= 1.8;
    } else if (currentEvent === NightEvent.SIEGE) {
      spawnRate *= 1.5; // Slower spawns
      maxEnemies *= 0.6; // Fewer enemies but tougher
    }

    if (currentTime - lastSpawnTime.current > spawnRate && enemiesRef.current.length < maxEnemies) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 55 + Math.random() * 20;
      const spawnPos: [number, number, number] = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];

      let type: EnemyClass = 'STALKER';
      const roll = Math.random();

      if (currentEvent === NightEvent.SIEGE) {
        // Mostly Brutes/Wraiths
        if (roll < 0.6) type = 'BRUTE';
        else if (roll < 0.9) type = 'WRAITH';
        else type = 'STALKER';
      } else if (currentEvent === NightEvent.RUSH) {
        // Mostly Stalkers
        if (roll < 0.9) type = 'STALKER';
        else type = 'WRAITH';
      } else {
        // Normal Logic
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

      if (currentEvent === NightEvent.RUSH) mult *= 0.6; // Weaker enemies in Rush
      if (currentEvent === NightEvent.SIEGE) mult *= 1.5; // Stronger enemies in Siege

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

    // Update Logic
    const killedThisFrame: EnemyClass[] = [];
    let needUpdate = false;

    // Filter dead enemies (garbage collection separate from update loop to keep indices stable during update)
    const survivors: EnemyEntity[] = [];

    for (const enemy of enemiesRef.current) {
      if (enemy.dying) {
        if (nowMs - enemy.deathTime > 1600) {
          killedThisFrame.push(enemy.type);
          needUpdate = true;
          continue; // Remove
        }
        survivors.push(enemy);
        continue; // Skip logic for dying
      }

      const currentPos = new THREE.Vector3(...enemy.position);
      const toPlayer = playerPos.clone().sub(currentPos);
      const distToPlayer = toPlayer.length();
      const distToCore = currentPos.length();
      const visionRange = 45 + level * 5;

      // Behavior
      if (enemy.behavior === EnemyBehavior.PATROL && distToPlayer < visionRange) {
        enemy.behavior = EnemyBehavior.CHASE;
        enemy.stateTimer = currentTime;
      } else if (enemy.behavior === EnemyBehavior.CHASE && distToPlayer > visionRange + 20) {
        enemy.behavior = EnemyBehavior.PATROL;
        enemy.stateTimer = currentTime;
      }

      let moveTarget = _centerVec.clone();
      let spdMult = 1.0;

      if (enemy.behavior === EnemyBehavior.PATROL) {
        const wp = enemy.waypoints[enemy.currentWaypointIdx];
        if (currentPos.distanceTo(wp) < 5) enemy.currentWaypointIdx = (enemy.currentWaypointIdx + 1) % 4;
        moveTarget.copy(wp);
        spdMult = 0.6;
      } else {
        moveTarget.copy(playerPos);
        spdMult = 1.6;
      }

      // Attacks
      const isAttacking = enemy.attackPhase !== 'IDLE';
      const attackRange = enemy.type === 'BRUTE' ? 12 : 9;

      if (!isAttacking && (currentPos.distanceTo(moveTarget) < attackRange || distToCore < 10) && currentTime - enemy.lastAttackTime > (enemy.type === 'BRUTE' ? 4 : 2)) {
        enemy.attackPhase = 'WINDUP';
        enemy.attackAnimTimer = currentTime;
      }

      if (isAttacking) {
        const animElapsed = currentTime - enemy.attackAnimTimer;
        if (enemy.attackPhase === 'WINDUP') {
          spdMult *= 0.1;
          if (animElapsed > 0.6) {
            enemy.attackPhase = 'STRIKE';
            enemy.attackAnimTimer = currentTime;
            // Damage Check
            const dmg = (enemy.type === 'BRUTE' ? 350 : 100) * (1 + level * 0.4);
            if (currentPos.distanceTo(playerPos) < 4.0) {
              damagePlayer(dmg * 0.4);
              if (enemy.type === 'BRUTE') triggerScreenShake(1.2);
            } else if (distToCore < 12) {
              damageNightflare(dmg * 0.3);
            }
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

      // Steering
      _desiredVec.copy(moveTarget).sub(currentPos).normalize();

      // Separation
      _sepVec.set(0, 0, 0);
      for (const other of enemiesRef.current) {
        if (other === enemy || other.dying) continue;
        const op = new THREE.Vector3(...other.position);
        const dst = currentPos.distanceTo(op);
        if (dst < 5.0) _sepVec.add(currentPos.clone().sub(op).normalize().multiplyScalar(8 / (dst + 0.1)));
      }

      // Obstacle Avoidance
      _avoidVec.set(0, 0, 0);
      for (const obs of obstacleMap) {
        const toObs = obs.pos.clone().sub(currentPos);
        if (toObs.length() < 12) {
          _avoidVec.add(toObs.clone().projectOnVector(_desiredVec).sub(toObs).normalize().multiplyScalar(40));
        }
      }

      const steering = _desiredVec.clone().add(_avoidVec).add(_sepVec).normalize();
      const velocity = steering.multiplyScalar(enemy.speed * spdMult * delta);

      enemy.lastVelocity.copy(steering);
      enemy.position = [enemy.position[0] + velocity.x, 0, enemy.position[2] + velocity.z];

      survivors.push(enemy);
    }

    if (needUpdate) {
      enemiesRef.current = survivors;
      setEnemyIds(survivors.map(e => e.id));
    }

    if (killedThisFrame.length > 0) {
      killedThisFrame.forEach(t => recordEnemyKill(t));
    }
  });

  return (
    <group>
      {enemiesRef.current.map(enemy => (
        <ZombieModel key={enemy.id} entity={enemy} />
      ))}
    </group>
  );
};

// Zombie Model that reads from Mutable Entity
const ZombieModel: React.FC<{ entity: EnemyEntity }> = ({ entity }) => {
  const islandTheme = useGameStore(s => s.islandTheme);
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<THREE.Group>(null);

  const seed = entity.seed || 0;
  const scaleVar = 0.9 + (seed % 30) / 100;
  const shirtColor = useMemo(() => {
    const colors = ['#455a64', '#37474f', '#263238', '#5D4037', '#3E2723'];
    return colors[Math.floor(seed * 100) % colors.length];
  }, [seed]);

  useFrame((state) => {
    if (!ref.current || !meshRef.current || !hipsRef.current) return;

    // Sync Position from Entity
    ref.current.position.set(entity.position[0], entity.position[1], entity.position[2]);

    const t = state.clock.getElapsedTime() + seed;
    const isDying = entity.dying;

    if (isDying) {
      meshRef.current.visible = false;
      if (shardsRef.current) {
        shardsRef.current.visible = true;
        const dp = (performance.now() - entity.deathTime) / 1200;
        shardsRef.current.children.forEach((shard, i) => {
          shard.position.y += dp * 4;
          shard.position.x += Math.sin(i + dp * 5 + seed) * 0.1;
          shard.position.z += Math.cos(i + dp * 5 + seed) * 0.1;
          shard.scale.setScalar(Math.max(0, 1 - dp));
          shard.rotation.x += 0.1;
        });
      }
      return;
    }

    // Rotation
    const targetRotation = Math.atan2(entity.lastVelocity.x, entity.lastVelocity.z);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotation, 0.2);

    const isMoving = entity.behavior !== EnemyBehavior.ATTACK;
    const gaitSpeed = entity.behavior === EnemyBehavior.CHASE ? 14 : 6;
    const limp = Math.sin(t * gaitSpeed);

    hipsRef.current.position.y = 1.0 + Math.abs(limp) * 0.1;
    hipsRef.current.rotation.z = Math.sin(t * gaitSpeed) * 0.1;
    hipsRef.current.rotation.x = 0.2 + Math.sin(t * gaitSpeed * 0.5) * 0.1;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * gaitSpeed) * 0.6;
      rightLegRef.current.rotation.x = -Math.sin(t * gaitSpeed) * 0.6;
    }

    if (leftArmRef.current && rightArmRef.current && torsoRef.current) {
      if (entity.attackPhase === 'WINDUP') {
        const windupProg = Math.sin(t * 20);
        torsoRef.current.rotation.x = -0.2 - windupProg * 0.1;
        leftArmRef.current.rotation.x = -Math.PI / 1.5;
        rightArmRef.current.rotation.x = -Math.PI / 1.5;
      } else if (entity.attackPhase === 'STRIKE') {
        torsoRef.current.rotation.x = 0.4;
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      } else {
        leftArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * gaitSpeed) * 0.2;
        rightArmRef.current.rotation.x = -Math.PI / 2 - Math.cos(t * gaitSpeed) * 0.2;
      }
    }

    // Hit Flash check
    const isHit = (performance.now() - entity.hitTime) < 150;
    if (isHit) {
      meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
    } else {
      meshRef.current.position.x = 0;
    }
  });

  const getZombieSkin = () => {
    if (islandTheme === IslandTheme.VOLCANO) return "#d84315";
    if (islandTheme === IslandTheme.ARCTIC) return "#81d4fa";
    return "#8bc34a";
  };

  const baseScale = entity.type === 'BRUTE' ? 1.8 : 1.0;
  const finalScale = baseScale * scaleVar;

  return (
    <group ref={ref}>
      <group ref={shardsRef} visible={false}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[Math.random() - 0.5, 1, Math.random() - 0.5]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={getZombieSkin()} />
          </mesh>
        ))}
      </group>

      <group ref={meshRef} scale={finalScale}>
        <group ref={hipsRef} position={[0, 0.9, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.3, 0.35]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          <group ref={torsoRef} position={[0, 0.15, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.5, 0.7, 0.3]} />
              <meshStandardMaterial color={shirtColor} />
            </mesh>
            <mesh position={[0.1, 0.5, 0.16]}>
              <boxGeometry args={[0.2, 0.3, 0.05]} />
              <meshStandardMaterial color="#5d0a0a" />
            </mesh>
            <group ref={headRef} position={[0, 0.9, 0.1]}>
              <mesh castShadow>
                <boxGeometry args={[0.35, 0.35, 0.35]} />
                <meshStandardMaterial color={getZombieSkin()} />
              </mesh>
              <mesh position={[0.08, 0.05, 0.18]}><planeGeometry args={[0.06, 0.06]} /><meshBasicMaterial color="red" /></mesh>
              <mesh position={[-0.08, 0.05, 0.18]}><planeGeometry args={[0.06, 0.06]} /><meshBasicMaterial color="red" /></mesh>
            </group>
            <group ref={leftArmRef} position={[-0.35, 0.7, 0]}>
              <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.18, 0.7, 0.18]} /><meshStandardMaterial color={getZombieSkin()} /></mesh>
            </group>
            <group ref={rightArmRef} position={[0.35, 0.7, 0]}>
              <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.18, 0.7, 0.18]} /><meshStandardMaterial color={getZombieSkin()} /></mesh>
            </group>
          </group>
          <group ref={leftLegRef} position={[-0.15, -0.15, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow><boxGeometry args={[0.18, 0.8, 0.2]} /><meshStandardMaterial color="#212121" /></mesh>
          </group>
          <group ref={rightLegRef} position={[0.15, -0.15, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow><boxGeometry args={[0.18, 0.8, 0.2]} /><meshStandardMaterial color="#212121" /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default Enemies;
