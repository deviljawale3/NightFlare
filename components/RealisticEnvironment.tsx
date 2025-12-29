import React from 'react';
import * as THREE from 'three';
import { IslandTheme } from '../types';

/**
 * Realistic Environment Elements
 * Enhanced trees, rocks, and natural elements with proper textures and details
 */

// REALISTIC TREE
export const RealisticTree: React.FC<{ position: [number, number, number]; theme: IslandTheme; seed: number }> = ({ position, theme, seed }) => {
    const treeHeight = 4 + Math.random() * 2;
    const trunkRadius = 0.3 + Math.random() * 0.2;
    const crownSize = 2 + Math.random() * 1;

    // Theme-based colors
    const getTreeColors = () => {
        switch (theme) {
            case IslandTheme.FOREST:
                return {
                    bark: '#4a3520',
                    barkDark: '#2a1a10',
                    leaves: '#2d5016',
                    leavesLight: '#4a7c2a'
                };
            case IslandTheme.VOLCANO:
                return {
                    bark: '#3a2a1a',
                    barkDark: '#1a0a00',
                    leaves: '#5a3a1a',
                    leavesLight: '#7a5a3a'
                };
            case IslandTheme.ARCTIC:
                return {
                    bark: '#5a5a6a',
                    barkDark: '#3a3a4a',
                    leaves: '#1a3a2a',
                    leavesLight: '#2a5a4a'
                };
            default:
                return {
                    bark: '#4a3520',
                    barkDark: '#2a1a10',
                    leaves: '#2d5016',
                    leavesLight: '#4a7c2a'
                };
        }
    };

    const colors = getTreeColors();

    return (
        <group position={position}>
            {/* Tree trunk with bark texture simulation */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, treeHeight, 8]} />
                <meshStandardMaterial
                    color={colors.bark}
                    roughness={0.95}
                    metalness={0}
                />
            </mesh>

            {/* Bark details - vertical grooves */}
            {[0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4].map((angle, i) => (
                <mesh key={i} position={[
                    Math.cos(angle) * trunkRadius * 0.95,
                    treeHeight * 0.3,
                    Math.sin(angle) * trunkRadius * 0.95
                ]} rotation={[0, angle, 0]}>
                    <boxGeometry args={[0.05, treeHeight * 0.8, 0.05]} />
                    <meshStandardMaterial color={colors.barkDark} roughness={1.0} />
                </mesh>
            ))}

            {/* Roots */}
            {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
                <mesh
                    key={`root-${i}`}
                    position={[
                        Math.cos(angle) * trunkRadius * 0.8,
                        -treeHeight * 0.4,
                        Math.sin(angle) * trunkRadius * 0.8
                    ]}
                    rotation={[0.5, angle, 0]}
                    castShadow
                >
                    <cylinderGeometry args={[trunkRadius * 0.4, trunkRadius * 0.6, 0.8, 6]} />
                    <meshStandardMaterial color={colors.barkDark} roughness={0.95} />
                </mesh>
            ))}

            {/* Tree crown - layered foliage */}
            <group position={[0, treeHeight * 0.6, 0]}>
                {/* Bottom layer */}
                <mesh castShadow receiveShadow>
                    <coneGeometry args={[crownSize * 1.2, crownSize * 1.5, 8]} />
                    <meshStandardMaterial
                        color={colors.leaves}
                        roughness={0.9}
                        flatShading
                    />
                </mesh>

                {/* Middle layer */}
                <mesh position={[0, crownSize * 0.8, 0]} castShadow receiveShadow>
                    <coneGeometry args={[crownSize, crownSize * 1.2, 8]} />
                    <meshStandardMaterial
                        color={colors.leavesLight}
                        roughness={0.9}
                        flatShading
                    />
                </mesh>

                {/* Top layer */}
                <mesh position={[0, crownSize * 1.4, 0]} castShadow receiveShadow>
                    <coneGeometry args={[crownSize * 0.7, crownSize * 0.9, 8]} />
                    <meshStandardMaterial
                        color={colors.leaves}
                        roughness={0.9}
                        flatShading
                    />
                </mesh>

                {/* Leaf clusters for detail */}
                {[...Array(6)].map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    const radius = crownSize * 0.8;
                    return (
                        <mesh
                            key={i}
                            position={[
                                Math.cos(angle) * radius,
                                Math.sin(i * 0.5) * crownSize * 0.5,
                                Math.sin(angle) * radius
                            ]}
                            castShadow
                        >
                            <sphereGeometry args={[crownSize * 0.3, 6, 6]} />
                            <meshStandardMaterial
                                color={i % 2 === 0 ? colors.leaves : colors.leavesLight}
                                roughness={0.9}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* Ambient light from tree (subtle) */}
            <pointLight
                position={[0, treeHeight * 0.8, 0]}
                intensity={0.1}
                distance={crownSize * 2}
                color={colors.leavesLight}
            />
        </group>
    );
};

// REALISTIC ROCK
export const RealisticRock: React.FC<{ position: [number, number, number]; theme: IslandTheme; seed: number }> = ({ position, theme, seed }) => {
    const rockSize = 1.5 + Math.random() * 1.5;
    const segments = 6 + Math.floor(Math.random() * 3);

    const getRockColors = () => {
        switch (theme) {
            case IslandTheme.FOREST:
                return {
                    base: '#5a5a4a',
                    dark: '#3a3a2a',
                    moss: '#2a4a1a'
                };
            case IslandTheme.VOLCANO:
                return {
                    base: '#3a2a2a',
                    dark: '#1a0a0a',
                    moss: '#5a2a1a' // Lava cracks
                };
            case IslandTheme.ARCTIC:
                return {
                    base: '#c0d0e0',
                    dark: '#8090a0',
                    moss: '#a0b0c0' // Ice/snow
                };
            default:
                return {
                    base: '#5a5a4a',
                    dark: '#3a3a2a',
                    moss: '#2a4a1a'
                };
        }
    };

    const colors = getRockColors();

    return (
        <group position={position}>
            {/* Main rock body - irregular shape */}
            <mesh castShadow receiveShadow rotation={[Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.3]}>
                <dodecahedronGeometry args={[rockSize, 0]} />
                <meshStandardMaterial
                    color={colors.base}
                    roughness={0.95}
                    metalness={theme === IslandTheme.VOLCANO ? 0.2 : 0}
                    flatShading
                />
            </mesh>

            {/* Rock details - cracks and crevices */}
            {[...Array(4)].map((_, i) => {
                const angle = (i / 4) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * rockSize * 0.7,
                            Math.sin(i) * rockSize * 0.3,
                            Math.sin(angle) * rockSize * 0.7
                        ]}
                        rotation={[Math.random(), angle, Math.random()]}
                        castShadow
                    >
                        <boxGeometry args={[0.1, rockSize * 0.6, 0.1]} />
                        <meshStandardMaterial color={colors.dark} roughness={1.0} />
                    </mesh>
                );
            })}

            {/* Moss/snow patches */}
            {[...Array(3)].map((_, i) => {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                return (
                    <mesh
                        key={`moss-${i}`}
                        position={[
                            Math.cos(angle) * rockSize * 0.8,
                            rockSize * 0.4,
                            Math.sin(angle) * rockSize * 0.8
                        ]}
                        rotation={[Math.random() * 0.5, angle, Math.random() * 0.5]}
                    >
                        <sphereGeometry args={[rockSize * 0.25, 6, 6]} />
                        <meshStandardMaterial
                            color={colors.moss}
                            roughness={theme === IslandTheme.ARCTIC ? 0.3 : 0.9}
                            emissive={theme === IslandTheme.VOLCANO ? colors.moss : '#000000'}
                            emissiveIntensity={theme === IslandTheme.VOLCANO ? 0.3 : 0}
                        />
                    </mesh>
                );
            })}

            {/* Smaller rocks around base */}
            {[...Array(3)].map((_, i) => {
                const angle = (i / 3) * Math.PI * 2;
                const dist = rockSize * 1.2;
                return (
                    <mesh
                        key={`pebble-${i}`}
                        position={[
                            Math.cos(angle) * dist,
                            -rockSize * 0.3,
                            Math.sin(angle) * dist
                        ]}
                        rotation={[Math.random(), Math.random() * Math.PI, Math.random()]}
                        castShadow
                        receiveShadow
                    >
                        <dodecahedronGeometry args={[rockSize * 0.3, 0]} />
                        <meshStandardMaterial color={colors.dark} roughness={0.95} flatShading />
                    </mesh>
                );
            })}

            {/* Lava glow for volcano theme */}
            {theme === IslandTheme.VOLCANO && (
                <pointLight
                    position={[0, rockSize * 0.5, 0]}
                    intensity={0.5}
                    distance={rockSize * 3}
                    color="#ff4400"
                />
            )}
        </group>
    );
};

// REALISTIC GRASS PATCH
export const RealisticGrass: React.FC<{ position: [number, number, number]; theme: IslandTheme }> = ({ position, theme }) => {
    const getGrassColor = () => {
        switch (theme) {
            case IslandTheme.FOREST:
                return '#3a5a2a';
            case IslandTheme.VOLCANO:
                return '#4a3a2a';
            case IslandTheme.ARCTIC:
                return '#d0e0f0'; // Snow
            default:
                return '#3a5a2a';
        }
    };

    const color = getGrassColor();

    return (
        <group position={position}>
            {/* Grass blades */}
            {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 0.3 + Math.random() * 0.2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            0.15,
                            Math.sin(angle) * radius
                        ]}
                        rotation={[Math.random() * 0.3, angle, 0]}
                    >
                        <boxGeometry args={[0.02, 0.3, 0.01]} />
                        <meshStandardMaterial
                            color={color}
                            roughness={0.9}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};

// REALISTIC BUSH
export const RealisticBush: React.FC<{ position: [number, number, number]; theme: IslandTheme }> = ({ position, theme }) => {
    const getBushColor = () => {
        switch (theme) {
            case IslandTheme.FOREST:
                return { main: '#2a4a1a', light: '#3a6a2a' };
            case IslandTheme.VOLCANO:
                return { main: '#4a2a1a', light: '#6a4a2a' };
            case IslandTheme.ARCTIC:
                return { main: '#5a7a8a', light: '#7a9aaa' };
            default:
                return { main: '#2a4a1a', light: '#3a6a2a' };
        }
    };

    const colors = getBushColor();

    return (
        <group position={position}>
            {/* Bush clusters */}
            {[...Array(5)].map((_, i) => {
                const angle = (i / 5) * Math.PI * 2;
                const radius = 0.3;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            0.3 + Math.random() * 0.2,
                            Math.sin(angle) * radius
                        ]}
                        castShadow
                    >
                        <sphereGeometry args={[0.25 + Math.random() * 0.15, 6, 6]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? colors.main : colors.light}
                            roughness={0.9}
                        />
                    </mesh>
                );
            })}

            {/* Center cluster */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.35, 6, 6]} />
                <meshStandardMaterial color={colors.main} roughness={0.9} />
            </mesh>
        </group>
    );
};

export default {
    RealisticTree,
    RealisticRock,
    RealisticGrass,
    RealisticBush
};
