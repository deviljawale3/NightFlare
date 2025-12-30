
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { DroneType } from '../types';

const DroneComponent: React.FC<{ type: DroneType, index: number }> = ({ type, index }) => {
    const meshRef = useRef<THREE.Group>(null);
    const lastAction = useRef(0);
    const { addResource, recordEnemyKill } = useGameStore();

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        const playerPos = (window as any).playerPos || new THREE.Vector3();

        // Orbit around player
        const orbitRadius = 3.0 + Math.sin(time * 0.5) * 0.5;
        const speed = 1.0;
        const angle = time * speed + (index * ((Math.PI * 2) / 3));

        const targetX = playerPos.x + Math.cos(angle) * orbitRadius;
        const targetZ = playerPos.z + Math.sin(angle) * orbitRadius;
        const targetY = playerPos.y + 2.5 + Math.sin(time * 2 + index) * 0.4;

        meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);

        // Face movement
        const lookTarget = new THREE.Vector3(targetX, targetY, targetZ).add(new THREE.Vector3(Math.cos(angle + 0.2), 0, Math.sin(angle + 0.2)));
        meshRef.current.lookAt(lookTarget);

        // Functional Logic (Every 2 seconds)
        if (time - lastAction.current > 2) {
            lastAction.current = time;

            if (type === 'VORTEX') {
                // Find nearest node
                const nodes = (window as any).resourceNodes || [];
                const nearest = nodes.find((n: any) => n.position.distanceTo(meshRef.current!.position) < 8);
                if (nearest) {
                    // Simulate collection
                    window.dispatchEvent(new CustomEvent('resource-collected', { detail: { position: nearest.position, type: nearest.type.toLowerCase() } }));
                }
            } else if (type === 'STINGER') {
                // Find nearest enemy
                const enemyMeshes = (window as any).enemyMeshes || [];
                let closest = null;
                let minDist = 15;

                for (let id in enemyMeshes) {
                    const dist = enemyMeshes[id].position.distanceTo(meshRef.current!.position);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = enemyMeshes[id];
                    }
                }

                if (closest) {
                    // Laser beam effect visual trigger
                    window.dispatchEvent(new CustomEvent('drone-attack', {
                        detail: {
                            from: meshRef.current.position.clone(),
                            to: closest.position.clone(),
                            type: 'STINGER'
                        }
                    }));
                    // Check if it's a real enemy object to damage (handled via global event listener usually)
                }
            }
        }
    });

    const config = useMemo(() => {
        switch (type) {
            case 'VORTEX': return { color: '#06b6d4', icon: '🧲', core: '#00ffff' };
            case 'STINGER': return { color: '#ef4444', icon: '🔫', core: '#ff0000' };
            case 'AEGIS': return { color: '#8b5cf6', icon: '🛡️', core: '#a855f7' };
            default: return { color: '#ffffff', icon: '🚁', core: '#ffffff' };
        }
    }, [type]);

    return (
        <group ref={meshRef}>
            <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Drone Body */}
                <mesh castShadow>
                    <octahedronGeometry args={[0.3, 0]} />
                    <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.1} emissive={config.core} emissiveIntensity={0.5} />
                </mesh>
                {/* Secondary Parts */}
                <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.45, 16]} />
                    <meshBasicMaterial color={config.color} transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
                <pointLight color={config.color} intensity={2} distance={5} />
                <Sparkles count={10} scale={1} size={2} speed={0.5} opacity={0.5} color={config.color} />
            </Float>
        </group>
    );
};

const DroneSystem: React.FC = () => {
    const activeDrones = useGameStore(s => s.playerStats.activeDrones);

    return (
        <group>
            {activeDrones.map((type, idx) => (
                <DroneComponent key={`${type}-${idx}`} type={type} index={idx} />
            ))}
        </group>
    );
};

export default DroneSystem;
