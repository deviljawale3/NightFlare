
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { EnemyClass } from '../types';

interface ColossalTitanProps {
    type: EnemyClass;
    isAttacking: boolean;
    hitTime: number;
}

const ColossalTitan: React.FC<ColossalTitanProps> = ({ type, isAttacking, hitTime }) => {
    const group = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const leftShoulder = useRef<THREE.Mesh>(null);
    const rightShoulder = useRef<THREE.Mesh>(null);

    const config = useMemo(() => {
        switch (type) {
            case 'TITAN_YMIR':
                return { color: '#00ffff', core: '#ffffff', scale: 8, particle: '#ffffff' };
            case 'TITAN_PROMETHEUS':
                return { color: '#ff4400', core: '#ffff00', scale: 10, particle: '#ffaa00' };
            case 'TITAN_KRAKEN':
                return { color: '#4338ca', core: '#a855f7', scale: 9, particle: '#4338ca' };
            default:
                return { color: '#ff0000', core: '#ff0000', scale: 8, particle: '#ff0000' };
        }
    }, [type]);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();

        // Slow breathing animation
        group.current.scale.setScalar(config.scale + Math.sin(t * 0.5) * 0.1);

        if (coreRef.current) {
            coreRef.current.rotation.y += 0.05;
            coreRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.05);
        }

        if (leftShoulder.current) {
            leftShoulder.current.rotation.z += 0.02;
        }
        if (rightShoulder.current) {
            rightShoulder.current.rotation.z -= 0.02;
        }
    });

    return (
        <group ref={group}>
            {/* Massive Base Body */}
            <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[2, 6, 2]} />
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Weak Point: Central Core */}
            <mesh ref={coreRef} position={[0, 5, 0.8]} castShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color={config.core}
                    emissive={config.core}
                    emissiveIntensity={10}
                    transparent
                    opacity={0.9}
                />
                <pointLight color={config.core} intensity={10} distance={15} />
            </mesh>

            {/* Weak Point: Shoulders */}
            <mesh ref={leftShoulder} position={[-1.5, 6, 0]} castShadow>
                <torusGeometry args={[0.4, 0.1, 16, 32]} />
                <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
            </mesh>
            <mesh ref={rightShoulder} position={[1.5, 6, 0]} castShadow>
                <torusGeometry args={[0.4, 0.1, 16, 32]} />
                <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
            </mesh>

            {/* Visual Effects */}
            <Sparkles count={50} scale={10} size={6} speed={0.5} opacity={0.5} color={config.particle} />

            {/* Ground Impact Rings */}
            <Torus args={[3, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color={config.color} transparent opacity={0.3} emissive={config.color} />
            </Torus>
        </group>
    );
};

export default ColossalTitan;
