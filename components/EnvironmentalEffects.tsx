import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme, NightEvent } from '../types';

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
    const { islandTheme, isTimeSlowed, currentNightEvent, weather } = useGameStore();
    const particlesRef = useRef<THREE.InstancedMesh>(null);
    const starfallRef = useRef<THREE.InstancedMesh>(null);
    const particles = useRef<Particle[]>([]);
    const starfallParticles = useRef<Particle[]>([]);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // ION STORM STATE
    const [lightningFlash, setLightningFlash] = useState(0);

    // Weather Init
    useMemo(() => {
        starfallParticles.current = [];
        for (let i = 0; i < 50; i++) {
            starfallParticles.current.push({
                position: new THREE.Vector3(Math.random() * 60 - 30, Math.random() * 40, Math.random() * 60 - 30),
                velocity: new THREE.Vector3(0, -1.5 - Math.random(), 0),
                rotation: 0, rotationSpeed: 0, life: 0, maxLife: 2, size: 0.3
            });
        }
    }, [islandTheme]);

    // Detect mobile for performance
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const particleMultiplier = isMobile ? 0.35 : 1.0;

    // Initialize particles based on theme
    useMemo(() => {
        particles.current = [];
        let count = 0;
        let config = { color: 0xffffff, size: 1 };

        switch (islandTheme) {
            case IslandTheme.FOREST:
                count = Math.floor(60 * particleMultiplier);
                config = { color: 0x4ade80, size: 0.15 };
                break;
            case IslandTheme.DESERT:
                count = Math.floor(150 * particleMultiplier);
                config = { color: 0xfde047, size: 0.1 };
                break;
            case IslandTheme.VOLCANO:
                count = Math.floor(100 * particleMultiplier);
                config = { color: 0xff4400, size: 0.12 };
                break;
            case IslandTheme.ARCTIC:
                count = Math.floor(120 * particleMultiplier);
                config = { color: 0xffffff, size: 0.18 };
                break;
            case IslandTheme.VOID:
                count = Math.floor(80 * particleMultiplier);
                config = { color: 0xa855f7, size: 0.2 };
                break;
            case IslandTheme.CELESTIAL:
                count = Math.floor(200 * particleMultiplier);
                config = { color: 0x00f2ff, size: 0.1 };
                break;
            case IslandTheme.CRYSTAL:
                count = Math.floor(90 * particleMultiplier);
                config = { color: 0xf0abfc, size: 0.25 };
                break;
            case IslandTheme.CORRUPTION:
                count = Math.floor(110 * particleMultiplier);
                config = { color: 0x84cc16, size: 0.14 };
                break;
            case IslandTheme.ABYSS:
                count = Math.floor(130 * particleMultiplier);
                config = { color: 0x4338ca, size: 0.12 };
                break;
            case IslandTheme.ETERNAL_SHADOW:
                count = Math.floor(250 * particleMultiplier);
                config = { color: 0xffffff, size: 0.08 };
                break;
        }

        // Create particles
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 45 + 5;

            particles.current.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.random() * 25,
                    Math.sin(angle) * radius
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    -Math.random() * 0.3 - 0.1,
                    (Math.random() - 0.5) * 0.4
                ),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                life: Math.random() * 10,
                maxLife: 10,
                size: config.size * (0.5 + Math.random() * 1.5)
            });
        }
    }, [islandTheme, particleMultiplier]);

    useFrame((state, delta) => {
        if (!particlesRef.current) return;

        const playerPos = (window as any).playerPos || new THREE.Vector3(0, 0, 0);
        const t = state.clock.getElapsedTime();

        const isBlizzard = weather === 'BLIZZARD';
        const isSandstorm = weather === 'SANDSTORM';
        const isFog = weather === 'FOG';

        particles.current.forEach((particle, i) => {
            particle.life += delta;

            const baseWindX = isBlizzard ? -4.5 : (isSandstorm ? -6.0 : 0);
            const baseWindY = isBlizzard ? -1.5 : (isSandstorm ? 0.5 : 0);

            switch (islandTheme) {
                case IslandTheme.FOREST:
                    particle.velocity.y = -0.2 + baseWindY;
                    particle.velocity.x = Math.sin(particle.life + i) * 0.15 + baseWindX;
                    break;
                case IslandTheme.DESERT:
                    particle.velocity.x = -1.5 + baseWindX;
                    particle.velocity.y = (Math.random() - 0.5) * 0.2 + baseWindY;
                    break;
                case IslandTheme.VOLCANO:
                    particle.velocity.y = 0.4 + Math.sin(t + i) * 0.2 + baseWindY;
                    particle.velocity.x = Math.cos(t * 0.5 + i) * 0.2 + baseWindX;
                    break;
                case IslandTheme.ARCTIC:
                    particle.velocity.y = -0.8 + baseWindY;
                    particle.velocity.x = -1.2 + Math.sin(t * 0.5) * 0.5 + baseWindX;
                    break;
                case IslandTheme.VOID:
                    particle.velocity.y = Math.sin(t + i * 0.5) * 0.5 + baseWindY;
                    particle.velocity.x = Math.cos(t + i * 0.5) * 0.5 + baseWindX;
                    break;
                default:
                    particle.velocity.y = -0.5 + baseWindY;
                    particle.velocity.x = baseWindX;
            }

            const spdMult = isTimeSlowed ? 0.2 : 1.0;
            particle.position.add(particle.velocity.clone().multiplyScalar(delta * 8 * spdMult));

            if (particle.position.y < -2 || particle.position.y > 35 || particle.life > particle.maxLife) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 50 + 5;
                particle.position.set(
                    playerPos.x + Math.cos(angle) * radius - (baseWindX * 5),
                    islandTheme === IslandTheme.VOLCANO ? -1 : 32,
                    playerPos.z + Math.sin(angle) * radius
                );
                particle.life = 0;
            }

            dummy.position.copy(particle.position);
            dummy.rotation.set(particle.rotation, particle.rotation, particle.rotation);
            dummy.scale.setScalar(particle.size * (isBlizzard || isSandstorm ? 2.5 : 1));
            dummy.updateMatrix();
            particlesRef.current!.setMatrixAt(i, dummy.matrix);
        });

        particlesRef.current.instanceMatrix.needsUpdate = true;

        // WEATHER LOGIC
        if (currentNightEvent === NightEvent.STARFALL && starfallRef.current) {
            starfallParticles.current.forEach((p, i) => {
                p.position.add(p.velocity);
                if (p.position.y < 0) {
                    p.position.set(playerPos.x + (Math.random() * 60 - 30), 40, playerPos.z + (Math.random() * 60 - 30));
                }
                dummy.position.copy(p.position);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.setScalar(p.size);
                dummy.updateMatrix();
                starfallRef.current!.setMatrixAt(i, dummy.matrix);
            });
            starfallRef.current.instanceMatrix.needsUpdate = true;
        }

        if (currentNightEvent === NightEvent.ION_STORM || weather === 'STORM') {
            if (Math.random() < 0.015) { // 1.5% chance per frame for lightning
                setLightningFlash(1.0);
            }
        }

        if (lightningFlash > 0) {
            setLightningFlash(prev => Math.max(0, prev - delta * 4));
        }

    });

    const getParticleConfig = () => {
        switch (islandTheme) {
            case IslandTheme.FOREST: return { color: 0x4ade80, opacity: 0.8, count: Math.floor(60 * particleMultiplier) };
            case IslandTheme.VOLCANO: return { color: 0xff4400, opacity: 0.9, count: Math.floor(100 * particleMultiplier) };
            case IslandTheme.ARCTIC: return { color: 0xffffff, opacity: 0.9, count: Math.floor(120 * particleMultiplier) };
            default: return { color: 0xffffff, opacity: 0.5, count: 60 };
        }
    };

    const config = getParticleConfig();

    return (
        <group>
            <instancedMesh ref={particlesRef} args={[undefined, undefined, config.count]} frustumCulled={false}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial
                    color={isTimeSlowed ? 0x00ffff : config.color}
                    transparent
                    opacity={config.opacity}
                    emissive={isTimeSlowed ? 0x00ffff : config.color}
                    emissiveIntensity={isTimeSlowed ? 40 : (islandTheme === IslandTheme.VOLCANO ? 10 : 2)}
                    depthWrite={false}
                />
            </instancedMesh>

            {/* STARFALL MESH */}
            {currentNightEvent === NightEvent.STARFALL && (
                <instancedMesh ref={starfallRef} args={[undefined, undefined, 50]} frustumCulled={false}>
                    <coneGeometry args={[0.2, 1, 8]} />
                    <meshBasicMaterial color="#ffff00" />
                </instancedMesh>
            )}

            {/* ION STORM FLASH */}
            {lightningFlash > 0 && (
                <mesh position={(window as any).playerPos || [0, 0, 0]}>
                    <sphereGeometry args={[50, 16, 16]} />
                    <meshBasicMaterial color="white" transparent opacity={lightningFlash * 0.3} side={THREE.BackSide} />
                </mesh>
            )}
            {/* Dynamic Atmospheric Light Pulses */}
            <pointLight
                position={[0, 15, 0]}
                intensity={islandTheme === IslandTheme.VOLCANO ? (2 + Math.sin(Date.now() * 0.002) * 1.5) : 0.5}
                color={islandTheme === IslandTheme.VOLCANO ? "#ff4400" : (islandTheme === IslandTheme.ARCTIC ? "#00ffff" : "#4ade80")}
                distance={100}
            />
        </group>
    );
};

export default EnvironmentalEffects;
