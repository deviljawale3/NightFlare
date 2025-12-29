
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { soundEffects } from '../utils/soundEffects';

const Nightflare: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groundRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const flameRingRef = useRef<THREE.Mesh>(null);
  const nightflareHealth = useGameStore(state => state.nightflareHealth);
  const [flickerTime, setFlickerTime] = useState(0);
  const [lastPulseTime, setLastPulseTime] = useState(0);

  const lastHealth = useRef(nightflareHealth);
  useEffect(() => {
    if (nightflareHealth < lastHealth.current) {
      setFlickerTime(performance.now());
    }
    lastHealth.current = nightflareHealth;
  }, [nightflareHealth]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const hitDuration = 600;
    const timeSinceHit = performance.now() - flickerTime;
    const hitReaction = timeSinceHit < hitDuration;

    const healthFactor = (100 - nightflareHealth) / 100;
    const pulseSpeed = 4 + healthFactor * 12 + (hitReaction ? 20 : 0);
    const pulseIntensity = 0.25 + healthFactor * 0.4 + (hitReaction ? 1.0 : 0);
    const pulse = Math.sin(t * pulseSpeed) * pulseIntensity + 1.0;

    // Play pulse sound periodically
    if (t - lastPulseTime > 2.0) {
      soundEffects.nightflarePulse();
      setLastPulseTime(t);
    }

    if (meshRef.current) {
      // Stutter/Dim effect during hit
      const flickerScale = hitReaction ? (Math.random() > 0.5 ? 0.6 : 1.4) : 1.0;
      meshRef.current.scale.setScalar(1.4 * pulse * flickerScale); // Increased from 1.3

      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (hitReaction) {
            const flickerIntensity = Math.random() > 0.3 ? 1.0 : 0.1;
            mat.emissive.set(Math.random() > 0.5 ? "#ff0000" : "#ffae00");
            mat.emissiveIntensity = 100 * flickerIntensity * (1 - timeSinceHit / hitDuration); // Increased from 80
          } else {
            const isCore = child.name === 'core';
            mat.emissive.set(isCore ? "#ffae00" : "#ffee00");
            mat.emissiveIntensity = (isCore ? 10 : 8) + Math.sin(t * 12) * 3.5; // Increased from 7/5
          }
        }
      });
    }

    if (lightRef.current) {
      const flicker = Math.sin(t * 35) * 1.5; // Increased flicker
      if (hitReaction) {
        lightRef.current.intensity = (Math.random() > 0.6 ? 0 : 60); // Increased from 50
        lightRef.current.color.set("#ff4400");
      } else {
        lightRef.current.intensity = (20 + flicker) * (nightflareHealth / 100) * pulse; // Increased from 15
        lightRef.current.color.set("#ffae00");
      }
    }

    if (groundRingRef.current) {
      groundRingRef.current.rotation.z = t * (0.5 + healthFactor * 2.5);
      const mat = groundRingRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (8 + Math.sin(t * 7) * 4) * (hitReaction ? 0.15 : 1.0); // Increased from 5/3
    }

    if (flameRingRef.current) {
      flameRingRef.current.rotation.y = -t * 2;
      flameRingRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
      const mat = flameRingRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 15 + Math.sin(t * 5) * 5;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * (3 + healthFactor * 6);
      coreRef.current.rotation.x = t * (2 + healthFactor * 5);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pedestal Base - Enhanced */}
      <mesh receiveShadow castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.4, 3.2, 0.8, 8]} />
        <meshStandardMaterial color="#0a0a0a" flatShading metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[1.9, 2.1, 0.6, 8]} />
        <meshStandardMaterial
          color="#151515"
          flatShading
          metalness={0.98}
          emissive="#ff6600"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Rune Glow Ring - Brighter */}
      <mesh ref={groundRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[4.4, 5.2, 32]} />
        <meshStandardMaterial
          color="#ffae00"
          emissive="#ffae00"
          emissiveIntensity={12} // Increased from 8
          transparent
          opacity={0.85} // Increased from 0.75
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Flame Ring - NEW */}
      <mesh ref={flameRingRef} position={[0, 2.6, 0]}>
        <torusGeometry args={[2.5, 0.3, 16, 32]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff9900"
          emissiveIntensity={15}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Main Core Geometry - Enhanced */}
      <Float speed={8} rotationIntensity={3} floatIntensity={2.5}>
        <group ref={meshRef} position={[0, 2.6, 0]}>
          {/* Core Crystal */}
          <mesh ref={coreRef} name="core">
            <octahedronGeometry args={[1.5]} /> {/* Increased from 1.35 */}
            <meshStandardMaterial
              color="#ff3300"
              emissive="#ffae00"
              emissiveIntensity={15} // Increased from 12
              flatShading
            />
          </mesh>

          {/* Inner Glow */}
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[1.3]} /> {/* Increased from 1.15 */}
            <meshStandardMaterial
              color="#ffaa00"
              emissive="#ffee00"
              emissiveIntensity={12} // Increased from 8
              flatShading
            />
          </mesh>

          {/* Energy Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.0, 0.18, 16, 64]} /> {/* Increased from 1.9/0.15 */}
            <meshStandardMaterial
              color="#ff9900"
              emissive="#ffae00"
              emissiveIntensity={30} // Increased from 25
            />
          </mesh>

          {/* Additional Vertical Ring - NEW */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[2.0, 0.18, 16, 64]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff9900"
              emissiveIntensity={30}
            />
          </mesh>
        </group>
      </Float>

      {/* Enhanced Point Light */}
      <pointLight
        ref={lightRef}
        position={[0, 4.8, 0]}
        intensity={20} // Increased from 15
        distance={55} // Increased from 45
        color="#ffae00"
        castShadow
      />

      {/* Additional Ambient Glow */}
      <pointLight
        position={[0, 2.6, 0]}
        intensity={10}
        distance={30}
        color="#ff6600"
      />

      {/* More Embers - Increased from 65 to 100 */}
      {[...Array(100)].map((_, i) => (
        <Ember key={i} index={i} />
      ))}
    </group>
  );
};

const Ember: React.FC<{ index: number }> = ({ index }) => {
  const ref = useRef<THREE.Mesh>(null);
  const initialPos = [(Math.random() - 0.5) * 6, 1.5 + Math.random() * 6, (Math.random() - 0.5) * 6];

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + index * 13.5;
    if (ref.current) {
      // Chaotic upward spiral
      ref.current.position.y = 1.8 + (t % 8.5); // Increased from 7.5
      const angle = t * (0.8 + (index % 3) * 0.2);
      const radius = 1.8 + Math.sin(t * 1.5) * 0.6; // Increased from 1.6/0.5

      ref.current.position.x = Math.sin(angle) * radius;
      ref.current.position.z = Math.cos(angle) * radius;

      ref.current.rotation.x = t * 2;
      ref.current.rotation.y = t * 3;

      const life = (t % 8.5) / 8.5;
      ref.current.scale.setScalar(Math.max(0, (1 - life) * 4.5 * (Math.random() * 0.5 + 0.5))); // Increased from 3.5/4.5
    }
  });

  return (
    <mesh ref={ref} position={initialPos as any}>
      <octahedronGeometry args={[0.12, 0]} /> {/* Increased from 0.08 */}
      <meshStandardMaterial
        color="#ff9100"
        emissive="#ffdd00"
        emissiveIntensity={40} // Increased from 30
        transparent
        opacity={0.9} // Increased from 0.8
      />
    </mesh>
  );
};

export default Nightflare;
