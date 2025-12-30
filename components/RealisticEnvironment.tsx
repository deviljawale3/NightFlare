import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { IslandTheme } from '../types';

/**
 * Realistic Environment Elements
 * Enhanced trees, rocks, and natural elements with proper textures and details
 */

// REALISTIC TREE
export const RealisticTree: React.FC<{ position: [number, number, number]; theme: IslandTheme; seed: number }> = ({ position, theme, seed }) => {
    const crownRef = useRef<THREE.Group>(null);
    const treeHeight = 4 + Math.random() * 2;
    const trunkRadius = 0.3 + Math.random() * 0.2;
    const crownSize = 2 + Math.random() * 1;

    const getTreeColors = () => {
        switch (theme) {
            case IslandTheme.DESERT: return { bark: '#854d0e', barkDark: '#452205', leaves: '#a16207', leavesLight: '#eab308' };
            case IslandTheme.VOLCANO: return { bark: '#1a0a00', barkDark: '#000000', leaves: '#7c2d12', leavesLight: '#f97316' };
            case IslandTheme.ARCTIC: return { bark: '#475569', barkDark: '#1e293b', leaves: '#94a3b8', leavesLight: '#f1f5f9' };
            case IslandTheme.VOID: return { bark: '#1e1b4b', barkDark: '#020617', leaves: '#4c1d95', leavesLight: '#a855f7' };
            case IslandTheme.CELESTIAL: return { bark: '#164e63', barkDark: '#083344', leaves: '#0e7490', leavesLight: '#00f2ff' };
            case IslandTheme.CRYSTAL: return { bark: '#701a75', barkDark: '#4a044e', leaves: '#d946ef', leavesLight: '#f0abfc' };
            case IslandTheme.CORRUPTION: return { bark: '#365314', barkDark: '#1a2e05', leaves: '#4d7c0f', leavesLight: '#84cc16' };
            case IslandTheme.ABYSS: return { bark: '#1e1b4b', barkDark: '#020617', leaves: '#312e81', leavesLight: '#4338ca' };
            case IslandTheme.ETERNAL_SHADOW: return { bark: '#000', barkDark: '#000', leaves: '#1e293b', leavesLight: '#ffffff' };
            default: return { bark: '#4a3520', barkDark: '#2a1a10', leaves: '#2d5016', leavesLight: '#4a7c2a' };
        }
    };

    const colors = getTreeColors();

    useFrame((state) => {
        if (crownRef.current) {
            const t = state.clock.getElapsedTime();
            crownRef.current.rotation.z = Math.sin(t * 0.5 + seed * 10) * 0.05;
            crownRef.current.rotation.x = Math.cos(t * 0.3 + seed * 5) * 0.03;
        }
    });

    return (
        <group position={position}>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, treeHeight, 8]} />
                <meshStandardMaterial color={colors.bark} roughness={0.95} />
            </mesh>
            <group position={[0, treeHeight * 0.6, 0]} ref={crownRef}>
                <mesh castShadow receiveShadow>
                    <coneGeometry args={[crownSize * 1.2, crownSize * 1.5, 8]} />
                    <meshStandardMaterial color={colors.leaves} roughness={0.9} flatShading />
                </mesh>
                <mesh position={[0, crownSize * 0.8, 0]} castShadow receiveShadow>
                    <coneGeometry args={[crownSize, crownSize * 1.2, 8]} />
                    <meshStandardMaterial color={colors.leavesLight} roughness={0.9} flatShading />
                </mesh>
            </group>
        </group>
    );
};

// REALISTIC ROCK
export const RealisticRock: React.FC<{ position: [number, number, number]; theme: IslandTheme; seed: number }> = ({ position, theme, seed }) => {
    const rockSize = 1.5 + Math.random() * 1.5;
    const getRockColors = () => {
        switch (theme) {
            case IslandTheme.DESERT: return { base: '#d97706', dark: '#78350f' };
            case IslandTheme.VOLCANO: return { base: '#3a2a2a', dark: '#1a0a0a' };
            case IslandTheme.ARCTIC: return { base: '#c0d0e0', dark: '#8090a0' };
            case IslandTheme.VOID: return { base: '#4338ca', dark: '#1e1b4b' };
            case IslandTheme.CRYSTAL: return { base: '#f0abfc', dark: '#701a75' };
            default: return { base: '#5a5a4a', dark: '#3a3a2a' };
        }
    };
    const colors = getRockColors();
    return (
        <group position={position}>
            <mesh castShadow receiveShadow rotation={[Math.random(), Math.random(), Math.random()]}>
                <dodecahedronGeometry args={[rockSize, 0]} />
                <meshStandardMaterial color={colors.base} roughness={0.9} flatShading />
            </mesh>
        </group>
    );
};

// REALISTIC GRASS
export const RealisticGrass: React.FC<{ position: [number, number, number]; theme: IslandTheme }> = ({ position, theme }) => {
    const groupRef = useRef<THREE.Group>(null);
    const _pos = useMemo(() => new THREE.Vector3(...position), [position]);
    const color = theme === IslandTheme.ARCTIC ? '#d0e0f0' : (theme === IslandTheme.VOLCANO ? '#4a3a2a' : '#3a5a2a');

    useFrame((state) => {
        if (!groupRef.current) return;
        const playerPos = (window as any).playerPos || new THREE.Vector3(999, 999, 999);
        const dist = playerPos.distanceTo(_pos);
        const t = state.clock.getElapsedTime();
        const wind = Math.sin(t * 2 + position[0] * 0.5) * 0.15;

        if (dist < 2.5) {
            const push = (2.5 - dist) * 0.4;
            groupRef.current.rotation.x = wind + push;
        } else {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, wind, 0.1);
        }
    });

    return (
        <group position={position} ref={groupRef}>
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 0.5, 0.15, (Math.random() - 0.5) * 0.5]} rotation={[0, Math.random() * Math.PI, 0]}>
                    <boxGeometry args={[0.03, 0.4, 0.01]} />
                    <meshStandardMaterial color={color} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

// REALISTIC BUSH
export const RealisticBush: React.FC<{ position: [number, number, number]; theme: IslandTheme }> = ({ position, theme }) => {
    const color = theme === IslandTheme.ARCTIC ? '#5a7a8a' : (theme === IslandTheme.VOLCANO ? '#4a2a1a' : '#2a4a1a');
    return (
        <group position={position}>
            <mesh castShadow>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
        </group>
    );
};

export default { RealisticTree, RealisticRock, RealisticGrass, RealisticBush };
