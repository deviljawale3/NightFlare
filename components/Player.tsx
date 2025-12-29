
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState, IslandTheme } from '../types';
import { soundEffects } from '../utils/soundEffects';

const TrailVFX: React.FC<{ target: React.MutableRefObject<THREE.Group | null> }> = ({ target }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trailRef = useRef<{ pos: THREE.Vector3, scale: number, life: number }[]>([]);

  useFrame((state, delta) => {
    if (!target.current || !meshRef.current) return;

    // Spawn new particle
    if (Math.random() > 0.5) { // Throttle spawning
      const currentPos = target.current.position.clone();
      trailRef.current.unshift({ pos: currentPos, scale: 1, life: 1.0 });
    }

    // Update particles
    trailRef.current = trailRef.current.filter(p => p.life > 0);
    trailRef.current.forEach(p => {
      p.life -= delta * 2.0; // Fade speed
      p.scale = p.life * 0.5;
    });

    // Limit trail length
    if (trailRef.current.length > 20) trailRef.current.length = 20;

    // Update InstancedMesh
    trailRef.current.forEach((p, i) => {
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.count = trailRef.current.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 20]}>
      <sphereGeometry args={[0.3, 6, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </instancedMesh>
  );
};

const getEnhancedMaterial = (color: string, metalness = 0.5, roughness = 0.5) => (
  <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
);

const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());

  const gameState = useGameStore(s => s.gameState);
  const playerStats = useGameStore(s => s.playerStats);
  const islandTheme = useGameStore(s => s.islandTheme);
  const triggerScreenShake = useGameStore(s => s.triggerScreenShake);
  const setPlayerGrounded = useGameStore(s => s.setPlayerGrounded);
  const cycleWeapon = useGameStore(s => s.cycleWeapon);

  const [isAttacking, setIsAttacking] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [verticalVelocity, setVerticalVelocity] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [combo, setCombo] = useState(0);
  const { camera } = useThree();

  const attackTimer = useRef(0);
  const comboTimeout = useRef<any>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  const footstepTimer = useRef(0);
  const lastFootstepTime = useRef(0);

  // Attack Handler with Lunge and Combo
  const handleAttack = () => {
    if (!isAttacking && !isDead) {
      setIsAttacking(true);
      attackTimer.current = 0;

      // Play attack swing sound based on weapon
      if (playerStats.currentWeapon === 'STAFF') {
        soundEffects.attackSwingStaff();
      } else if (playerStats.currentWeapon === 'SWORD') {
        soundEffects.attackSwingSword();
      } else if (playerStats.currentWeapon === 'BOW') {
        soundEffects.attackSwingBow();
      }

      const shakeIntensity = 0.6 + combo * 0.3;
      triggerScreenShake(shakeIntensity);

      if (groupRef.current) {
        const heading = groupRef.current.rotation.y;
        // REFINED ANIMATION: Lunge forward with more human momentum
        const lungePower = 0.18; // Further reduced for stability
        velocity.current.x += Math.sin(heading) * lungePower;
        velocity.current.z += Math.cos(heading) * lungePower;
      }

      // Trigger hitbox faster for better response
      setTimeout(() => {
        if (groupRef.current) {
          window.dispatchEvent(new CustomEvent('player-attack-hitbox', {
            detail: {
              position: groupRef.current.position.clone(),
              range: playerStats.attackRange + 1.5,
              damage: playerStats.attackDamage * (1 + combo * 0.25)
            }
          }));
        }
      }, 50);

      const cooldown = Math.max(160, 350 - combo * 60);
      setTimeout(() => setIsAttacking(false), cooldown);

      setCombo(prev => Math.min(prev + 1, 3));
      clearTimeout(comboTimeout.current);
      comboTimeout.current = setTimeout(() => setCombo(0), 1000);
    }
  };

  // Death State
  const [isDead, setIsDead] = useState(false);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER && playerStats.currentHealth <= 0) {
      setIsDead(true);
    } else {
      setIsDead(false);
    }
  }, [gameState, playerStats.currentHealth]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Death Animation
    if (isDead) {
      // Fall over
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 2, delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.2, delta * 5);
      return;
    }

    if ((gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL)) return;

    // MOVEMENT LOGIC
    // Block movement input if attacking (STABILITY FIX)
    let moveSpeed = playerStats.speed * delta * 1.3; // Slower for more natural feel
    const acceleration = 0.05; // Slower acceleration
    const deceleration = 0.08; // Slower deceleration

    let mX = (window as any).joystickX || 0;
    let mZ = (window as any).joystickY || 0;

    if (mX === 0 && mZ === 0) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) mZ -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) mZ += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) mX -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) mX += 1;
    }

    // IF ATTACKING: Force zero input movement, allow only physics/lunge
    if (isAttacking) {
      mX = 0;
      mZ = 0;
      // Damping for stability - frame-rate independent
      velocity.current.multiplyScalar(Math.pow(0.8, delta * 60));
    }

    const isMoving = mX !== 0 || mZ !== 0;

    if (isMoving) {
      const length = Math.sqrt(mX * mX + mZ * mZ);
      mX /= length;
      mZ /= length;

      // Smooth acceleration - frame-rate independent
      const accelFactor = 1 - Math.exp(-acceleration * 60 * delta);
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, mX * moveSpeed, accelFactor);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, mZ * moveSpeed, accelFactor);

      // Smooth rotation
      const targetHeading = Math.atan2(mX, mZ);
      let rotDiff = targetHeading - groupRef.current.rotation.y;

      // Normalize rotation difference to shortest path
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

      const rotFactor = 1 - Math.exp(-9 * delta);
      groupRef.current.rotation.y += rotDiff * rotFactor;
    } else {
      // Smooth deceleration
      const decelFactor = 1 - Math.exp(-deceleration * 60 * delta);
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, decelFactor);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, decelFactor);
    }

    // Apply movement
    groupRef.current.position.x += velocity.current.x;
    groupRef.current.position.z += velocity.current.z;

    // Enhanced Leg Animation with realistic stride
    if (leftLegRef.current && rightLegRef.current) {
      // If attacking, legs should be stable or braced
      if (isAttacking) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.4, 0.2); // Braced stance
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, 0.2);
      } else {
        const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2);

        if (speed > 0.01) {
          // Dynamic stride frequency based on speed (HUMAN LIKE)
          const strideFrequency = 8 + speed * 12;
          const t = state.clock.getElapsedTime() * strideFrequency;
          const strideAmplitude = Math.min(0.5, 0.2 + speed * 4);

          // Realistic leg swing with proper phase
          leftLegRef.current.rotation.x = Math.sin(t) * strideAmplitude;
          rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * strideAmplitude;

          // Add subtle hip sway for realism
          groupRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.05;

          // Footstep sounds - play when foot hits ground
          const footstepInterval = 0.4 / (speed + 0.5); // Faster steps when moving faster
          if (state.clock.getElapsedTime() - lastFootstepTime.current > footstepInterval) {
            // Determine terrain type based on island theme
            if (islandTheme === IslandTheme.FOREST) {
              soundEffects.footstepGrass();
            } else if (islandTheme === IslandTheme.VOLCANO) {
              soundEffects.footstepStone();
            } else {
              soundEffects.footstepStone(); // Arctic/default
            }
            lastFootstepTime.current = state.clock.getElapsedTime();
          }
        } else {
          // Smooth return to idle pose
          const idleFactor = 1 - Math.exp(-9 * delta);
          leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, idleFactor);
          rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, idleFactor);

          // Subtle breathing animation when idle (time synced)
          groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
        }
      }
    }

    // Jump Physics with realistic arc
    if (!isGrounded) {
      groupRef.current.position.y += verticalVelocity;
      setVerticalVelocity(v => v - 0.035); // Slightly stronger gravity for better feel

      if (groupRef.current.position.y <= 0) {
        groupRef.current.position.y = 0;
        setVerticalVelocity(0);
        setIsGrounded(true);
        setPlayerGrounded(true);

        // Landing impact effect
        soundEffects.playerLand();
        triggerScreenShake(0.3);
      }
    }

    // Export position for camera follow
    (window as any).playerPos = groupRef.current.position.clone();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') window.dispatchEvent(new Event('player-jump'));
      if (e.code === 'KeyF' || e.code === 'Enter') handleAttack();
      if (e.code === 'KeyQ') cycleWeapon();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handleJump = () => {
      if (isGrounded) {
        soundEffects.playerJump();
        setVerticalVelocity(0.42);
        setIsGrounded(false);
        setPlayerGrounded(false);
        triggerScreenShake(0.4);
      }
    };

    const handleDamaged = () => {
      soundEffects.playerDamage();
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 120);
      setCombo(0);
    };

    const onAttackEvent = () => handleAttack();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('player-jump', handleJump);
    window.addEventListener('player-attack', onAttackEvent);
    window.addEventListener('player-damaged', handleDamaged);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('player-jump', handleJump);
      window.removeEventListener('player-attack', onAttackEvent);
      window.removeEventListener('player-damaged', handleDamaged);
    };
  }, [isGrounded, isAttacking, triggerScreenShake, setPlayerGrounded, playerStats, combo, cycleWeapon, isDead]);

  return (
    <>
      <TrailVFX target={groupRef} />
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Dynamic Point Light */}
        <pointLight
          position={[0, 2, 0]}
          intensity={playerStats.novaCharge / 50}
          distance={8}
          color="#ffae00"
        />

        {/* ATTACK SLASH EFFECT - Double Ring for better visual */}
        {isAttacking && (
          <>
            <group position={[0, 1.2, 0.8]} rotation={[Math.PI / 4, 0, 0]}>
              <mesh scale={[1 + Math.sin(performance.now() * 0.02), 1, 1]}>
                <ringGeometry args={[0.8, 1.4, 32, 1, 0, Math.PI]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={4}
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
            <group position={[0, 1.2, 1.0]} rotation={[Math.PI / 3, 0, 0]}>
              <mesh scale={[1, 1 + Math.cos(performance.now() * 0.02), 1]}>
                <ringGeometry args={[0.6, 1.1, 32, 1, 0, Math.PI]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={6}
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </>
        )}

        {/* BODY - More detailed torso */}
        <mesh position={[0, 1.2, 0]} castShadow scale={isDamaged ? 1.2 : 1}>
          <boxGeometry args={[0.7, 1, 0.5]} />
          {getEnhancedMaterial(isDamaged ? '#ff0000' : '#2c3e50', 0.5, 0.6)}
        </mesh>


        {/* CHEST ARMOR PLATE */}
        {playerStats.hasArmor && (
          <>
            <mesh position={[0, 1.4, 0.26]} castShadow>
              <boxGeometry args={[0.65, 0.8, 0.05]} />
              {getEnhancedMaterial('#34495e', 0.8, 0.3)}
            </mesh>
            <mesh position={[-0.45, 1.7, 0]} castShadow>
              <boxGeometry args={[0.25, 0.25, 0.5]} />
              {getEnhancedMaterial('#34495e', 0.8, 0.3)}
            </mesh>
            <mesh position={[0.45, 1.7, 0]} castShadow>
              <boxGeometry args={[0.25, 0.25, 0.5]} />
              {getEnhancedMaterial('#34495e', 0.8, 0.3)}
            </mesh>
          </>
        )}

        {/* HEAD - More detailed */}
        <group position={[0, 2.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            {getEnhancedMaterial('#e8b89a', 0.1, 0.9)}
          </mesh>
          <mesh position={[-0.12, 0.08, 0.26]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.12, 0.08, 0.26]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.52, 0.15, 0.52]} />
            {getEnhancedMaterial('#8b4513', 0.2, 0.8)}
          </mesh>
        </group>

        {/* ARMS - Animated */}
        <group position={[-0.5, 1.3, 0]} rotation={[isAttacking ? -0.5 : 0, 0, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            {getEnhancedMaterial('#e8b89a', 0.1, 0.9)}
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            {getEnhancedMaterial('#d4a574', 0.1, 0.9)}
          </mesh>
        </group>

        <group position={[0.5, 1.3, 0]} rotation={[isAttacking ? -1.5 : 0, 0, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            {getEnhancedMaterial('#e8b89a', 0.1, 0.9)}
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            {getEnhancedMaterial('#d4a574', 0.1, 0.9)}
          </mesh>
        </group>

        {/* LEGS - Animated walking */}
        <group ref={leftLegRef} position={[-0.2, 0.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.9, 0.25]} />
            {getEnhancedMaterial('#34495e', 0.4, 0.7)}
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.23, 0.6, 0.23]} />
            {getEnhancedMaterial('#2c3e50', 0.4, 0.7)}
          </mesh>
          <mesh position={[0, -0.85, 0.05]} castShadow>
            <boxGeometry args={[0.25, 0.15, 0.35]} />
            {getEnhancedMaterial('#1a1a1a', 0.6, 0.5)}
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.2, 0.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.9, 0.25]} />
            {getEnhancedMaterial('#34495e', 0.4, 0.7)}
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.23, 0.6, 0.23]} />
            {getEnhancedMaterial('#2c3e50', 0.4, 0.7)}
          </mesh>
          <mesh position={[0, -0.85, 0.05]} castShadow>
            <boxGeometry args={[0.25, 0.15, 0.35]} />
            {getEnhancedMaterial('#1a1a1a', 0.6, 0.5)}
          </mesh>
        </group>

        {/* WEAPON - Enhanced based on type */}
        {playerStats.currentWeapon === 'STAFF' && (
          <group position={[0.6, 1.2, 0]} rotation={[0, 0, -0.3]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
              {getEnhancedMaterial('#8b4513', 0.3, 0.7)}
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={playerStats.novaCharge / 50} metalness={0.9} roughness={0.1} />
            </mesh>
            <pointLight position={[0, 1.1, 0]} intensity={playerStats.novaCharge / 30} distance={5} color="#00d4ff" />
          </group>
        )}

        {playerStats.currentWeapon === 'SWORD' && playerStats.weaponLevels.SWORD > 0 && (
          <group position={[0.6, 1.2, 0]} rotation={[0, 0, isAttacking ? -1.5 : -0.5]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 1.2, 0.05]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} emissive="#ff4400" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -0.7, 0]} castShadow>
              <boxGeometry args={[0.3, 0.15, 0.15]} />
              {getEnhancedMaterial('#8b4513', 0.5, 0.6)}
            </mesh>
            <mesh position={[0, -0.85, 0]}>
              <sphereGeometry args={[0.1]} />
              {getEnhancedMaterial('#ffd700', 0.9, 0.2)}
            </mesh>
          </group>
        )}

        {/* NOVA CHARGE INDICATOR */}
        {playerStats.novaCharge >= 100 && (
          <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <ringGeometry args={[0.8, 1, 32]} />
              <meshStandardMaterial color="#ffae00" emissive="#ffae00" emissiveIntensity={2} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* DAMAGE FLASH */}
        {isDamaged && (
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshStandardMaterial color="#ff0000" transparent opacity={0.3} emissive="#ff0000" emissiveIntensity={3} />
          </mesh>
        )}
      </group>
    </>
  );
};

export default Player;
