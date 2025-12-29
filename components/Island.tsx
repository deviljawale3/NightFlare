
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';
import { RealisticTree, RealisticRock, RealisticGrass, RealisticBush } from './RealisticEnvironment';

const Island: React.FC = () => {
  const islandTheme = useGameStore(s => s.islandTheme);

  const getColors = () => {
    switch (islandTheme) {
      case IslandTheme.VOLCANO: return { top: '#1a0505', bottom: '#0a0202', detail: '#f97316', secondary: '#7c2d12' };
      case IslandTheme.ARCTIC: return { top: '#f8fafc', bottom: '#1e293b', detail: '#cbd5e1', secondary: '#94a3b8' };
      default: return { top: '#1a2e20', bottom: '#2a1a10', detail: '#3a5a40', secondary: '#4a3a2a' };
    }
  };

  const colors = getColors();

  // Generate static positions for elements once to prevent jitter
  const elements = useMemo(() => {
    const trees = [...Array(12)].map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 35,
        0,
        (Math.random() - 0.5) * 35
      ] as [number, number, number],
      seed: Math.random()
    })).filter(t => Math.sqrt(t.position[0] ** 2 + t.position[2] ** 2) < 20);

    const rocks = [...Array(20)].map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 45,
        0,
        (Math.random() - 0.5) * 45
      ] as [number, number, number],
      seed: Math.random()
    })).filter(r => Math.sqrt(r.position[0] ** 2 + r.position[2] ** 2) < 22);

    const foliage = [...Array(60)].map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        0,
        (Math.random() - 0.5) * 40
      ] as [number, number, number],
      type: Math.random() > 0.6 ? 'grass' : 'bush'
    })).filter(f => Math.sqrt(f.position[0] ** 2 + f.position[2] ** 2) < 21);

    return { trees, rocks, foliage };
  }, [islandTheme]);

  return (
    <group>
      {/* Main Top Surface - High Fidelity Tactical Terrain */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 128]} />
        <meshStandardMaterial
          color={colors.top}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Surface Texture: Subtle Ground Detail */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22.5, 64]} />
        <meshStandardMaterial
          color={colors.detail}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Deep Rocky Base */}
      <mesh receiveShadow position={[0, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[22, 12, 16]} />
        <meshStandardMaterial
          color={colors.bottom}
          roughness={1}
          flatShading
        />
      </mesh>

      {/* Edge Details: Realistic Rocks */}
      {elements.rocks.map((rock, i) => (
        <RealisticRock
          key={`rock-${i}`}
          position={rock.position}
          theme={islandTheme}
          seed={rock.seed}
        />
      ))}

      {/* Realistic Trees */}
      {elements.trees.map((tree, i) => (
        <RealisticTree
          key={`tree-${i}`}
          position={tree.position}
          theme={islandTheme}
          seed={tree.seed}
        />
      ))}

      {/* Realistic Foliage */}
      {elements.foliage.map((item, i) => (
        item.type === 'grass' ? (
          <RealisticGrass
            key={`fol-${i}`}
            position={item.position}
            theme={islandTheme}
          />
        ) : (
          <RealisticBush
            key={`fol-${i}`}
            position={item.position}
            theme={islandTheme}
          />
        )
      ))}

      {/* Environment Lighting based on Theme */}
      {islandTheme === IslandTheme.VOLCANO && (
        <group>
          <pointLight position={[0, 4, 0]} intensity={2} color="#ff4400" distance={60} />
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <pointLight
                key={i}
                position={[Math.cos(angle) * 18, 1, Math.sin(angle) * 18]}
                intensity={4}
                color="#ff2200"
                distance={15}
              />
            );
          })}
        </group>
      )}

      {islandTheme === IslandTheme.ARCTIC && (
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#cbd5e1" distance={100} />
      )}
    </group>
  );
};

export default Island;
