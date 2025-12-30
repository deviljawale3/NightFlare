import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface LightningEffectProps {
    points: [number, number, number][];
    onComplete: () => void;
}

const LightningEffect: React.FC<LightningEffectProps> = ({ points, onComplete }) => {
    // Generate jittery points for "lightning" look
    const jitterPoints = useMemo(() => {
        const result: THREE.Vector3[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const start = new THREE.Vector3(...points[i]);
            const end = new THREE.Vector3(...points[i + 1]);
            const dist = start.distanceTo(end);
            const segments = Math.max(2, Math.floor(dist * 2));

            result.push(start);
            for (let j = 1; j < segments; j++) {
                const alpha = j / segments;
                const p = new THREE.Vector3().lerpVectors(start, end, alpha);
                p.x += (Math.random() - 0.5) * 0.4;
                p.y += (Math.random() - 0.5) * 0.4;
                p.z += (Math.random() - 0.5) * 0.4;
                result.push(p);
            }
        }
        result.push(new THREE.Vector3(...points[points.length - 1]));
        return result;
    }, [points]);

    React.useEffect(() => {
        const timeout = setTimeout(onComplete, 150);
        return () => clearTimeout(timeout);
    }, [onComplete]);

    return (
        <Line
            points={jitterPoints}
            color="#00f2ff"
            lineWidth={3}
            transparent
            opacity={0.8}
        />
    );
};

export default LightningEffect;
