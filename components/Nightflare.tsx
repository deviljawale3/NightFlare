
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

const Nightflare: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groundRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const nightflareHealth = useGameStore(state => state.nightflareHealth);
  const [flickerTime, setFlickerTime] = useState(0);

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

    if (meshRef.current) {
      // Stutter/Dim effect during hit
      const flickerScale = hitReaction ? (Math.random() > 0.5 ? 0.6 : 1.4) : 1.0;
      meshRef.current.scale.setScalar(1.3 * pulse * flickerScale);

      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (hitReaction) {
            const flickerIntensity = Math.random() > 0.3 ? 1.0 : 0.1;
            mat.emissive.set(Math.random() > 0.5 ? "#ff0000" : "#ffae00");
            mat.emissiveIntensity = 80 * flickerIntensity * (1 - timeSinceHit / hitDuration);
          } else {
            const isCore = child.name === 'core';
            mat.emissive.set(isCore ? "#ffae00" : "#ffee00");
            mat.emissiveIntensity = (isCore ? 7 : 5) + Math.sin(t * 12) * 2.5;
          }
        }
      });
    }

    if (lightRef.current) {
      const flicker = Math.sin(t * 35) * 1.0;
      if (hitReaction) {
        lightRef.current.intensity = (Math.random() > 0.6 ? 0 : 50);
        lightRef.current.color.set("#ff4400");
      } else {
        lightRef.current.intensity = (15 + flicker) * (nightflareHealth / 100) * pulse;
        lightRef.current.color.set("#ffae00");
      }
    }

    if (groundRingRef.current) {
      groundRingRef.current.rotation.z = t * (0.5 + healthFactor * 2.5);
      const mat = groundRingRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (5 + Math.sin(t * 7) * 3) * (hitReaction ? 0.15 : 1.0);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * (3 + healthFactor * 6);
      coreRef.current.rotation.x = t * (2 + healthFactor * 5);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pedestal Base */}
      <mesh receiveShadow castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.4, 3.2, 0.8, 8]} />
        <meshStandardMaterial color="#080808" flatShading metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[1.9, 2.1, 0.6, 8]} />
        <meshStandardMaterial color="#111111" flatShading metalness={0.95} />
      </mesh>

      {/* Rune Glow Ring */}
      <mesh ref={groundRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[4.4, 5.2, 32]} />
        <meshStandardMaterial color="#ffae00" emissive="#ffae00" emissiveIntensity={8} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Main Core Geometry */}
      <Float speed={8} rotationIntensity={3} floatIntensity={2}>
        <group ref={meshRef} position={[0, 2.6, 0]}>
          <mesh ref={coreRef} name="core">
            <octahedronGeometry args={[1.35]} />
            <meshStandardMaterial color="#ff3300" emissive="#ffae00" emissiveIntensity={12} flatShading />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[1.15]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffee00" emissiveIntensity={8} flatShading />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.9, 0.15, 16, 64]} />
            <meshStandardMaterial color="#ff9900" emissive="#ffae00" emissiveIntensity={25} />
          </mesh>
        </group>
      </Float>

      <pointLight ref={lightRef} position={[0, 4.8, 0]} intensity={15} distance={45} color="#ffae00" castShadow />

      {[...Array(65)].map((_, i) => (
        <Ember key={i} index={i} />
      ))}
    </group>
  );
};

const Ember: React.FC<{ index: number }> = ({ index }) => {
  const ref = useRef<THREE.Mesh>(null);
  const initialPos = [(Math.random() - 0.5) * 5, 1.5 + Math.random() * 5, (Math.random() - 0.5) * 5];

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + index * 13.5;
    if (ref.current) {
      // Chaotic upward spiral
      ref.current.position.y = 1.8 + (t % 7.5);
      const angle = t * (0.8 + (index % 3) * 0.2);
      const radius = 1.6 + Math.sin(t * 1.5) * 0.5;

      ref.current.position.x = Math.sin(angle) * radius;
      ref.current.position.z = Math.cos(angle) * radius;

      ref.current.rotation.x = t * 2;
      ref.current.rotation.y = t * 3;

      const life = (t % 7.5) / 7.5;
      ref.current.scale.setScalar(Math.max(0, (1 - life) * 3.5 * (Math.random() * 0.5 + 0.5)));
    }
  });

  return (
    <mesh ref={ref} position={initialPos as any}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color="#ff9100" emissive="#ffdd00" emissiveIntensity={30} transparent opacity={0.8} />
    </mesh>
  );
};

export default Nightflare;
