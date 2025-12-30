import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEffects } from '../utils/soundEffects';

interface OrbitalStrikeProps {
    position: [number, number, number];
    onComplete: () => void;
}

const OrbitalStrike: React.FC<OrbitalStrikeProps> = ({ position, onComplete }) => {
    const beamRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [progress, setProgress] = useState(0);
    const startTime = useRef(performance.now());

    useEffect(() => {
        // Sound for the strike
        soundEffects.play('nova_release' as any); // Reusing nova_release for now or similar heavy sound

        // Dispatch event to damage enemies in area
        const damageEvent = new CustomEvent('orbital-impact', {
            detail: {
                position: new THREE.Vector3(...position),
                radius: 12,
                damage: 500 // Massive damage
            }
        });
        window.dispatchEvent(damageEvent);

        const timeout = setTimeout(onComplete, 3000);
        return () => clearTimeout(timeout);
    }, [position, onComplete]);

    useFrame((state, delta) => {
        const elapsed = (performance.now() - startTime.current) / 1000;
        setProgress(Math.min(1, elapsed / 3));

        if (beamRef.current) {
            // Initial flash and then fade out
            if (elapsed < 0.2) {
                beamRef.current.scale.x = THREE.MathUtils.lerp(0, 5, elapsed / 0.2);
                beamRef.current.scale.z = THREE.MathUtils.lerp(0, 5, elapsed / 0.2);
            } else if (elapsed < 0.5) {
                beamRef.current.scale.x = 5;
                beamRef.current.scale.z = 5;
            } else {
                const fade = 1 - ((elapsed - 0.5) / 2.5);
                beamRef.current.scale.x = 5 * fade;
                beamRef.current.scale.z = 5 * fade;
                if (beamRef.current.material instanceof THREE.MeshStandardMaterial) {
                    beamRef.current.material.opacity = fade * 0.8;
                }
            }
        }

        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 2;
            const ringScale = elapsed < 0.5 ? elapsed * 15 : 7.5 + Math.sin(elapsed * 10) * 0.5;
            ringRef.current.scale.set(ringScale, ringScale, 1);
            if (ringRef.current.material instanceof THREE.MeshStandardMaterial) {
                ringRef.current.material.opacity = Math.max(0, 1 - elapsed / 2);
            }
        }
    });

    return (
        <group position={position}>
            {/* Main Ion Beam */}
            <mesh ref={beamRef} position={[0, 25, 0]}>
                <cylinderGeometry args={[1, 1, 50, 32, 1, true]} />
                <meshStandardMaterial
                    color="#00f2ff"
                    emissive="#00f2ff"
                    emissiveIntensity={10}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Ground Impact Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <circleGeometry args={[6, 32]} />
                <meshStandardMaterial
                    color="#00f2ff"
                    emissive="#00f2ff"
                    emissiveIntensity={5}
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Impact Expansion Ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
                <ringGeometry args={[0.9, 1, 64]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#00f2ff"
                    emissiveIntensity={20}
                    transparent
                    opacity={1}
                />
            </mesh>

            {/* Central Core Light */}
            <pointLight distance={30} intensity={50} color="#00ffff" />
        </group>
    );
};

export default OrbitalStrike;
