
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';
import { RealisticTree, RealisticRock, RealisticGrass, RealisticBush } from './RealisticEnvironment';

const Island: React.FC = () => {
  const { islandTheme, level } = useGameStore();

  const getColors = () => {
    // Basic Biome Colors
    let colors: { top: string; bottom: string; detail: string; secondary: string };
    switch (islandTheme) {
      case IslandTheme.DESERT: colors = { top: '#eab308', bottom: '#713f12', detail: '#fde047', secondary: '#854d0e' }; break;
      case IslandTheme.VOLCANO: colors = { top: '#1a0505', bottom: '#0a0202', detail: '#f97316', secondary: '#7c2d12' }; break;
      case IslandTheme.ARCTIC: colors = { top: '#f8fafc', bottom: '#1e293b', detail: '#cbd5e1', secondary: '#94a3b8' }; break;
      case IslandTheme.VOID: colors = { top: '#1e1b4b', bottom: '#020617', detail: '#a855f7', secondary: '#4c1d95' }; break;
      case IslandTheme.CELESTIAL: colors = { top: '#083344', bottom: '#020617', detail: '#00f2ff', secondary: '#164e63' }; break;
      case IslandTheme.CRYSTAL: colors = { top: '#4a044e', bottom: '#000000', detail: '#f0abfc', secondary: '#701a75' }; break;
      case IslandTheme.CORRUPTION: colors = { top: '#1a2e05', bottom: '#020617', detail: '#84cc16', secondary: '#365314' }; break;
      case IslandTheme.ABYSS: colors = { top: '#020617', bottom: '#000000', detail: '#4338ca', secondary: '#1e1b4b' }; break;
      case IslandTheme.ETERNAL_SHADOW: colors = { top: '#000000', bottom: '#000000', detail: '#ffffff', secondary: '#334155' }; break;
      default: colors = { top: '#1a2e20', bottom: '#2a1a10', detail: '#3a5a40', secondary: '#4a3a2a' };
    }

    // Apply "Level Corruption" - Get darker/more purple as level increases
    const corruptionScale = Math.min(0.8, level / 600);
    const colorTop = new THREE.Color(colors.top).lerp(new THREE.Color('#0a0010'), corruptionScale).getStyle();
    const colorBottom = new THREE.Color(colors.bottom).lerp(new THREE.Color('#000000'), corruptionScale).getStyle();

    return { ...colors, top: colorTop, bottom: colorBottom };
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
