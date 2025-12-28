
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState, IslandTheme } from '../types';

const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);

  const gameState = useGameStore(s => s.gameState);
  const playerStats = useGameStore(s => s.playerStats);
  const islandTheme = useGameStore(s => s.islandTheme);
  const triggerScreenShake = useGameStore(s => s.triggerScreenShake);
  const setPlayerGrounded = useGameStore(s => s.setPlayerGrounded);

  const [attacking, setAttacking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [damagedFlashing, setDamagedFlashing] = useState(false);
  const [verticalVelocity, setVerticalVelocity] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [combo, setCombo] = useState(0);
  const { camera } = useThree();

  const moveLerp = useRef(0);
  const attackTimer = useRef(0);
  const lastHeading = useRef(0);
  const comboTimeout = useRef<any>(null);

  // Keyboard input ref
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') window.dispatchEvent(new Event('player-jump'));
      if (e.code === 'KeyF' || e.code === 'Enter') window.dispatchEvent(new Event('player-attack'));
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
      if (!attacking) {
        setAttacking(true);
        setFlashing(true);
        attackTimer.current = 0;

        const shakeIntensity = 0.6 + combo * 0.3;
        triggerScreenShake(shakeIntensity);

        setTimeout(() => {
          if (groupRef.current) {
            window.dispatchEvent(new CustomEvent('player-attack-hitbox', {
              detail: { position: groupRef.current.position.clone(), range: playerStats.attackRange + 4.5, damage: playerStats.attackDamage * (1 + combo * 0.25) }
            }));
          }
        }, 110);

        const cooldown = Math.max(160, 350 - combo * 60);
        setTimeout(() => setAttacking(false), cooldown);
        setTimeout(() => setFlashing(false), 140);

        setCombo(prev => Math.min(prev + 1, 3));
        clearTimeout(comboTimeout.current);
        comboTimeout.current = setTimeout(() => setCombo(0), 1000);
      }
    };

    const handleDamaged = () => {
      setDamagedFlashing(true);
      setTimeout(() => setDamagedFlashing(false), 120);
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
  }, [isGrounded, attacking, triggerScreenShake, setPlayerGrounded, playerStats, combo]);

  useFrame((state, delta) => {
    if ((gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) || !groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Joystick Input
    let mX = (window as any).joystickX || 0;
    let mZ = (window as any).joystickY || 0;

    // Keyboard Input Fallback
    if (mX === 0 && mZ === 0) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) mZ -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) mZ += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) mX -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) mX += 1;

      // Normalize keyboard vector
      if (mX !== 0 || mZ !== 0) {
        const length = Math.sqrt(mX * mX + mZ * mZ);
        mX /= length;
        mZ /= length;
      }
    }

    const inputMag = Math.sqrt(mX * mX + mZ * mZ);
    const isMoving = inputMag > 0.1;

    // Smooth movement transition
    moveLerp.current = THREE.MathUtils.lerp(moveLerp.current, isMoving ? 1 : 0, delta * 12);

    if (isMoving) {
      const targetHeading = Math.atan2(mX, mZ);
      lastHeading.current = THREE.MathUtils.lerp(lastHeading.current, targetHeading, 0.25); // Snappier turn (was 0.18)

      // Dynamic Tilt into Turn
      const turnDiff = lastHeading.current - targetHeading;
      const tilt = Math.max(-0.25, Math.min(0.25, turnDiff * 1.5));
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tilt, 0.1);
      groupRef.current.rotation.y = lastHeading.current;

      let speedMult = 1.0;
      if (islandTheme === IslandTheme.ARCTIC) speedMult = 0.82;

      const speed = playerStats.speed * delta * (0.85 + 0.15 * inputMag) * speedMult;
      groupRef.current.position.x += Math.sin(lastHeading.current) * speed;
      groupRef.current.position.z += Math.cos(lastHeading.current) * speed;
    } else {
      // Return to upright when stopped
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
    }

    (window as any).playerPos = groupRef.current.position.clone();

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

    // Polished Camera: Closer/Bouncier - Snappier follow
    const targetCamPos = new THREE.Vector3(groupRef.current.position.x + 10, groupRef.current.position.y + 14, groupRef.current.position.z + 10);
    camera.position.lerp(targetCamPos, 0.12); // Snappier camera (was 0.08)
    camera.lookAt(groupRef.current.position.x, groupRef.current.position.y + 0.5, groupRef.current.position.z);

    const freq = isMoving ? (inputMag > 0.8 ? 18 : 12) : 2.0;
    const cycle = Math.sin(t * freq);
    const cosCycle = Math.cos(t * freq);

    if (meshGroupRef.current && hipsRef.current && torsoRef.current) {
      // Run Bob
      hipsRef.current.position.y = 0.9 + moveLerp.current * (Math.abs(cycle) * 0.15);
      // Run Sway
      hipsRef.current.rotation.z = Math.sin(t * freq * 0.5) * 0.1 * moveLerp.current;

      if (rightArmRef.current && leftArmRef.current && leftLegRef.current && rightLegRef.current) {
        if (attacking) {
          attackTimer.current += delta;
          const duration = 0.32;
          const prog = Math.min(1, attackTimer.current / duration);

          // 2-Stage Attack: Windup -> Strike
          if (prog < 0.3) {
            // Windup (Back)
            const windup = prog / 0.3;
            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(-0.5, -2.5, windup);
            rightArmRef.current.rotation.z = 0.8;
            torsoRef.current.rotation.y = 0.5 * windup;
          } else {
            // Strike (Forward Snap)
            const strike = (prog - 0.3) / 0.7;
            // Elastic ease out
            const snap = Math.sin(strike * Math.PI * 0.8);
            rightArmRef.current.rotation.x = -2.5 + snap * 4.0;
            rightArmRef.current.rotation.z = 0.2;
            torsoRef.current.rotation.y = 0.5 - strike * 1.0; // Twist body into hit
          }
        } else {
          // Idle/Run Animations
          // Arms Counter-Swing
          rightArmRef.current.rotation.x = moveLerp.current * (cosCycle * 0.8);
          rightArmRef.current.rotation.z = 0.1 + moveLerp.current * 0.1;

          leftArmRef.current.rotation.x = moveLerp.current * (-cosCycle * 0.8);
          leftArmRef.current.rotation.z = -0.1 - moveLerp.current * 0.1;

          // Legs
          rightLegRef.current.rotation.x = moveLerp.current * (-cosCycle * 0.8);
          leftLegRef.current.rotation.x = moveLerp.current * (cosCycle * 0.8);

          // Reset Spine
          torsoRef.current.rotation.y = 0;
        }
      }
    }
  });

  const getMat = (c: string, emissive = "black") => (
    <meshStandardMaterial
      color={damagedFlashing || flashing ? "white" : c}
      emissive={damagedFlashing || flashing ? "white" : emissive}
      emissiveIntensity={damagedFlashing || flashing ? 15 : 0}
      flatShading
    />
  );

  return (
    <group ref={groupRef}>
      <group ref={meshGroupRef}>
        <group ref={hipsRef} position={[0, 0.9, 0]}>

          {/* Human Body - Improved Proportions */}
          <group ref={torsoRef} position={[0, 0.1, 0]}>
            {/* Torso/Vest - Cream Color */}
            <mesh castShadow position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.34, 0.28, 0.9, 8]} />
              {getMat("#F5F5DC")} {/* CREME COLOR VEST */}
            </mesh>

            {/* Neck Scarf/Bandana */}
            <mesh position={[0, 0.62, 0.1]} rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.28, 0.25, 2.5]} />
              {getMat("#d32f2f")}
            </mesh>

            {/* Head & Face */}
            <group ref={neckRef} position={[0, 0.85, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.3, 16, 16]} />
                {getMat("#e0ac69")} {/* Skin Tone */}
              </mesh>

              {/* Face Details (Eyes) */}
              <mesh position={[0.1, 0.05, 0.22]}>
                <sphereGeometry args={[0.03]} />
                <meshBasicMaterial color="#000" />
              </mesh>
              <mesh position={[-0.1, 0.05, 0.22]}>
                <sphereGeometry args={[0.03]} />
                <meshBasicMaterial color="#000" />
              </mesh>

              <group position={[0, 0.2, 0]}>
                {/* Hat */}
                <mesh position={[0, 0.05, 0]} rotation={[-0.05, 0, 0]}>
                  <cylinderGeometry args={[0.95, 0.95, 0.05, 16]} />
                  {getMat("#3e2723")}
                </mesh>
                <mesh position={[0, 0.25, 0]}>
                  <cylinderGeometry args={[0.38, 0.42, 0.4, 12]} />
                  {getMat("#3e2723")}
                </mesh>
              </group>
            </group>

            {/* Arms - Segmented */}
            <group ref={leftArmRef} position={[-0.45, 0.45, 0]}>
              <mesh position={[0, -0.3, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.07, 0.7]} />
                {getMat("#d7ccc8")} {/* Sleeve/Skin mix */}
              </mesh>
              <mesh position={[0, -0.7, 0]} castShadow>
                <sphereGeometry args={[0.08]} />
                {getMat("#e0ac69")} {/* Hand */}
              </mesh>
            </group>

            <group ref={rightArmRef} position={[0.45, 0.45, 0]}>
              <mesh position={[0, -0.3, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.07, 0.7]} />
                {getMat("#d7ccc8")}
              </mesh>
              <mesh position={[0, -0.7, 0]} castShadow>
                <sphereGeometry args={[0.08]} />
                {getMat("#e0ac69")} {/* Hand */}
              </mesh>

              {/* Weapon: Enchanted Staff - Refined */}
              <group ref={weaponRef} position={[0, -0.6, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh castShadow><cylinderGeometry args={[0.03, 0.03, 3.8, 8]} /><meshStandardMaterial color="#3e2723" /></mesh>
                <mesh position={[0, 1.9, 0]}>
                  <dodecahedronGeometry args={[0.35, 0]} />
                  <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={60 + combo * 40} />
                </mesh>
                {(attacking || damagedFlashing) && <pointLight color="#ffcc00" intensity={120} distance={22} />}
              </group>
            </group>
          </group>

          {/* Legs - Segmented */}
          <group ref={leftLegRef} position={[-0.2, 0, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.1, 0.9]} />
              {getMat("#263238")} {/* Jeans */}
            </mesh>
            <mesh position={[0, -0.9, 0.1]} castShadow>
              <boxGeometry args={[0.2, 0.15, 0.35]} />
              {getMat("#1a1a1a")} {/* Boots */}
            </mesh>
          </group>
          <group ref={rightLegRef} position={[0.2, 0, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.1, 0.9]} />
              {getMat("#263238")}
            </mesh>
            <mesh position={[0, -0.9, 0.1]} castShadow>
              <boxGeometry args={[0.2, 0.15, 0.35]} />
              {getMat("#1a1a1a")}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default Player;
