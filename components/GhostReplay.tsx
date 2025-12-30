
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

/**
 * GhostReplay Component
 * Displays "echoes" of past runs or other players for asynchronous co-op feel.
 */
const GhostReplay: React.FC = () => {
    const ghostData = useGameStore(s => s.ghostData);

    if (ghostData.length === 0) return null;

    return (
        <group>
            {ghostData.map((ghost, idx) => (
                <GhostEntity key={idx} path={ghost.path} index={idx} />
            ))}
        </group>
    );
};

const GhostEntity: React.FC<{ path: [number, number, number][], index: number }> = ({ path, index }) => {
    const meshRef = useRef<THREE.Group>(null);
    const speed = 1.0;

    useFrame((state) => {
        if (!meshRef.current || path.length === 0) return;

        const time = state.clock.getElapsedTime() * speed;
        const frameIdx = Math.floor(time * 10) % path.length; // 10fps record
        const nextFrameIdx = (frameIdx + 1) % path.length;

        const alpha = (time * 10) % 1;
        const p1 = new THREE.Vector3(...path[frameIdx]);
        const p2 = new THREE.Vector3(...path[nextFrameIdx]);

        meshRef.current.position.lerpVectors(p1, p2, alpha);
        meshRef.current.rotation.y += 0.02;
    });

    return (
        <group ref={meshRef}>
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshStandardMaterial color="#00ffff" transparent opacity={0.3} wireframe />
            </mesh>
            <pointLight color="#00ffff" intensity={1} distance={5} />
        </group>
    );
};

export default GhostReplay;
