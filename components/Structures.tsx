
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { Structure } from '../types';

const Structures: React.FC = () => {
  const structures = useGameStore(s => s.structures);
  return (
    <group>
      {structures.map(s => (
        <StructureItem key={s.id} data={s} />
      ))}
    </group>
  );
};

const StructureItem: React.FC<{ data: Structure }> = ({ data }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useThree();
  const lastFireTime = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (data.type === 'WALL') {
      meshRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.04;
    }

    if (data.type === 'PYLON' || data.type === 'SENTRY_TURRET' || data.type === 'PRISM_TOWER') {
      meshRef.current.rotation.y = t * (data.type === 'SENTRY_TURRET' ? 4 : 2.5);

      const fireRate = data.type === 'SENTRY_TURRET' ? 0.2 : (data.type === 'PRISM_TOWER' ? 1.5 : 1.2);
      const range = data.type === 'PRISM_TOWER' ? 22 : 18;

      if (t - lastFireTime.current > fireRate) {
        let nearestEnemy: THREE.Object3D | null = null;
        let minDist = range;

        scene.traverse(obj => {
          if ((obj as any).isEnemyHeuristic && obj.position.distanceTo(meshRef.current!.position) < minDist) {
            nearestEnemy = obj;
            minDist = obj.position.distanceTo(meshRef.current!.position);
          }
        });

        if (nearestEnemy) {
          lastFireTime.current = t;
          window.dispatchEvent(new CustomEvent('pylon-fire', {
            detail: {
              from: data.position,
              to: (nearestEnemy as THREE.Object3D).position.toArray(),
              type: data.type
            }
          }));
        }
      }
    }
  });

  return (
    <group ref={meshRef} position={data.position as any}>
      {data.type === 'WALL' && (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 2.8, 1.0]} />
            <meshStandardMaterial color="#121212" emissive="#ff6600" emissiveIntensity={0.15} flatShading />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[1.9, 0.25, 1.1]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={8} />
          </mesh>
        </group>
      )}

      {data.type === 'PYLON' && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.6, 3.5, 6]} />
            <meshStandardMaterial color="#2c3e50" metalness={1} />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <octahedronGeometry args={[0.7]} />
            <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={15} />
          </mesh>
          <pointLight position={[0, 2.2, 0]} color="#00f2ff" intensity={10} distance={12} />
        </group>
      )}

      {data.type === 'SENTRY_TURRET' && (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.4, 1.5, 3]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <group position={[0, 1.5, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.5, 1.2]} />
              <meshStandardMaterial color="#444" metalness={0.8} />
            </mesh>
            <mesh position={[0.2, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.5]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[-0.2, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.5]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>
      )}

      {data.type === 'PRISM_TOWER' && (
        <group>
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[0.6, 4, 4]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} emissive="#ff00ff" emissiveIntensity={4} />
          </mesh>
          <pointLight position={[0, 3, 0]} color="#ff00ff" intensity={6} />
        </group>
      )}

      {data.type === 'STASIS_TRAP' && (
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} transparent opacity={0.4} />
          <gridHelper args={[3, 4]} position={[0, 0.06, 0]} />
        </mesh>
      )}

      {/* Health Bar */}
      <mesh position={[0, 4.0, 0]}>
        <planeGeometry args={[2.0 * (data.health / data.maxHealth), 0.15]} />
        <meshBasicMaterial color={data.type === 'WALL' ? "#ff6600" : "#00f2ff"} />
      </mesh>
    </group>
  );
};

export default Structures;
