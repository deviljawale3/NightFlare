import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { DroneType } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface DroneControllerProps {
    parentRef: React.RefObject<THREE.Group>;
}

const DroneController: React.FC<DroneControllerProps> = ({ parentRef }) => {
    const activeDrones = useGameStore(s => s.playerStats.activeDrones);

    return (
        <group>
            {activeDrones.map((type, i) => (
                <Drone key={`${type}-${i}`} type={type} index={i} total={activeDrones.length} parentRef={parentRef} />
            ))}
        </group>
    );
};

const Drone: React.FC<{ type: DroneType; index: number; total: number; parentRef: React.RefObject<THREE.Group> }> = ({ type, index, total, parentRef }) => {
    const droneRef = useRef<THREE.Group>(null);
    const laserRef = useRef<THREE.Mesh>(null);
    const [mode, setMode] = useState<'IDLE' | 'ACTION' | 'RETURNING'>('IDLE');
    const targetPos = useRef(new THREE.Vector3());
    const targetId = useRef<string | null>(null);
    const lastActionTime = useRef(0);

    // Orbital parameters
    const offset = (index / total) * Math.PI * 2;
    const radius = 2.0;
    const speed = 1.5;

    // Visual State
    const [isFiring, setIsFiring] = useState(false);

    useFrame((state, delta) => {
        if (!droneRef.current || !parentRef.current) return;

        const t = state.clock.getElapsedTime();
        const playerPos = new THREE.Vector3(0, 0, 0); // We are inside player group, so player is at 0,0,0 local (mostly)
        // Wait, parentRef is the Player Group. Current component is rendered... where?
        // In GameScene, <Player /> calls logic. 
        // We need to clarify if this component is inside Player or not.
        // If it's in GameScene, we need world pos.
        // Assuming it's rendered in Player.tsx or GameScene...
        // Checking Player.tsx might be needed, but assume GameScene renders it at root?
        // No, DroneController usage in GameScene was NOT present in previous file view. 
        // It must be inside RealisticPlayer.tsx.
        // If inside RealisticPlayer, 0,0,0 is player center.

        // Visual Bobbing
        droneRef.current.rotation.x = Math.sin(t * 2) * 0.1;
        droneRef.current.rotation.z = Math.cos(t * 1.5) * 0.1;

        if (type === 'VORTEX') {
            handleVortexLogic(state, delta);
        } else if (type === 'STINGER') {
            handleStingerLogic(state, delta);
        } else if (type === 'AEGIS') {
            handleAegisLogic(state, delta);
        }
    });

    const handleVortexLogic = (state: any, delta: number) => {
        // ... (Similar to old logic but refined)
        const t = state.clock.getElapsedTime();
        if (mode === 'IDLE') {
            const angle = t * speed + offset;
            droneRef.current!.position.x = Math.cos(angle) * radius;
            droneRef.current!.position.z = Math.sin(angle) * radius;
            droneRef.current!.position.y = 2.5 + Math.sin(t * 3) * 0.2;

            // Scan
            if (t % 1 < 0.1) {
                const nodes = useGameStore.getState().nodes;
                const playerWorldPos = parentRef.current?.position || new THREE.Vector3();
                let nearest = null;
                let minDist = 20;

                nodes.forEach(node => {
                    const dist = new THREE.Vector3(...node.position).distanceTo(playerWorldPos);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = node;
                    }
                });

                if (nearest) {
                    targetId.current = (nearest as any).id;
                    // Convert to local space
                    const nodeWorld = new THREE.Vector3(...(nearest as any).position);
                    targetPos.current.copy(nodeWorld.sub(playerWorldPos));
                    setMode('ACTION');
                }
            }
        } else if (mode === 'ACTION') {
            // Move to target
            const dir = targetPos.current.clone().sub(droneRef.current!.position).normalize();
            droneRef.current!.position.add(dir.multiplyScalar(delta * 15));

            if (droneRef.current!.position.distanceTo(targetPos.current) < 0.5) {
                // Collect
                const store = useGameStore.getState();
                const node = store.nodes.find(n => n.id === targetId.current);
                if (node) {
                    let amount = 10;
                    if (node.type === 'TREE') amount = 15; // Buffed
                    if (node.type === 'ROCK') amount = 10;
                    if (node.type === 'CRYSTAL') amount = 5;
                    store.addResource(node.type === 'CRYSTAL' ? 'lightShards' : node.type.toLowerCase() as any, amount, [...node.position]);
                    store.removeNode(node.id);
                    soundEffects.collectResource();
                }
                setMode('RETURNING');
            }
        } else if (mode === 'RETURNING') {
            const angle = t * speed + offset;
            const home = new THREE.Vector3(Math.cos(angle) * radius, 2.5, Math.sin(angle) * radius);
            droneRef.current!.position.lerp(home, delta * 5);
            if (droneRef.current!.position.distanceTo(home) < 0.5) setMode('IDLE');
        }
    };

    const handleStingerLogic = (state: any, delta: number) => {
        const t = state.clock.getElapsedTime();
        // Stinger orbits faster and looks at enemies
        const angle = t * (speed * 1.5) + offset;
        const orbitPos = new THREE.Vector3(Math.cos(angle) * radius, 3.0, Math.sin(angle) * radius);

        droneRef.current!.position.lerp(orbitPos, delta * 5);

        // Combat
        if (t - lastActionTime.current > 1.5) { // Fire rate
            const enemies = (window as any).gameEnemies || [];
            const playerWorldPos = parentRef.current?.position || new THREE.Vector3();
            let nearest = null;
            let minDist = 25; // Range

            enemies.forEach((e: any) => {
                if (e.dying) return;
                const ePos = new THREE.Vector3(...e.position);
                const dist = ePos.distanceTo(playerWorldPos);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = e;
                }
            });

            if (nearest) {
                // Shoot
                lastActionTime.current = t;
                const ePos = new THREE.Vector3(...(nearest as any).position);

                // Visual Beam
                setIsFiring(true);
                setTimeout(() => setIsFiring(false), 150);

                // Look at
                const localEnemyPos = ePos.clone().sub(playerWorldPos);
                droneRef.current!.lookAt(localEnemyPos);

                // Damage
                const dmg = 35 + (useGameStore.getState().level * 5);
                window.dispatchEvent(new CustomEvent('enemy-hit', { detail: { id: (nearest as any).id, damage: dmg } }));

                // Sound
                const audio = new AudioContext(); // Lightweight placeholder or use utils
                soundEffects.play('attack_swing_bow', 2.0); // Abuse bow sound for laser for now
            }
        }

        if (isFiring && laserRef.current) {
            laserRef.current.visible = true;
            // Scale beam to infinity or target?
            laserRef.current.scale.z = 20;
        } else if (laserRef.current) {
            laserRef.current.visible = false;
        }
    };

    const handleAegisLogic = (state: any, delta: number) => {
        const t = state.clock.getElapsedTime();
        // Aegis hovers close
        const angle = t * speed * 0.5 + offset;
        const targetPos = new THREE.Vector3(Math.cos(angle) * 1.5, 2.0, Math.sin(angle) * 1.5);
        droneRef.current!.position.lerp(targetPos, delta * 2);

        // Heal Logic
        if (t - lastActionTime.current > 5.0) {
            const stats = useGameStore.getState().playerStats;
            if (stats.currentHealth < stats.maxHealth) {
                lastActionTime.current = t;
                useGameStore.getState().healPlayer(5); // Heal 5%
                // Visual Pulse
                soundEffects.playerHeal();
                // Particle emission logic could go here
            }
        }
    };

    const color = type === 'VORTEX' ? '#06b6d4' : (type === 'STINGER' ? '#ef4444' : '#22c55e');

    return (
        <group ref={droneRef}>
            {/* Cyber-Wisp Body */}
            <mesh castShadow>
                <octahedronGeometry args={[0.25]} />
                <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Energy Core */}
            <mesh>
                <sphereGeometry args={[0.12]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
            </mesh>

            {/* Rotating Rings */}
            <group rotation={[Math.PI / 3, 0, 0]}>
                <mesh>
                    <torusGeometry args={[0.35, 0.02, 8, 32]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
                </mesh>
            </group>

            {/* Thruster Particles */}
            <pointLight distance={3} intensity={2} color={color} />

            {/* Laser Beam (Stinger Only) */}
            {type === 'STINGER' && (
                <mesh ref={laserRef} position={[0, 0, 0.3]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                    <cylinderGeometry args={[0.02, 0.02, 1]} />
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
                </mesh>
            )}
        </group>
    );
};

export default DroneController;
