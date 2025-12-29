import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: number;
    rotationSpeed: number;
    life: number;
    maxLife: number;
    size: number;
}

const EnvironmentalEffects: React.FC = () => {
    const { islandTheme } = useGameStore();
    const particlesRef = useRef<THREE.InstancedMesh>(null);
    const particles = useRef<Particle[]>([]);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Detect mobile for performance
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const particleMultiplier = isMobile ? 0.5 : 1.0;

    // Initialize particles based on theme
    useMemo(() => {
        particles.current = [];
        let count = 0;
        let config = { color: 0xffffff, size: 1 };

        switch (islandTheme) {
            case IslandTheme.FOREST:
                count = Math.floor(30 * particleMultiplier); // OPTIMIZED: Reduced from 50
                config = { color: 0x4ade80, size: 0.3 };
                break;
            case IslandTheme.VOLCANO:
                count = Math.floor(40 * particleMultiplier); // OPTIMIZED: Reduced from 75
                config = { color: 0x52525b, size: 0.2 };
                break;
            case IslandTheme.ARCTIC:
                count = Math.floor(50 * particleMultiplier); // OPTIMIZED: Reduced from 100
                config = { color: 0xffffff, size: 0.25 };
                break;
        }

        // Create particles
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40 + 10;

            particles.current.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.random() * 30 + 10,
                    Math.sin(angle) * radius
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    -Math.random() * 0.5 - 0.2,
                    (Math.random() - 0.5) * 0.5
                ),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                life: Math.random() * 10,
                maxLife: 10,
                size: config.size * (0.8 + Math.random() * 0.4)
            });
        }
    }, [islandTheme, particleMultiplier]);

    useFrame((state, delta) => {
        if (!particlesRef.current) return;

        const playerPos = (window as any).playerPos || new THREE.Vector3(0, 0, 0);

        particles.current.forEach((particle, i) => {
            // Update particle physics
            particle.life += delta;

            // Different behavior per theme
            switch (islandTheme) {
                case IslandTheme.FOREST:
                    // Gentle falling with drift
                    particle.velocity.y = -0.3;
                    particle.velocity.x = Math.sin(particle.life) * 0.2;
                    particle.rotation += particle.rotationSpeed;
                    break;

                case IslandTheme.VOLCANO:
                    // Rising ash with drift
                    particle.velocity.y = 0.2 + Math.sin(particle.life * 2) * 0.1;
                    particle.velocity.x = (Math.random() - 0.5) * 0.3;
                    particle.velocity.z = (Math.random() - 0.5) * 0.3;
                    break;

                case IslandTheme.ARCTIC:
                    // Snowfall with wind
                    particle.velocity.y = -0.4;
                    particle.velocity.x = Math.sin(particle.life * 0.5) * 0.3;
                    particle.rotation += particle.rotationSpeed * 0.5;
                    break;
            }

            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(delta * 10));

            // Respawn if out of bounds or too old
            if (particle.position.y < 0 || particle.life > particle.maxLife) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 40 + 10;

                particle.position.set(
                    playerPos.x + Math.cos(angle) * radius,
                    islandTheme === IslandTheme.VOLCANO ? 0 : 30, // Ash starts low, others high
                    playerPos.z + Math.sin(angle) * radius
                );
                particle.life = 0;
            }

            // Update instance matrix
            dummy.position.copy(particle.position);
            dummy.rotation.z = particle.rotation;
            dummy.scale.setScalar(particle.size);
            dummy.updateMatrix();
            particlesRef.current!.setMatrixAt(i, dummy.matrix);
        });

        particlesRef.current.instanceMatrix.needsUpdate = true;
    });

    // Get particle color and material based on theme
    const getParticleConfig = () => {
        switch (islandTheme) {
            case IslandTheme.FOREST:
                return {
                    color: new THREE.Color(0x4ade80),
                    opacity: 0.6,
                    count: Math.floor(30 * particleMultiplier) // OPTIMIZED: Reduced from 50
                };
            case IslandTheme.VOLCANO:
                return {
                    color: new THREE.Color(0x52525b),
                    opacity: 0.4,
                    count: Math.floor(40 * particleMultiplier) // OPTIMIZED: Reduced from 75
                };
            case IslandTheme.ARCTIC:
                return {
                    color: new THREE.Color(0xffffff),
                    opacity: 0.7,
                    count: Math.floor(50 * particleMultiplier) // OPTIMIZED: Reduced from 100
                };
            default:
                return {
                    color: new THREE.Color(0xffffff),
                    opacity: 0.5,
                    count: 30 // OPTIMIZED: Reduced from 50
                };
        }
    };

    const config = getParticleConfig();

    return (
        <group>
            {/* Particle System */}
            <instancedMesh
                ref={particlesRef}
                args={[undefined, undefined, config.count]}
                frustumCulled={false}
            >
                {/* Particle geometry - small plane for leaves/snow, sphere for ash */}
                {islandTheme === IslandTheme.VOLCANO ? (
                    <sphereGeometry args={[0.1, 4, 4]} />
                ) : (
                    <planeGeometry args={[0.3, 0.3]} />
                )}

                {/* Particle material */}
                <meshBasicMaterial
                    color={config.color}
                    transparent
                    opacity={config.opacity}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </instancedMesh>

            {/* Ambient lighting enhancement per theme */}
            {islandTheme === IslandTheme.FOREST && (
                <ambientLight intensity={0.1} color="#4ade80" />
            )}
            {islandTheme === IslandTheme.VOLCANO && (
                <>
                    <ambientLight intensity={0.15} color="#f97316" />
                    <pointLight position={[0, 5, 0]} intensity={0.3} distance={50} color="#dc2626" />
                </>
            )}
            {islandTheme === IslandTheme.ARCTIC && (
                <ambientLight intensity={0.1} color="#67e8f9" />
            )}
        </group>
    );
};

export default EnvironmentalEffects;
