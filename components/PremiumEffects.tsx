import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium Visual Effects for Combat and Interactions
 * Provides cinematic, high-quality visual feedback
 */

// Impact Burst Effect (for attacks)
export const ImpactBurst: React.FC<{ position: [number, number, number]; intensity?: number }> = ({ position, intensity = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!groupRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 0.6);

        // Expand and fade
        const scale = 0.5 + progress * 3 * intensity;
        groupRef.current.scale.setScalar(scale);

        // Rotate for dynamic feel
        groupRef.current.rotation.z += 0.1;

        // Fade out
        groupRef.current.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.opacity = Math.max(0, 1 - progress * 1.5);
                mat.transparent = true;
            }
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Core flash */}
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={10}
                    transparent
                    opacity={1}
                />
            </mesh>

            {/* Shockwave ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.6, 32]} />
                <meshStandardMaterial
                    color="#ff6600"
                    emissive="#ff6600"
                    emissiveIntensity={5}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Spark particles */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 0.5;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * distance,
                            0.2,
                            Math.sin(angle) * distance
                        ]}
                    >
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial
                            color="#ffaa00"
                            emissive="#ffaa00"
                            emissiveIntensity={8}
                        />
                    </mesh>
                );
            })}

            <pointLight
                color="#ff6600"
                intensity={20 * intensity}
                distance={10}
            />
        </group>
    );
};

// Slash Trail Effect (for sword attacks)
export const SlashTrail: React.FC<{
    start: [number, number, number];
    end: [number, number, number];
    color?: string;
}> = ({ start, end, color = '#00d4ff' }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!meshRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 0.4);

        // Fade and shrink
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - progress * 2);

        meshRef.current.scale.y = Math.max(0.1, 1 - progress);
    });

    // Calculate trail geometry
    const midpoint = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
    ] as [number, number, number];

    const length = Math.sqrt(
        Math.pow(end[0] - start[0], 2) +
        Math.pow(end[1] - start[1], 2) +
        Math.pow(end[2] - start[2], 2)
    );

    const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

    return (
        <mesh
            ref={meshRef}
            position={midpoint}
            rotation={[0, angle, 0]}
        >
            <planeGeometry args={[length, 0.3]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={3}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Heal/Buff Aura Effect
export const HealAura: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());

    useFrame((state) => {
        if (!groupRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const time = state.clock.getElapsedTime();

        // Pulsing animation
        const pulse = 1 + Math.sin(time * 4) * 0.2;
        groupRef.current.scale.setScalar(pulse);

        // Gentle rotation
        groupRef.current.rotation.y = time * 0.5;

        // Fade out over time
        const progress = Math.min(1, elapsed / 2);
        groupRef.current.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.opacity = Math.max(0, 0.6 - progress * 0.6);
            }
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Inner glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial
                    color="#00ff88"
                    emissive="#00ff88"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Outer ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.6, 0.8, 32]} />
                <meshStandardMaterial
                    color="#00ffaa"
                    emissive="#00ffaa"
                    emissiveIntensity={3}
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 0.7;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            Math.sin(Date.now() * 0.003 + i) * 0.3,
                            Math.sin(angle) * radius
                        ]}
                    >
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshStandardMaterial
                            color="#88ffcc"
                            emissive="#88ffcc"
                            emissiveIntensity={4}
                        />
                    </mesh>
                );
            })}

            <pointLight color="#00ff88" intensity={5} distance={5} />
        </group>
    );
};

// Level Up / Achievement Effect
export const LevelUpEffect: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!groupRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 1.5);

        // Rise up
        groupRef.current.position.y = position[1] + progress * 3;

        // Expand
        groupRef.current.scale.setScalar(1 + progress * 2);

        // Rotate
        groupRef.current.rotation.y = progress * Math.PI * 4;

        // Fade
        groupRef.current.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.opacity = Math.max(0, 1 - progress);
            }
        });
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], position[2]]}>
            {/* Star burst */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.5,
                            0,
                            Math.sin(angle) * 0.5
                        ]}
                        rotation={[0, angle, 0]}
                    >
                        <coneGeometry args={[0.1, 0.8, 4]} />
                        <meshStandardMaterial
                            color="#ffd700"
                            emissive="#ffd700"
                            emissiveIntensity={5}
                            transparent
                            opacity={1}
                        />
                    </mesh>
                );
            })}

            {/* Central star */}
            <mesh>
                <octahedronGeometry args={[0.3]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={10}
                    transparent
                    opacity={1}
                />
            </mesh>

            <pointLight color="#ffd700" intensity={30} distance={15} />
        </group>
    );
};

// Damage Number Display (floating text effect)
export const DamageNumber: React.FC<{
    position: [number, number, number];
    damage: number;
    isCrit?: boolean;
}> = ({ position, damage, isCrit = false }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!meshRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 1);

        // Float up
        meshRef.current.position.y = position[1] + progress * 2;

        // Fade out
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - progress);

        // Scale punch
        const scale = isCrit ? 1.5 - progress * 0.5 : 1;
        meshRef.current.scale.setScalar(scale);
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
                color={isCrit ? '#ff0000' : '#ffaa00'}
                emissive={isCrit ? '#ff0000' : '#ffaa00'}
                emissiveIntensity={isCrit ? 8 : 4}
                transparent
                opacity={1}
            />
        </mesh>
    );
};

// Shield Block Effect
export const ShieldBlock: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!meshRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 0.5);

        // Ripple effect
        meshRef.current.scale.setScalar(1 + progress * 2);

        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 0.8 - progress * 0.8);
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
                color="#00aaff"
                emissive="#00aaff"
                emissiveIntensity={3}
                transparent
                opacity={0.8}
                wireframe
            />
        </mesh>
    );
};

export default {
    ImpactBurst,
    SlashTrail,
    HealAura,
    LevelUpEffect,
    DamageNumber,
    ShieldBlock
};
