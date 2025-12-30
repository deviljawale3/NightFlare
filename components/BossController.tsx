import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState } from '../types';
import { soundEffects } from '../utils/soundEffects';

const BossController: React.FC = () => {
    const { bossState, damageBoss, damageNightflare, damagePlayer, triggerScreenShake } = useGameStore();
    const bossRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const [phase, setPhase] = useState<'SPAWNING' | 'MARCH' | 'ATTACK' | 'CHANNEL'>('SPAWNING');
    const [target, setTarget] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));



    useEffect(() => {
        if (bossState.active && bossState.type !== 'NONE') {
            const theta = Math.random() * Math.PI * 2;
            const radius = 45;
            const startX = Math.cos(theta) * radius;
            const startZ = Math.sin(theta) * radius;
            if (bossRef.current) {
                bossRef.current.position.set(startX, 0, startZ);
                setTarget(new THREE.Vector3(0, 0, 0)); // Target Core
                triggerScreenShake(2.0); // Spawn roar shake
                soundEffects?.enemySpawn();
            }
        }
    }, [bossState.active, bossState.type]);

    useFrame((state, delta) => {
        if (!bossState.active || !bossRef.current) return;

        if (bossState.type === 'OBSIDIAN_GOLEM') {
            // GOLEM AI
            const dist = bossRef.current.position.distanceTo(target);
            const playerPos = (window as any).playerPos || new THREE.Vector3();
            const distToPlayer = bossRef.current.position.distanceTo(playerPos);

            if (phase === 'MARCH') {
                // Walk towards core
                const dir = target.clone().sub(bossRef.current.position).normalize();
                bossRef.current.position.add(dir.multiplyScalar(delta * 1.5)); // Slow but unstoppable
                bossRef.current.lookAt(target);

                // Animation
                const walkCycle = Math.sin(state.clock.getElapsedTime() * 1.2);
                bossRef.current.scale.y = 1 + walkCycle * 0.05;

                // Step shake
                if (walkCycle > 0.95 && Math.random() < 0.1) {
                    triggerScreenShake(0.2);
                    soundEffects?.footstepStone();
                }

                if (dist < 8) setPhase('ATTACK');
            } else if (phase === 'ATTACK') {
                // Smash Core
                if (state.clock.getElapsedTime() % 3 < 0.1) {
                    // SMASH
                    damageNightflare(50); // Massive damage
                    triggerScreenShake(1.5);
                    // Creating a shockwave effect could go here
                }
            }
        }

        if (bossState.type === 'VOID_WEAVER') {
            // VOID WEAVER (Colossus) AI
            const age = state.clock.getElapsedTime();
            const playerPos = (window as any).playerPos || new THREE.Vector3();

            // Hover logic
            bossRef.current.position.y = 10 + Math.sin(age * 0.5) * 2;

            if (phase === 'SPAWNING') {
                if (age % 10 < 0.1) setPhase('CHANNEL');
            } else if (phase === 'CHANNEL') {
                // Summon minions or fire beams
                if (age % 5 < 0.1) {
                    triggerScreenShake(0.5);
                }
                if (age % 15 < 0.1) setPhase('MARCH');
            } else if (phase === 'MARCH') {
                const dir = target.clone().sub(bossRef.current.position).normalize();
                bossRef.current.position.x += dir.x * delta * 2;
                bossRef.current.position.z += dir.z * delta * 2;
                bossRef.current.lookAt(playerPos);
                if (bossRef.current.position.distanceTo(target) < 15) setPhase('ATTACK');
            }
        }
    });

    // Hit Detection for Boss
    useEffect(() => {
        const handleHit = (e: any) => {
            if (!bossState.active) return;
            const { position, range, damage } = e.detail;
            const attackPos = position as THREE.Vector3;
            if (!bossRef.current) return;

            const dist = bossRef.current.position.distanceTo(attackPos);
            const bossHeight = bossState.type === 'VOID_WEAVER' ? 12 : 5;

            // Check vertical distance too since VOID_WEAVER floats
            const verticalDist = Math.abs(bossRef.current.position.y - attackPos.y);

            if (dist < (range + (bossState.type === 'VOID_WEAVER' ? 10 : 4)) && verticalDist < (bossHeight + 2)) {
                const finalDmg = bossState.type === 'VOID_WEAVER' ? damage * 0.3 : damage * 0.5; // Colossus more armored
                damageBoss(finalDmg);
                soundEffects?.playExplosion();

                if (coreRef.current) {
                    (coreRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xff0000);
                    setTimeout(() => {
                        if (coreRef.current) (coreRef.current.material as THREE.MeshStandardMaterial).color.setHex(bossState.type === 'VOID_WEAVER' ? 0x00ffff : 0xff3300);
                    }, 100);
                }
            }
        };
        window.addEventListener('player-attack-hitbox', handleHit);
        return () => window.removeEventListener('player-attack-hitbox', handleHit);
    }, [bossState.active, bossState.type]);

    // Tag boss for turrets
    useFrame(() => {
        if (bossRef.current) {
            (bossRef.current as any).isEnemyHeuristic = true;
            (bossRef.current as any).isBoss = true;
        }
    });

    if (!bossState.active) return null;

    return (
        <group ref={bossRef}>
            {/* OBSIDIAN GOLEM MODEL */}
            {bossState.type === 'OBSIDIAN_GOLEM' && (
                <group>
                    <mesh position={[-1.5, 1.5, 0]}><boxGeometry args={[1.2, 3, 1.2]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[1.5, 1.5, 0]}><boxGeometry args={[1.2, 3, 1.2]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[0, 4.5, 0]} castShadow><dodecahedronGeometry args={[2.5, 0]} /><meshStandardMaterial color="#111" metalness={0.6} /></mesh>
                    <mesh ref={coreRef} position={[0, 4.5, 1.8]}><octahedronGeometry args={[0.8]} /><meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={3} /></mesh>
                    <mesh position={[-3, 4, 0]}><boxGeometry args={[1.5, 4, 1.5]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[3, 4, 0]}><boxGeometry args={[1.5, 4, 1.5]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[0, 7.2, 0]}><boxGeometry args={[1.2, 1.2, 1.2]} /><meshStandardMaterial color="#333" /></mesh>
                </group>
            )}

            {/* VOID WEAVER (COLOSSUS) MODEL */}
            {bossState.type === 'VOID_WEAVER' && (
                <group>
                    {/* Massive Floating Geometric Core */}
                    <mesh ref={coreRef} castShadow>
                        <icosahedronGeometry args={[5, 1]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} transparent opacity={0.3} wireframe />
                    </mesh>

                    {/* Inner Dark Star */}
                    <mesh>
                        <sphereGeometry args={[2, 32, 32]} />
                        <meshStandardMaterial color="#000" metalness={1} roughness={0} />
                    </mesh>

                    {/* Orbital Rings */}
                    {[1, 2, 3].map(i => (
                        <group key={i} rotation={[Math.PI * Math.random(), Math.PI * Math.random(), 0]}>
                            <mesh rotation={[Date.now() * 0.001 * i, 0, 0]}>
                                <torusGeometry args={[6 + i * 1.5, 0.2, 16, 100]} />
                                <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={1} />
                            </mesh>
                        </group>
                    ))}

                    {/* Hanging "Tendrils" of dark matter */}
                    {[...Array(8)].map((_, i) => (
                        <mesh key={i} position={[Math.cos(i) * 4, -8, Math.sin(i) * 4]}>
                            <cylinderGeometry args={[0.1, 0.5, 12]} />
                            <meshStandardMaterial color="#0a0a0a" transparent opacity={0.6} />
                        </mesh>
                    ))}

                    <pointLight distance={30} intensity={20} color="#00ffff" />
                </group>
            )}
        </group>
    );
};

export default BossController;
