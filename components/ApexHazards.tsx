
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme, GameState } from '../types';

const HazardEffect = ({ theme, index }: { theme: IslandTheme, index: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { damagePlayer, isTimeSlowed } = useGameStore();
    const seed = useMemo(() => Math.random(), []);

    // Random position on the island (radius 5 to 20)
    const position = useMemo(() => {
        const angle = (index / 10) * Math.PI * 2 + seed;
        const radius = 8 + Math.random() * 12;
        return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }, [index, seed]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        const slowMult = isTimeSlowed ? 0.2 : 1.0;

        // Movement & Interaction based on theme
        if (theme === IslandTheme.DESERT) {
            // Sand Whirlwind
            meshRef.current.position.x = position.x + Math.sin(t * 0.5 + seed) * 3;
            meshRef.current.position.z = position.z + Math.cos(t * 0.5 + seed) * 3;
            meshRef.current.rotation.y += 0.1 * slowMult;
        } else if (theme === IslandTheme.VOLCANO) {
            // Lava Fissure Pulse
            const scale = 1 + Math.sin(t * 2 + seed * 10) * 0.5;
            meshRef.current.scale.set(scale, 0.1, scale);
        } else if (theme === IslandTheme.VOID || theme === IslandTheme.ABYSS) {
            // Gravity Well / Void Miasma
            const scale = 2 + Math.sin(t * slowMult) * 1.5;
            meshRef.current.scale.set(scale, scale, scale);
            meshRef.current.rotation.y += 0.02;
        } else if (theme === IslandTheme.ARCTIC) {
            // Blizzard Swirl
            meshRef.current.position.y = 1 + Math.sin(t + seed * 5) * 0.5;
            meshRef.current.rotation.z += 0.05;
        }

        // Player Collision Check
        const playerPos = (window as any).playerPos || new THREE.Vector3(0, 0, 0);
        const dist = meshRef.current.position.distanceTo(playerPos);

        if (dist < 2.5) {
            damagePlayer(1.5); // Constant chip damage
        }
    });

    if (theme === IslandTheme.DESERT) {
        return (
            <mesh ref={meshRef} position={position}>
                <cylinderGeometry args={[1, 0.2, 4, 8]} />
                <meshStandardMaterial color="#edc9af" transparent opacity={0.4} emissive="#ffaa00" emissiveIntensity={0.5} />
            </mesh>
        );
    }

    if (theme === IslandTheme.VOLCANO) {
        return (
            <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshStandardMaterial color="#ff4400" emissive="#ff0000" emissiveIntensity={5} transparent opacity={0.7} />
            </mesh>
        );
    }

    if (theme === IslandTheme.VOID) {
        return (
            <mesh ref={meshRef} position={[position.x, 1, position.z]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#4400ff" emissive="#7700ff" emissiveIntensity={10} wireframe />
            </mesh>
        );
    }

    if (theme === IslandTheme.ABYSS) {
        return (
            <mesh ref={meshRef} position={[position.x, 1, position.z]}>
                <torusKnotGeometry args={[0.5, 0.2, 64, 8]} />
                <meshStandardMaterial color="#000000" emissive="#110022" emissiveIntensity={2} />
            </mesh>
        );
    }

    if (theme === IslandTheme.ARCTIC) {
        return (
            <mesh ref={meshRef} position={[position.x, 2, position.z]}>
                <dodecahedronGeometry args={[0.3]} />
                <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={5} transparent opacity={0.8} />
                <pointLight color="#00ffff" intensity={2} distance={5} />
            </mesh>
        );
    }

    return null;
};

const ArcticEnforcement = () => {
    const { islandTheme, playerStats, updateTemperature } = useGameStore();

    useFrame((state, delta) => {
        if (islandTheme !== IslandTheme.ARCTIC) return;

        const playerPos = (window as any).playerPos || new THREE.Vector3();
        const distToCore = playerPos.length();
        const isNearHeat = distToCore < 12;

        if (isNearHeat) {
            updateTemperature(delta * 12);
        } else {
            updateTemperature(-delta * 2.5);
        }

        if (playerStats.temperature <= 0) {
            if (Math.floor(state.clock.elapsedTime * 2) % 10 === 0 && Math.random() < 0.05) {
                useGameStore.getState().damagePlayer(0.5);
            }
        }
    });

    return null;
};

export const ApexHazards: React.FC = () => {
    const { islandTheme, gameState, level } = useGameStore();

    // Hazards start appearing more after level 10
    const hazardCount = Math.min(12, Math.floor(level / 5) + 3);

    if (gameState !== GameState.PLAYING) return null;

    return (
        <group>
            <ArcticEnforcement />
            {Array.from({ length: hazardCount }).map((_, i) => (
                <HazardEffect key={`hazard-${i}`} theme={islandTheme} index={i} />
            ))}
        </group>
    );
};
