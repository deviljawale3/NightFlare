
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState, IslandTheme } from '../types';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') window.dispatchEvent(new Event('player-jump'));
      if (e.code === 'KeyF' || e.code === 'Enter') window.dispatchEvent(new Event('player-attack'));
      if (e.code === 'KeyQ') cycleWeapon();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handleJump = () => {
      if (isGrounded) {
        setVerticalVelocity(0.42);
        setIsGrounded(false);
        setPlayerGrounded(false);
        triggerScreenShake(0.4);
      }
    };

    const handleAttack = () => {
      if (!isAttacking) {
        setIsAttacking(true);
        attackTimer.current = 0;

        const shakeIntensity = 0.6 + combo * 0.3;
        triggerScreenShake(shakeIntensity);

        setTimeout(() => {
          if (groupRef.current) {
            window.dispatchEvent(new CustomEvent('player-attack-hitbox', {
              detail: { position: groupRef.current.position.clone(), range: playerStats.attackRange + 6.5, damage: playerStats.attackDamage * (1 + combo * 0.25) }
            }));
          }
        }, 110);

        const cooldown = Math.max(160, 350 - combo * 60);
        setTimeout(() => setIsAttacking(false), cooldown);

        setCombo(prev => Math.min(prev + 1, 3));
        clearTimeout(comboTimeout.current);
        comboTimeout.current = setTimeout(() => setCombo(0), 1000);
      }
    };

    const handleDamaged = () => {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 120);
      setCombo(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('player-jump', handleJump);
    window.addEventListener('player-attack', handleAttack);
    window.addEventListener('player-damaged', handleDamaged);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('player-jump', handleJump);
      window.removeEventListener('player-attack', handleAttack);
      window.removeEventListener('player-damaged', handleDamaged);
    };
  }, [isGrounded, isAttacking, triggerScreenShake, setPlayerGrounded, playerStats, combo, cycleWeapon]);

  const getEnhancedMaterial = (color: string, metalness = 0.3, roughness = 0.7) => (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={color}
      emissiveIntensity={0.2}
    />
  );

  useFrame((state, delta) => {
    if ((gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) || !groupRef.current) return;

    // Movement Logic
    const moveSpeed = playerStats.speed * delta * 5;
    const acceleration = 0.15;

    let mX = (window as any).joystickX || 0;
    let mZ = (window as any).joystickY || 0;

    if (mX === 0 && mZ === 0) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) mZ -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) mZ += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) mX -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) mX += 1;
    }

    const isMoving = mX !== 0 || mZ !== 0;

    if (isMoving) {
      const length = Math.sqrt(mX * mX + mZ * mZ);
      mX /= length;
      mZ /= length;

      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, mX * moveSpeed, acceleration);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, mZ * moveSpeed, acceleration);

      const targetHeading = Math.atan2(mX, mZ);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetHeading, 0.15);
    }

    // Apply friction/damping (frame-rate independent)
    const damping = 1 - Math.exp(-8 * delta);
    velocity.current.x *= (1 - damping);
    velocity.current.z *= (1 - damping);

    groupRef.current.position.x += velocity.current.x;
    groupRef.current.position.z += velocity.current.z;

    // Leg Animation
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving || Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.z) > 0.01) {
        const t = state.clock.getElapsedTime() * 15;
        leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
      } else {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
      }
    }

    // Jump Physics
    if (!isGrounded) {
      groupRef.current.position.y += verticalVelocity;
      setVerticalVelocity(v => v - 0.032);
      if (groupRef.current.position.y <= 0) {
        groupRef.current.position.y = 0;
        setVerticalVelocity(0);
        setIsGrounded(true);
        setPlayerGrounded(true);
      }
    }

    // Export position for camera follow
    (window as any).playerPos = groupRef.current.position.clone();
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Dynamic Point Light */}
      <pointLight
        position={[0, 2, 0]}
        intensity={playerStats.novaCharge / 50}
        distance={8}
        color="#ffae00"
      />

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
      <group position={[-0.5, 1.3, 0]} rotation={[0, 0, isAttacking ? -0.5 : 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          {getEnhancedMaterial('#e8b89a', 0.1, 0.9)}
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          {getEnhancedMaterial('#d4a574', 0.1, 0.9)}
        </mesh>
      </group>

      <group position={[0.5, 1.3, 0]} rotation={[0, 0, isAttacking ? 0.5 : -0.2]}>
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
  );
};

export default Player;
