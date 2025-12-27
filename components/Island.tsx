
import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';

const Island: React.FC = () => {
  const islandTheme = useGameStore(s => s.islandTheme);

  const getColors = () => {
    switch(islandTheme) {
        case IslandTheme.VOLCANO: return { top: '#420a0a', bottom: '#1a0505', detail: '#f97316', plant: '#7c2d12' };
        case IslandTheme.ARCTIC: return { top: '#e2e8f0', bottom: '#1e293b', detail: '#94a3b8', plant: '#ffffff' };
        default: return { top: '#3a5a40', bottom: '#4a4e69', detail: '#6b705c', plant: '#588157' };
    }
  };

  const colors = getColors();

  return (
    <group>
      {/* Main Top Surface */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 8]} />
        <meshStandardMaterial color={colors.top} flatShading roughness={0.8} />
      </mesh>

      {/* Rocky Bottom */}
      <mesh receiveShadow position={[0, -4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[22, 9, 8]} />
        <meshStandardMaterial color={colors.bottom} flatShading roughness={1} />
      </mesh>

      {/* Side Details / Small Rocks at edges */}
      {[...Array(14)].map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const radius = 20 + Math.random() * 4;
        return (
          <mesh 
            key={i} 
            position={[Math.cos(angle) * radius, -0.2, Math.sin(angle) * radius]} 
            rotation={[Math.random(), Math.random(), Math.random()]}
            castShadow
          >
            <dodecahedronGeometry args={[1 + Math.random() * 2, 0]} />
            <meshStandardMaterial color={colors.detail} flatShading />
          </mesh>
        );
      })}

      {/* Decorative Grassy Tufts / Ice Spikes / Lava Rocks */}
      {[...Array(50)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 20;
        return (
          <mesh 
            key={`grass-${i}`} 
            position={[Math.cos(angle) * radius, -0.4, Math.sin(angle) * radius]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[0.2, islandTheme === IslandTheme.ARCTIC ? 1.5 : 0.8, 3]} />
            <meshStandardMaterial color={colors.plant} emissive={islandTheme === IslandTheme.VOLCANO ? colors.detail : 'black'} emissiveIntensity={0.4} flatShading />
          </mesh>
        );
      })}

      {islandTheme === IslandTheme.VOLCANO && (
          <group>
              <pointLight position={[0, 2, 0]} intensity={1} color="orange" distance={50} />
              {[...Array(5)].map((_, i) => {
                  const angle = (i / 5) * Math.PI * 2;
                  return (
                      <pointLight key={i} position={[Math.cos(angle)*15, 1, Math.sin(angle)*15]} intensity={5} color="red" distance={10} />
                  );
              })}
          </group>
      )}
    </group>
  );
};

export default Island;
