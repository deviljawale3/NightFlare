import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingTextProps {
    id: string;
    position: [number, number, number];
    text: string;
    color: string;
    onComplete: (id: string) => void;
    scale?: number;
}

const FloatingTextItem: React.FC<FloatingTextProps> = ({ id, position, text, color, onComplete, scale = 1 }) => {
    const ref = useRef<THREE.Group>(null);
    const startTime = useRef(performance.now());
    const startPos = useMemo(() => new THREE.Vector3(...position), []);

    useFrame(() => {
        if (!ref.current) return;

        const elapsed = (performance.now() - startTime.current) / 1000;
        const duration = 1.0;

        if (elapsed >= duration) {
            onComplete(id);
            return;
        }

        // Float up
        ref.current.position.copy(startPos).add(new THREE.Vector3(0, elapsed * 1.5, 0));

        // Scale animation (pop in then fade out)
        let s = 1;
        if (elapsed < 0.1) s = elapsed * 10;
        else if (elapsed > 0.7) s = 1 - (elapsed - 0.7) * 3.3;

        ref.current.scale.setScalar(s * scale);

        // Always look at camera
        ref.current.lookAt(ref.current.position.clone().add(new THREE.Vector3(0, 0, 1))); // Billboard effect
    });

    return (
        <group ref={ref} position={position}>
            <Text
                color={color}
                fontSize={0.5}
                outlineWidth={0.05}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
            >
                {text}
            </Text>
        </group>
    );
};

export const DamageNumbers: React.FC = () => {
    const [texts, setTexts] = React.useState<FloatingTextProps[]>([]);

    React.useEffect(() => {
        const handleDamage = (e: any) => {
            const { position, damage, isCrit } = e.detail;
            const id = Math.random().toString(36).substr(2, 9);
            const color = isCrit ? '#ffaa00' : '#ffffff';
            const displayScale = isCrit ? 1.5 : 1.0;

            setTexts(prev => [...prev, {
                id,
                position,
                text: Math.round(damage).toString(),
                color,
                onComplete: (doneId) => setTexts(current => current.filter(t => t.id !== doneId)),
                scale: displayScale
            }]);
        };

        window.addEventListener('enemy-hit-visual', handleDamage); // We will need to update where this event is dispatched
        return () => {
            window.removeEventListener('enemy-hit-visual', handleDamage);
        };
    }, []);

    return (
        <group>
            {texts.map(t => (
                <FloatingTextItem key={t.id} {...t} />
            ))}
        </group>
    );
};
