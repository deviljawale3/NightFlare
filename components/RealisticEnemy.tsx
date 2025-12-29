import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyClass } from '../types';

interface RealisticEnemyProps {
    position: [number, number, number];
    seed: number;
    type: EnemyClass;
    isAttacking: boolean;
    isDying: boolean;
    isStunned: boolean;
}

const RealisticEnemy: React.FC<RealisticEnemyProps> = ({
    position,
    seed,
    type,
    isAttacking,
    isDying,
    isStunned
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const lLegGroup = useRef<THREE.Group>(null);
    const rLegGroup = useRef<THREE.Group>(null);

    const getColors = () => {
        switch (type) {
            case 'STALKER': return { skin: '#4a5a3a', gear: '#1a1a1a', visor: '#ff0000' };
            case 'BRUTE': return { skin: '#3a2a1a', gear: '#000000', visor: '#ff4400' };
            case 'VOID_WALKER': return { skin: '#0a0a22', gear: '#000000', visor: '#00ffff' };
            default: return { skin: '#4a5a3a', gear: '#1a1a1a', visor: '#ff0000' };
        }
    };

    const colors = getColors();
    const scale = type === 'BRUTE' ? 1.4 : type === 'VOID_WALKER' ? 1.8 : 1.1;

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime() + seed * 100;

        if (!isDying && !isStunned) {
            // Aggressive Heavy Walk
            const walkSpeed = type === 'BRUTE' ? 8 : 12;
            const walkTime = t * walkSpeed;
            lLegGroup.current!.rotation.x = Math.sin(walkTime) * 0.6;
            rLegGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * 0.6;

            bodyRef.current!.position.y = Math.abs(Math.sin(walkTime * 2)) * 0.05;
            bodyRef.current!.rotation.z = Math.sin(walkTime) * 0.05;

            // Attack Pose
            if (isAttacking) {
                bodyRef.current!.rotation.x = 0.4;
            } else {
                bodyRef.current!.rotation.x = 0.15; // Slightly hunched predatory stance
            }
        }

        if (isStunned) {
            groupRef.current.rotation.z = Math.sin(t * 30) * 0.1;
        }
    });

    return (
        <group position={position} scale={scale} ref={groupRef}>
            {/* ENEMY BODY */}
            <group ref={bodyRef}>
                {/* TORSO */}
                <mesh position={[0, 1.1, 0]} castShadow>
                    <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
                    <meshStandardMaterial color={colors.gear} roughness={0.9} />
                </mesh>

                {/* HEAD */}
                <group position={[0, 1.55, 0.05]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.13, 0.13, 8, 16]} />
                        <meshStandardMaterial color={colors.skin} roughness={0.8} />
                    </mesh>
                    {/* Glowing Tactical Visor */}
                    <mesh position={[0, 0.02, 0.1]}>
                        <boxGeometry args={[0.18, 0.05, 0.05]} />
                        <meshStandardMaterial color="#000" emissive={colors.visor} emissiveIntensity={3} />
                    </mesh>
                </group>

                {/* ARMS - Aggressive Predator Pose */}
                <group position={[-0.25, 1.3, 0]} rotation={[0.4, 0, -0.2]}>
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
                        <meshStandardMaterial color={colors.gear} />
                    </mesh>
                    {/* Claws */}
                    <mesh position={[0, -0.4, 0.05]}>
                        <boxGeometry args={[0.1, 0.05, 0.1]} />
                        <meshStandardMaterial color="#111" metalness={1} />
                    </mesh>
                </group>
                <group position={[0.25, 1.3, 0]} rotation={[0.4, 0, 0.2]}>
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
                        <meshStandardMaterial color={colors.gear} />
                    </mesh>
                    {/* Claws */}
                    <mesh position={[0, -0.4, 0.05]}>
                        <boxGeometry args={[0.1, 0.05, 0.1]} />
                        <meshStandardMaterial color="#111" metalness={1} />
                    </mesh>
                </group>

                {/* LEGS */}
                <group ref={lLegGroup} position={[-0.12, 0.75, 0]}>
                    <mesh position={[0, -0.35, 0]} castShadow>
                        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
                        <meshStandardMaterial color={colors.gear} />
                    </mesh>
                </group>
                <group ref={rLegGroup} position={[0.12, 0.75, 0]}>
                    <mesh position={[0, -0.35, 0]} castShadow>
                        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
                        <meshStandardMaterial color={colors.gear} />
                    </mesh>
                </group>
            </group>

            {/* LIGHT EMISSION FOR VISIBILITY */}
            <pointLight position={[0, 1.5, 0.2]} intensity={0.8} distance={5} color={colors.visor} />

            {/* DEATH EFFECT */}
            {isDying && (
                <mesh position={[0, 1, 0]}>
                    <sphereGeometry args={[1.2]} />
                    <meshStandardMaterial color={colors.visor} transparent opacity={0.5} emissive={colors.visor} emissiveIntensity={5} />
                </mesh>
            )}
        </group>
    );
};

export default RealisticEnemy;
