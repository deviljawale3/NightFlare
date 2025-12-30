import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyClass } from '../types';
import { Sparkles } from '@react-three/drei';

interface RealisticEnemyProps {
    position: [number, number, number];
    seed: number;
    type: EnemyClass;
    isAttacking: boolean;
    isDying: boolean;
    isStunned: boolean;
    hitTime?: number;
}

const RealisticEnemy: React.FC<RealisticEnemyProps> = ({
    position,
    seed,
    type,
    isAttacking,
    isDying,
    isStunned,
    hitTime = 0
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const lLegGroup = useRef<THREE.Group>(null);
    const rLegGroup = useRef<THREE.Group>(null);

    const getColors = () => {
        switch (type) {
            case 'STALKER': return { skin: '#4a5a3a', gear: '#1a1a1a', visor: '#ff0000', emissive: '#ff4400' };
            case 'BRUTE': return { skin: '#3a2a1a', gear: '#000000', visor: '#ff4400', emissive: '#ff6600' };
            case 'WRAITH': return { skin: '#2e004a', gear: '#000000', visor: '#9d00ff', emissive: '#9d00ff' };
            case 'VOID_WALKER': return { skin: '#05051a', gear: '#000000', visor: '#00ffff', emissive: '#00ffff' };
            case 'FOREST_WOLF': return { skin: '#2d4a1a', gear: '#1a1a1a', visor: '#ffaa00', emissive: '#ffaa00' };
            case 'FIRE_ELEMENTAL': return { skin: '#661100', gear: '#330000', visor: '#ff4400', emissive: '#ff0000' };
            case 'ICE_WRAITH': return { skin: '#eef6ff', gear: '#cbd5e1', visor: '#00d4ff', emissive: '#00d4ff' };
            case 'SAND_RAVAGER': return { skin: '#d4a373', gear: '#432818', visor: '#ffe000', emissive: '#ffe000' };
            case 'VOID_SPECTER': return { skin: '#111', gear: '#000', visor: '#a855f7', emissive: '#a855f7' };
            case 'STAR_REAVER': return { skin: '#c0c0c0', gear: '#1e293b', visor: '#ffffff', emissive: '#00f2ff' };
            case 'CRYSTAL_GOLEM': return { skin: '#f0abfc', gear: '#701a75', visor: '#e879f9', emissive: '#e879f9' };
            case 'CORRUPTED_STALKER': return { skin: '#365314', gear: '#1a2e05', visor: '#84cc16', emissive: '#84cc16' };
            case 'DEEP_DWELLER': return { skin: '#1e1b4b', gear: '#020617', visor: '#4338ca', emissive: '#4338ca' };
            case 'SHADOW_LORD': return { skin: '#000', gear: '#000', visor: '#ffffff', emissive: '#ffffff' };
            default: return { skin: '#4a5a3a', gear: '#1a1a1a', visor: '#ff0000', emissive: '#ff4400' };
        }
    };

    const colors = getColors();
    const scale =
        type === 'SHADOW_LORD' ? 3.0 :
            type === 'CRYSTAL_GOLEM' ? 2.5 :
                type === 'VOID_WALKER' ? 2.2 :
                    type === 'BRUTE' ? 1.6 :
                        type === 'WRAITH' ? 1.2 : 1.1;

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        const currentTimeMillis = performance.now();
        const hitElapsed = (currentTimeMillis - hitTime) / 1000;

        // HIT REACTION: Squash and Stretch + Shake
        if (hitElapsed < 0.25) {
            const hitFactor = 1 - (hitElapsed / 0.25);
            bodyRef.current!.scale.set(1 + hitFactor * 0.2, 1 - hitFactor * 0.3, 1 + hitFactor * 0.2);
            bodyRef.current!.position.x = (Math.random() - 0.5) * hitFactor * 0.2;
            bodyRef.current!.position.z = (Math.random() - 0.5) * hitFactor * 0.2;
        } else if (!isDying) {
            bodyRef.current!.scale.setScalar(1);
            bodyRef.current!.position.x = 0;
            bodyRef.current!.position.z = 0;
        }

        if (isDying) {
            // COLLAPSE ANIMATION
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 2.2, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.8, 0.1);

            // Dissolve effect over time
            const deathElapsed = (currentTimeMillis - (groupRef.current as any).deathInitTime || 0) / 1000;
            if (bodyRef.current) {
                bodyRef.current.scale.multiplyScalar(0.99);
            }
        } else if (!isStunned) {
            // Aggressive Heavy Walk
            const walkSpeed = type === 'BRUTE' ? 8 : 12;
            const walkTime = (t + seed * 10) * walkSpeed;
            lLegGroup.current!.rotation.x = Math.sin(walkTime) * 0.6;
            rLegGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * 0.6;

            bodyRef.current!.position.y = Math.abs(Math.sin(walkTime * 2)) * 0.05;
            bodyRef.current!.rotation.z = Math.sin(walkTime) * 0.05;

            // Attack Pose
            if (isAttacking) {
                bodyRef.current!.rotation.x = 0.4;
            } else {
                bodyRef.current!.rotation.x = 0.15;
            }
        }

        if (isStunned && !isDying) {
            groupRef.current.rotation.z = Math.sin(t * 30) * 0.1;
        }
    });

    useEffect(() => {
        if (isDying && groupRef.current) {
            (groupRef.current as any).deathInitTime = performance.now();
        }
    }, [isDying]);

    return (
        <group position={position} scale={scale} ref={groupRef}>
            <group ref={bodyRef}>
                <mesh position={[0, 1.1, 0]} castShadow>
                    <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
                    <meshStandardMaterial color={colors.gear} roughness={0.9} />
                </mesh>
                <group position={[0, 1.55, 0.05]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.13, 0.13, 8, 16]} />
                        <meshStandardMaterial color={colors.skin} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.02, 0.1]}>
                        <boxGeometry args={[0.18, 0.05, 0.05]} />
                        <meshStandardMaterial color="#000" emissive={colors.visor} emissiveIntensity={3} />
                    </mesh>
                </group>
                <group position={[-0.25, 1.3, 0]} rotation={[0.4, 0, -0.2]}>
                    <mesh position={[0, -0.2, 0]} castShadow>
                        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
                        <meshStandardMaterial color={colors.gear} />
                    </mesh>
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
                    <mesh position={[0, -0.4, 0.05]}>
                        <boxGeometry args={[0.1, 0.05, 0.1]} />
                        <meshStandardMaterial color="#111" metalness={1} />
                    </mesh>
                </group>
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
            <pointLight position={[0, 1.5, 0.2]} intensity={isDying ? 0 : 0.8} distance={5} color={colors.visor} />
            {isDying && (
                <group position={[0, 1, 0]}>
                    <mesh>
                        <sphereGeometry args={[1.5, 32, 32]} />
                        <meshStandardMaterial color={colors.visor} transparent opacity={0.1} emissive={colors.visor} emissiveIntensity={2} />
                    </mesh>
                    <Sparkles count={20} scale={2} size={2} color={colors.visor} speed={2} />
                </group>
            )}
        </group>
    );
};

export default RealisticEnemy;
