import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface KillEffectProps {
    position: [number, number, number];
    onComplete: () => void;
}

export const KillEffect: React.FC<KillEffectProps> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!groupRef.current) return;

        // Animation duration 0.6 seconds
        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(1, elapsed / 0.6);

        // Expand explosion
        groupRef.current.scale.setScalar(1 + progress * 4);

        // Fade out
        groupRef.current.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.opacity = Math.max(0, 1 - progress * 1.5);
                mat.transparent = true;
            }
        });

        // Complete
        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Core explosion sphere */}
            <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial
                    color="#ff4400"
                    emissive="#ff4400"
                    emissiveIntensity={8}
                    transparent
                />
            </mesh>

            {/* Shockwave Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshStandardMaterial
                    color="#ffaa00"
                    emissive="#ffaa00"
                    emissiveIntensity={5}
                    side={THREE.DoubleSide}
                    transparent
                />
            </mesh>

            {/* Debris Particles */}
            {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const distance = 0.6;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * distance,
                            0.2,
                            Math.sin(angle) * distance
                        ]}
                    >
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial
                            color="#ffaa00"
                            emissive="#ffaa00"
                            emissiveIntensity={6}
                            transparent
                        />
                    </mesh>
                );
            })}

            {/* Flash Light */}
            <pointLight color="#ff4400" intensity={15} distance={8} decay={2} />
        </group>
    );
};
