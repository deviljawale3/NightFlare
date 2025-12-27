
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Trophy: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const cupRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.015;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={1.5}>
      {/* Base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.4, 6]} />
        <meshStandardMaterial color="#332200" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 6]} />
        <meshStandardMaterial color="#ffcc00" metalness={1} roughness={0.1} />
      </mesh>
      {/* Cup Bowl */}
      <mesh ref={cupRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.9, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} metalness={1} roughness={0.1} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.9, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.4, 0.1, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#ffaa00" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0.9, 0.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[0.4, 0.1, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#ffaa00" metalness={1} roughness={0.1} />
      </mesh>
      {/* Glow */}
      <pointLight intensity={20} distance={10} color="#ffaa00" />
    </group>
  );
};

export default Trophy;
