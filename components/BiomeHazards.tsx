
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';

/**
 * BiomeHazards Component
 * Implements Phase 5 gameplay environmental dangers.
 */
export const BiomeHazards: React.FC = () => {
    const { islandTheme, playerStats, updateTemperature } = useGameStore();
    const [eruptions, setEruptions] = useState<{ id: number, pos: [number, number, number] }[]>([]);

    // ARCTIC LOGIC: Check distance to "heat sources" (Nightflare or structures)
    useFrame((state, delta) => {
        if (islandTheme === IslandTheme.ARCTIC) {
            const playerPos = (window as any).playerPos || new THREE.Vector3();
            const distToCore = playerPos.length(); // Core is at 0,0,0

            // Heat sources: Core (range 8) or any structure (range 4)
            // For simplicity, we'll check distance to origin.
            const isNearHeat = distToCore < 10;

            if (isNearHeat) {
                updateTemperature(delta * 15); // Refill
            } else {
                updateTemperature(-delta * 3); // Drain
            }

            // Damage player if freezing
            if (playerStats.temperature <= 0) {
                // Trigger damage event every second
                if (Math.floor(state.clock.elapsedTime) % 2 === 0 && Math.random() < 0.01) {
                    window.dispatchEvent(new CustomEvent('player-damage', { detail: { amount: 1, type: 'ENV' } }));
                }
            }
        }
    });

    // VOLCANO LOGIC: Random eruptions
    useEffect(() => {
        if (islandTheme !== IslandTheme.VOLCANO) return;

        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 10 + Math.random() * 20;
                const id = Date.now();
                const pos: [number, number, number] = [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];

                setEruptions(prev => [...prev, { id, pos }]);
                setTimeout(() => {
                    // Check damage to player/enemies
                    const playerPos = (window as any).playerPos || new THREE.Vector3();
                    const pDist = new THREE.Vector3(...pos).distanceTo(playerPos);
                    if (pDist < 5) {
                        window.dispatchEvent(new CustomEvent('player-damage', { detail: { amount: 15, type: 'FIRE' } }));
                    }
                }, 1500);
                setTimeout(() => setEruptions(p => p.filter(e => e.id !== id)), 3000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [islandTheme]);

    return (
        <group>
            {/* Arctic Frost Effect */}
            {islandTheme === IslandTheme.ARCTIC && (
                <Sparkles count={100} scale={30} size={5} speed={0.4} opacity={0.2} color="#ffffff" />
            )}

            {/* Volcano Eruptions */}
            {eruptions.map(e => (
                <Eruption key={e.id} position={e.pos} />
            ))}
        </group>
    );
};

const Eruption: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const ref = useRef<THREE.Group>(null);
    const [phase, setPhase] = useState<'WARNING' | 'FIRE' | 'DONE'>('WARNING');

    useEffect(() => {
        setTimeout(() => setPhase('FIRE'), 1500);
    }, []);

    return (
        <group position={position as any} ref={ref}>
            {phase === 'WARNING' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0, 4, 32]} />
                    <meshBasicMaterial color="#ff4400" transparent opacity={0.3} />
                </mesh>
            )}
            {phase === 'FIRE' && (
                <Float speed={10} rotationIntensity={2}>
                    <mesh position={[0, 2, 0]}>
                        <sphereGeometry args={[2, 16, 16]} />
                        <meshStandardMaterial color="#ff0000" emissive="#ff6600" emissiveIntensity={5} />
                    </mesh>
                    <pointLight color="#ff4400" intensity={50} distance={15} />
                </Float>
            )}
        </group>
    );
};
