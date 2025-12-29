import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState } from '../types';

const RealisticPlayer: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const lArmGroup = useRef<THREE.Group>(null);
    const rArmGroup = useRef<THREE.Group>(null);
    const lLegGroup = useRef<THREE.Group>(null);
    const rLegGroup = useRef<THREE.Group>(null);

    const velocity = useRef(new THREE.Vector3());
    const [isAttacking, setIsAttacking] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isDamaged, setIsDamaged] = useState(false);
    const [verticalVelocity, setVerticalVelocity] = useState(0);
    const [isGrounded, setIsGrounded] = useState(true);

    const gameState = useGameStore(s => s.gameState);
    const playerStats = useGameStore(s => s.playerStats);
    const triggerScreenShake = useGameStore(s => s.triggerScreenShake);
    const setPlayerGrounded = useGameStore(s => s.setPlayerGrounded);

    const keys = useRef<{ [key: string]: boolean }>({});
    const animationTimer = useRef(0);

    // Realistic Materials
    const skinTone = '#fddba3';
    const shirtColor = '#2d5a27'; // Tactical Green
    const pantsColor = '#1a1a1a'; // Dark tactical
    const bootsColor = '#2a1a10';

    const handleAttack = () => {
        if (!isAttacking && !isHarvesting) {
            setIsAttacking(true);
            animationTimer.current = 0;
            if (groupRef.current) {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('player-attack-hitbox', {
                        detail: {
                            position: groupRef.current!.position.clone(),
                            range: playerStats.attackRange + 1.8,
                            damage: playerStats.attackDamage
                        }
                    }));
                }, 150);
            }
            setTimeout(() => setIsAttacking(false), 500);
            triggerScreenShake(0.6);
        }
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;

        // 1. ADVANCED MOVEMENT ENGINE
        let moveSpeed = playerStats.speed * delta * 1.5;
        let mX = (window as any).joystickX || 0;
        let mZ = (window as any).joystickY || 0;

        if (mX === 0 && mZ === 0) {
            if (keys.current['KeyW'] || keys.current['ArrowUp']) mZ -= 1;
            if (keys.current['KeyS'] || keys.current['ArrowDown']) mZ += 1;
            if (keys.current['KeyA'] || keys.current['ArrowLeft']) mX -= 1;
            if (keys.current['KeyD'] || keys.current['ArrowRight']) mX += 1;
        }

        const isMoving = mX !== 0 || mZ !== 0;

        if (isMoving) {
            const length = Math.sqrt(mX * mX + mZ * mZ);
            mX /= length; mZ /= length;
            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, mX * moveSpeed, 0.2);
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, mZ * moveSpeed, 0.2);
            const targetHeading = Math.atan2(mX, mZ);
            let rotDiff = targetHeading - groupRef.current.rotation.y;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            groupRef.current.rotation.y += rotDiff * 0.25;
        } else {
            velocity.current.x *= 0.85;
            velocity.current.z *= 0.85;
        }

        groupRef.current.position.x += velocity.current.x;
        groupRef.current.position.z += velocity.current.z;

        // 2. CONNECTED CHARACTER ANIMATIONS
        const t = state.clock.getElapsedTime();
        const speed = velocity.current.length() * 60;

        if (speed > 0.1 && isGrounded) {
            // Natural Running Bounce
            const walkTime = t * 14;
            lLegGroup.current!.rotation.x = Math.sin(walkTime) * 0.7;
            rLegGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * 0.7;
            lArmGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * 0.5;
            if (!isAttacking) rArmGroup.current!.rotation.x = Math.sin(walkTime) * 0.5;

            bodyRef.current!.rotation.z = Math.sin(walkTime) * 0.08;
            bodyRef.current!.position.y = Math.abs(Math.sin(walkTime * 2)) * 0.08;
        } else {
            // Breathing Idle
            const breathe = Math.sin(t * 1.5);
            bodyRef.current!.position.y = breathe * 0.02;
            lArmGroup.current!.rotation.z = -0.15 + breathe * 0.05;
            rArmGroup.current!.rotation.z = 0.15 - breathe * 0.05;
            lLegGroup.current!.rotation.x = 0;
            rLegGroup.current!.rotation.x = 0;
        }

        // Action States
        if (isAttacking) {
            const p = animationTimer.current / 0.5;
            rArmGroup.current!.rotation.x = -Math.PI * 0.9 * Math.sin(p * Math.PI);
            rArmGroup.current!.rotation.z = -0.6 * Math.sin(p * Math.PI);
            animationTimer.current += delta;
        }

        if (isHarvesting) {
            bodyRef.current!.rotation.x = Math.sin(t * 15) * 0.15 + 0.3;
            rArmGroup.current!.rotation.x = -1.2 + Math.sin(t * 20) * 0.4;
        } else {
            bodyRef.current!.rotation.x = THREE.MathUtils.lerp(bodyRef.current!.rotation.x, 0, 0.2);
        }

        // Physics
        if (!isGrounded) {
            groupRef.current.position.y += verticalVelocity;
            setVerticalVelocity(v => v - 0.04);
            if (groupRef.current.position.y <= 0) {
                groupRef.current.position.y = 0;
                setVerticalVelocity(0);
                setIsGrounded(true);
                setPlayerGrounded(true);
            }
        }

        (window as any).playerPos = groupRef.current.position.clone();
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (e.code === 'Space') if (isGrounded) { setVerticalVelocity(0.4); setIsGrounded(false); setPlayerGrounded(false); }
            if (e.code === 'KeyF' || e.code === 'Enter') handleAttack();
            if (e.code === 'KeyE') setIsHarvesting(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.code] = false;
            if (e.code === 'KeyE') setIsHarvesting(false);
        };
        const onAttack = () => handleAttack();
        const onDamaged = () => { setIsDamaged(true); setTimeout(() => setIsDamaged(false), 150); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('player-attack', onAttack);
        window.addEventListener('player-damaged', onDamaged);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('player-attack', onAttack);
            window.removeEventListener('player-damaged', onDamaged);
        };
    }, [isGrounded]);

    return (
        <group ref={groupRef}>
            {/* SOFT CIRCLE SHADOW */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <circleGeometry args={[0.5, 32]} />
                <meshStandardMaterial color="#000" transparent opacity={0.3} />
            </mesh>

            {/* MAIN CHARACTER BODY */}
            <group ref={bodyRef}>
                {/* TORSO */}
                <mesh position={[0, 1.15, 0]} castShadow>
                    <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
                    <meshStandardMaterial color={shirtColor} roughness={0.7} />
                </mesh>

                {/* Tactical Belt */}
                <mesh position={[0, 0.95, 0]}>
                    <torusGeometry args={[0.19, 0.03, 8, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* HEAD */}
                <group ref={headRef} position={[0, 1.6, 0]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.12, 0.12, 8, 16]} />
                        <meshStandardMaterial color={skinTone} roughness={0.6} />
                    </mesh>
                    {/* Hair Detail */}
                    <mesh position={[0, 0.08, -0.02]}>
                        <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#402c1e" />
                    </mesh>
                    {/* Face Visor */}
                    <mesh position={[0, 0.02, 0.08]}>
                        <boxGeometry args={[0.18, 0.04, 0.06]} />
                        <meshStandardMaterial color="#081b24" emissive="#00ffff" emissiveIntensity={1.5} />
                    </mesh>
                </group>

                {/* ARMS - Integrated Parenting */}
                <group ref={lArmGroup} position={[-0.22, 1.4, 0]}>
                    <mesh position={[0, -0.18, 0]} castShadow>
                        <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
                        <meshStandardMaterial color={shirtColor} />
                    </mesh>
                    {/* Skin Forearm */}
                    <mesh position={[0, -0.38, 0]} castShadow>
                        <capsuleGeometry args={[0.05, 0.15, 8, 16]} />
                        <meshStandardMaterial color={skinTone} />
                    </mesh>
                </group>

                <group ref={rArmGroup} position={[0.22, 1.4, 0]}>
                    <mesh position={[0, -0.18, 0]} castShadow>
                        <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
                        <meshStandardMaterial color={shirtColor} />
                    </mesh>
                    {/* Skin Forearm */}
                    <mesh position={[0, -0.38, 0]} castShadow>
                        <capsuleGeometry args={[0.05, 0.15, 8, 16]} />
                        <meshStandardMaterial color={skinTone} />
                    </mesh>

                    {/* MASTER ACTION SWORD */}
                    <group position={[0, -0.45, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.02, 1.0, 0.04]} />
                            <meshStandardMaterial
                                color="#444"
                                metalness={1}
                                roughness={0}
                                emissive="#00ffcc"
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                        {/* Blade Edge */}
                        <mesh position={[0, 0.1, 0]}>
                            <boxGeometry args={[0.01, 0.7, 0.05]} />
                            <meshStandardMaterial color="#fff" emissive="#00ffcc" emissiveIntensity={2} />
                        </mesh>
                        {/* Guard */}
                        <mesh position={[0, -0.4, 0]}>
                            <boxGeometry args={[0.18, 0.04, 0.06]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                    </group>
                </group>

                {/* LEGS - Integrated Parenting */}
                <group ref={lLegGroup} position={[-0.1, 0.8, 0]}>
                    <mesh position={[0, -0.35, 0]} castShadow>
                        <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    {/* Boot */}
                    <mesh position={[0, -0.7, 0.05]} castShadow>
                        <boxGeometry args={[0.12, 0.1, 0.2]} />
                        <meshStandardMaterial color={bootsColor} />
                    </mesh>
                </group>

                <group ref={rLegGroup} position={[0.1, 0.8, 0]}>
                    <mesh position={[0, -0.35, 0]} castShadow>
                        <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    {/* Boot */}
                    <mesh position={[0, -0.7, 0.05]} castShadow>
                        <boxGeometry args={[0.12, 0.1, 0.2]} />
                        <meshStandardMaterial color={bootsColor} />
                    </mesh>
                </group>

                {/* BACKPACK */}
                <group position={[0, 1.15, -0.16]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.26, 0.38, 0.14]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.05, -0.08]}>
                        <boxGeometry args={[0.18, 0.12, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            </group>

            {/* ACTION VFX: Slash */}
            {isAttacking && (
                <mesh position={[0, 1.2, 0.8]} rotation={[0, 0, Math.PI / 4]}>
                    <ringGeometry args={[0.6, 1.2, 32, 1, 0, Math.PI]} />
                    <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={10} transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* DAMAGE OVERLAY */}
            {isDamaged && (
                <mesh position={[0, 1, 0]}>
                    <sphereGeometry args={[0.85]} />
                    <meshStandardMaterial color="#f00" transparent opacity={0.3} emissive="#f00" emissiveIntensity={5} />
                </mesh>
            )}
        </group>
    );
};

export default RealisticPlayer;
