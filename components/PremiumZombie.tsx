import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium Zombie Enemy Design
 * Human-zombie character with bloodied white costume and realistic animations
 */

interface ZombieProps {
    position: [number, number, number];
    seed: number;
    type: 'STALKER' | 'BRUTE' | 'WRAITH' | 'VOID_WALKER';
    isAttacking?: boolean;
    isDying?: boolean;
    isStunned?: boolean;
}

export const PremiumZombie: React.FC<ZombieProps> = ({
    position,
    seed,
    type,
    isAttacking = false,
    isDying = false,
    isStunned = false
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime() + seed;

        if (isDying) {
            // Death animation - fall and fade
            groupRef.current.rotation.x = Math.min(Math.PI / 2, time * 2);
            groupRef.current.position.y = Math.max(-1, position[1] - time * 0.5);
            return;
        }

        if (isAttacking) {
            // Attack animation - lunge forward with arms
            if (leftArmRef.current && rightArmRef.current) {
                leftArmRef.current.rotation.x = -Math.PI / 3;
                leftArmRef.current.rotation.z = -0.3;
                rightArmRef.current.rotation.x = -Math.PI / 3;
                rightArmRef.current.rotation.z = 0.3;
            }

            // Lean forward
            groupRef.current.rotation.x = -0.2;
        } else {
            // Idle/walking animation
            if (leftArmRef.current && rightArmRef.current) {
                // Zombie shamble - arms swing slowly
                leftArmRef.current.rotation.x = Math.sin(time * 1.5) * 0.3;
                rightArmRef.current.rotation.x = Math.sin(time * 1.5 + Math.PI) * 0.3;
            }

            if (leftLegRef.current && rightLegRef.current) {
                // Dragging walk
                leftLegRef.current.rotation.x = Math.sin(time * 1.2) * 0.4;
                rightLegRef.current.rotation.x = Math.sin(time * 1.2 + Math.PI) * 0.4;
            }

            // Head sway
            if (headRef.current) {
                headRef.current.rotation.z = Math.sin(time * 0.8) * 0.15;
                headRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
            }

            // Slight body sway
            groupRef.current.rotation.z = Math.sin(time * 0.6) * 0.05;
        }
    });

    // Scale based on type
    const scale = type === 'BRUTE' ? 1.4 : type === 'VOID_WALKER' ? 1.8 : 1.0;
    const skinTone = type === 'WRAITH' ? '#9d9d9d' : '#d4c5b9'; // Pale zombie skin
    const bloodIntensity = type === 'BRUTE' ? 0.8 : 0.5;

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* TORSO - Bloodied white shirt */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[0.8, 1.1, 0.5]} />
                <meshStandardMaterial
                    color="#e8e8e8" // White/gray shirt
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Blood stains on torso */}
            <mesh position={[0, 1.2, 0.26]} castShadow>
                <boxGeometry args={[0.7, 1.0, 0.01]} />
                <meshStandardMaterial
                    color="#8b0000" // Dark blood red
                    transparent
                    opacity={bloodIntensity}
                    roughness={0.8}
                />
            </mesh>

            {/* HEAD - Zombie head */}
            <group ref={headRef} position={[0, 2.0, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.55, 0.6, 0.55]} />
                    <meshStandardMaterial
                        color={skinTone}
                        roughness={0.95}
                        metalness={0.05}
                    />
                </mesh>

                {/* Glowing eyes */}
                <mesh position={[-0.15, 0.1, 0.28]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={3}
                    />
                </mesh>
                <mesh position={[0.15, 0.1, 0.28]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={3}
                    />
                </mesh>

                {/* Blood on face */}
                <mesh position={[0, -0.1, 0.28]}>
                    <boxGeometry args={[0.3, 0.2, 0.01]} />
                    <meshStandardMaterial
                        color="#8b0000"
                        transparent
                        opacity={0.7}
                    />
                </mesh>

                {/* Torn ear (detail) */}
                <mesh position={[-0.3, 0.15, 0]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.08, 0.15, 0.05]} />
                    <meshStandardMaterial color={skinTone} />
                </mesh>

                {/* Stun Stars Effect */}
                {isStunned && (
                    <group position={[0, 0.6, 0]}>
                        {[0, 1, 2].map((i) => (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(Date.now() * 0.01 + (i * Math.PI * 2) / 3) * 0.4,
                                    Math.sin(Date.now() * 0.005 + i) * 0.1,
                                    Math.sin(Date.now() * 0.01 + (i * Math.PI * 2) / 3) * 0.4
                                ]}
                            >
                                <sphereGeometry args={[0.05, 8, 8]} />
                                <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
                            </mesh>
                        ))}
                    </group>
                )}
            </group>

            {/* LEFT ARM - Reaching out */}
            <group ref={leftArmRef} position={[-0.5, 1.3, 0]}>
                {/* Upper arm */}
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
                </mesh>

                {/* Forearm */}
                <mesh position={[0, -0.8, 0.1]} rotation={[0.3, 0, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.6, 0.18]} />
                    <meshStandardMaterial color={skinTone} roughness={0.95} />
                </mesh>

                {/* Hand with claws */}
                <mesh position={[0, -1.2, 0.2]} castShadow>
                    <boxGeometry args={[0.15, 0.25, 0.15]} />
                    <meshStandardMaterial color={skinTone} />
                </mesh>

                {/* Blood on arm */}
                <mesh position={[0, -0.5, 0.11]}>
                    <boxGeometry args={[0.19, 0.4, 0.01]} />
                    <meshStandardMaterial
                        color="#8b0000"
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </group>

            {/* RIGHT ARM - Similar to left */}
            <group ref={rightArmRef} position={[0.5, 1.3, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
                </mesh>

                <mesh position={[0, -0.8, 0.1]} rotation={[0.3, 0, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.6, 0.18]} />
                    <meshStandardMaterial color={skinTone} roughness={0.95} />
                </mesh>

                <mesh position={[0, -1.2, 0.2]} castShadow>
                    <boxGeometry args={[0.15, 0.25, 0.15]} />
                    <meshStandardMaterial color={skinTone} />
                </mesh>

                <mesh position={[0, -0.5, 0.11]}>
                    <boxGeometry args={[0.19, 0.4, 0.01]} />
                    <meshStandardMaterial
                        color="#8b0000"
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </group>

            {/* LEFT LEG - Tattered pants */}
            <group ref={leftLegRef} position={[-0.25, 0.6, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.8, 0.25]} />
                    <meshStandardMaterial color="#4a4a4a" roughness={0.95} /> {/* Dark pants */}
                </mesh>

                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.23, 0.6, 0.23]} />
                    <meshStandardMaterial color="#4a4a4a" />
                </mesh>

                {/* Shoe */}
                <mesh position={[0, -1.15, 0.08]} castShadow>
                    <boxGeometry args={[0.25, 0.15, 0.35]} />
                    <meshStandardMaterial color="#2a2a2a" />
                </mesh>
            </group>

            {/* RIGHT LEG */}
            <group ref={rightLegRef} position={[0.25, 0.6, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.8, 0.25]} />
                    <meshStandardMaterial color="#4a4a4a" roughness={0.95} />
                </mesh>

                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.23, 0.6, 0.23]} />
                    <meshStandardMaterial color="#4a4a4a" />
                </mesh>

                <mesh position={[0, -1.15, 0.08]} castShadow>
                    <boxGeometry args={[0.25, 0.15, 0.35]} />
                    <meshStandardMaterial color="#2a2a2a" />
                </mesh>
            </group>

            {/* Particle effects for special types */}
            {type === 'VOID_WALKER' && (
                <group>
                    {[...Array(6)].map((_, i) => {
                        const angle = (i / 6) * Math.PI * 2;
                        return (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(angle) * 0.8,
                                    1.5 + Math.sin(Date.now() * 0.002 + i) * 0.3,
                                    Math.sin(angle) * 0.8
                                ]}
                            >
                                <sphereGeometry args={[0.08, 8, 8]} />
                                <meshStandardMaterial
                                    color="#00ffff"
                                    emissive="#00ffff"
                                    emissiveIntensity={5}
                                    transparent
                                    opacity={0.6}
                                />
                            </mesh>
                        );
                    })}
                </group>
            )}

            {/* Wraith ghostly effect */}
            {type === 'WRAITH' && (
                <mesh position={[0, 1.2, 0]}>
                    <sphereGeometry args={[1.2, 16, 16]} />
                    <meshStandardMaterial
                        color="#9d00ff"
                        transparent
                        opacity={0.15}
                        emissive="#9d00ff"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}
        </group>
    );
};

export default PremiumZombie;
