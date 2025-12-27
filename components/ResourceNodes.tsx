
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { ResourceNode, GameState, TimeOfDay } from '../types';

const ResourceNodes: React.FC = () => {
  const { addResource, wave, gameState, nodes, setNodes, removeNode, timeOfDay, settings } = useGameStore();
  const lastRespawnCheck = useRef(0);

  useEffect(() => {
    const newNodes: ResourceNode[] = [];
    const types: ResourceNode['type'][] = ['TREE', 'ROCK', 'CRYSTAL', 'FOOD'];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 16; 
      const type = types[Math.floor(Math.random() * types.length)];
      
      newNodes.push({
        id: `node-${wave}-${i}-${Math.random()}`,
        type,
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        health: 1
      });
    }
    setNodes(newNodes);
  }, [wave, setNodes]);

  useFrame((state) => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;
    
    const t = state.clock.getElapsedTime();
    if (t - lastRespawnCheck.current > 6) {
      lastRespawnCheck.current = t;
      const currentNodes = useGameStore.getState().nodes;
      const minNodes = timeOfDay === TimeOfDay.DAY ? 60 : 40;
      
      if (currentNodes.length < minNodes) {
        const count = 8;
        const types: ResourceNode['type'][] = ['TREE', 'ROCK', 'CRYSTAL', 'FOOD'];
        const respawned = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 15;
            const type = types[Math.floor(Math.random() * types.length)];
            respawned.push({
              id: `node-resp-${t}-${i}`,
              type,
              position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
              health: 1
            });
        }
        setNodes([...currentNodes, ...respawned]);
      }
    }
  });

  useEffect(() => {
    const handleHarvestEvent = (e: any) => {
      const { position, range } = e.detail;
      const hitPos = position as THREE.Vector3;
      
      const currentNodes = useGameStore.getState().nodes;
      currentNodes.forEach(node => {
        const nodePos = new THREE.Vector3(...node.position);
        if (nodePos.distanceTo(hitPos) < range) {
          handleHarvest(node.id, node.type, node.position);
        }
      });
    };

    window.addEventListener('player-attack-hitbox', handleHarvestEvent);
    return () => window.removeEventListener('player-attack-hitbox', handleHarvestEvent);
  }, [gameState]);

  const handleHarvest = (id: string, type: ResourceNode['type'], pos: [number, number, number]) => {
    const yieldAmount = type === 'CRYSTAL' ? 4 : (type === 'FOOD' ? 6 : 5);
    const resourceMap: Record<string, any> = {
      TREE: 'wood',
      ROCK: 'stone',
      CRYSTAL: 'lightShards',
      FOOD: 'food'
    };
    
    addResource(resourceMap[type], yieldAmount, pos);
    removeNode(id);
    if (settings.vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(30);
  };

  return (
    <group>
      {nodes.map(node => (
        <NodeItem key={node.id} data={node} onHarvest={() => handleHarvest(node.id, node.type, node.position)} />
      ))}
    </group>
  );
};

const NodeItem: React.FC<{ data: ResourceNode; onHarvest: () => void }> = ({ data, onHarvest }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle breathing animation
    meshRef.current.position.y = Math.sin(t * 1.5 + data.position[0]) * 0.15;
    if (data.type === 'CRYSTAL' || data.type === 'FOOD') {
        meshRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={data.position as any} onClick={(e) => { e.stopPropagation(); onHarvest(); }}>
      {data.type === 'TREE' && (
        <group scale={2.2}>
          {/* Trunk */}
          <mesh castShadow position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.25, 0.45, 2.0, 5]} />
            <meshStandardMaterial color="#4e342e" flatShading roughness={1} />
          </mesh>
          {/* Tiered Canopy */}
          <mesh castShadow position={[0, 2.2, 0]}>
            <coneGeometry args={[1.6, 1.8, 5]} />
            <meshStandardMaterial color="#2e7d32" flatShading />
          </mesh>
          <mesh castShadow position={[0, 3.2, 0]}>
            <coneGeometry args={[1.2, 1.5, 5]} />
            <meshStandardMaterial color="#388e3c" flatShading />
          </mesh>
          <mesh castShadow position={[0, 4.0, 0]}>
            <coneGeometry args={[0.7, 1.2, 5]} />
            <meshStandardMaterial color="#4caf50" flatShading />
          </mesh>
        </group>
      )}
      
      {data.type === 'ROCK' && (
        <group scale={2.5}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#78909c" flatShading roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0.4, 0.2, 0.3]} rotation={[0, 1, 0.5]} scale={0.5}>
            <dodecahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#546e7a" flatShading />
          </mesh>
        </group>
      )}

      {data.type === 'CRYSTAL' && (
        <group position={[0, 1.5, 0]} scale={2.2}>
          <mesh castShadow>
            <octahedronGeometry args={[0.65]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00b0ff" emissiveIntensity={40} flatShading />
          </mesh>
          <mesh position={[0, 0, 0]} scale={0.8} rotation={[Math.PI/4, 0, Math.PI/4]}>
            <octahedronGeometry args={[0.65]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={80} transparent opacity={0.4} />
          </mesh>
          <pointLight intensity={12} distance={12} color="#00e5ff" />
        </group>
      )}

      {data.type === 'FOOD' && (
        <group scale={2.2} position={[0, 1.0, 0]}>
          {/* Polished Food Bio-Cube */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#ff5252" emissive="#ff1744" emissiveIntensity={10} flatShading />
          </mesh>
          <mesh scale={0.65} rotation={[Math.PI/2, 0, Math.PI/4]}>
             <boxGeometry args={[0.8, 0.8, 0.8]} />
             <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={60} transparent opacity={0.5} />
          </mesh>
          <pointLight intensity={8} distance={8} color="#ff1744" />
        </group>
      )}
    </group>
  );
};

export default ResourceNodes;
