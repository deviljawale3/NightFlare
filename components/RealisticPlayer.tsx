import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DroneController from './DroneController';
import { soundEffects } from '../utils/soundEffects';

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
    const [isDashing, setIsDashing] = useState(false);
    const [dashCooldown, setDashCooldown] = useState(0);
    const [trails, setTrails] = useState<{ id: number; pos: THREE.Vector3; rot: number; opacity: number }[]>([]);
    const dashVelocity = useRef(new THREE.Vector3());

    const gameState = useGameStore(s => s.gameState);
    const playerStats = useGameStore(s => s.playerStats);
    const triggerScreenShake = useGameStore(s => s.triggerScreenShake);
    const setPlayerGrounded = useGameStore(s => s.setPlayerGrounded);
    const isTimeSlowed = useGameStore(s => s.isTimeSlowed);

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
                            rotation: groupRef.current!.rotation.y, // Needed for Arc/Line attacks
                            range: playerStats.attackRange + 1.8,
                            damage: playerStats.attackDamage,
                            weaponType: playerStats.currentWeapon
                        }
                    }));
                }, 150);
            }
            setTimeout(() => setIsAttacking(false), 500);
            triggerScreenShake(0.6);
        }
    };

    const handleDash = () => {
        if (!isDashing && dashCooldown <= 0 && isGrounded && !isAttacking) {
            setIsDashing(true);
            setDashCooldown(1.5); // 1.5s cooldown

            // Move in current forward direction or input direction
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(groupRef.current!.quaternion);
            dashVelocity.current.copy(forward.multiplyScalar(0.8)); // Strong burst

            soundEffects.play('player_roll'); // Use roll sound for dash
            triggerScreenShake(0.4);

            window.dispatchEvent(new CustomEvent('player-dash-start'));
            setTimeout(() => {
                setIsDashing(false);
                window.dispatchEvent(new CustomEvent('player-dash-end'));
            }, 300);
        }
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;

        const t = state.clock.getElapsedTime();
        // 1. ADVANCED MOVEMENT ENGINE (Framerate Independent - TACTICAL TUNING)
        const frameFactor = Math.min(0.1, delta); // Cap delta to avoid jumps
        let moveSpeed = playerStats.speed * 20; // REDUCED from 30 for much better control
        let mX = (window as any).joystickX || 0;
        let mZ = (window as any).joystickY || 0;

        if (mX === 0 && mZ === 0) {
            if (keys.current['KeyW'] || keys.current['ArrowUp']) mZ -= 1;
            if (keys.current['KeyS'] || keys.current['ArrowDown']) mZ += 1;
            if (keys.current['KeyA'] || keys.current['ArrowLeft']) mX -= 1;
            if (keys.current['KeyD'] || keys.current['ArrowRight']) mX += 1;
        }

        // Auto-dash if joystick is pushed far
        const joyMagnitude = Math.sqrt(mX * mX + mZ * mZ);
        if (joyMagnitude > 0.99 && !isDashing && dashCooldown <= 0) {
            handleDash();
            // Tactical Haptic Pulse on Dash Threshold
            if (useGameStore.getState().settings.vibrationEnabled && 'vibrate' in navigator) {
                navigator.vibrate(30);
            }
        }

        const isMoving = mX !== 0 || mZ !== 0;

        if (isMoving) {
            const length = Math.sqrt(mX * mX + mZ * mZ);
            mX /= length; mZ /= length;

            // Accelerate towards target velocity
            const targetVX = mX * moveSpeed * delta;
            const targetVZ = mZ * moveSpeed * delta;
            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, targetVX, 1 - Math.pow(0.0001, delta)); // Even smoother lerp
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, targetVZ, 1 - Math.pow(0.0001, delta));

            const targetHeading = Math.atan2(mX, mZ);
            let rotDiff = targetHeading - groupRef.current.rotation.y;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            groupRef.current.rotation.y += rotDiff * (1 - Math.pow(0.00005, delta)); // Smoother rotation
        } else {
            // High friction for precise stop (PREMIUIM BRAKING)
            const friction = Math.pow(0.00001, delta); // Even more stopping power
            velocity.current.x *= friction;
            velocity.current.z *= friction;
        }

        // Constant Interaction check while harvesting
        if (isHarvesting && t % 0.15 < 0.016) {
            window.dispatchEvent(new CustomEvent('player-interact-check', {
                detail: {
                    position: groupRef.current.position.clone(),
                    range: 3.5 // Interaction range
                }
            }));
        }

        // Apply Dash
        if (isDashing) {
            velocity.current.add(dashVelocity.current.clone().multiplyScalar(delta * 60));
            dashVelocity.current.multiplyScalar(Math.pow(0.2, delta)); // Rapid decay
        }

        groupRef.current.position.x += velocity.current.x;
        groupRef.current.position.z += velocity.current.z;

        if (dashCooldown > 0) setDashCooldown(prev => Math.max(0, prev - delta));

        // 2. CONNECTED CHARACTER ANIMATIONS - REFINED ATTACK LOGIC

        const speedSq = velocity.current.x ** 2 + velocity.current.z ** 2;
        const speed = Math.sqrt(speedSq) * 60;

        // PREMIUM: Motion Blur Stretch
        const stretch = 1 + (speed / 15);
        bodyRef.current!.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));

        if (speed > 0.1 && isGrounded) {
            // Natural Running Bounce
            const walkTime = t * (isDashing ? 22 : 14);
            const amplitude = isDashing ? 1.0 : 0.7;
            lLegGroup.current!.rotation.x = Math.sin(walkTime) * amplitude;
            rLegGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * amplitude;
            lArmGroup.current!.rotation.x = Math.sin(walkTime + Math.PI) * amplitude * 0.7;
            if (!isAttacking) rArmGroup.current!.rotation.x = Math.sin(walkTime) * amplitude * 0.7;

            bodyRef.current!.rotation.z = Math.sin(walkTime) * 0.08;
            bodyRef.current!.position.y = Math.abs(Math.sin(walkTime * 2)) * 0.08;

            // Camera Tilt based on movement
            state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, -mX * 0.02, 0.1);
        } else {
            // Breathing Idle
            const breathe = Math.sin(t * 1.5);
            bodyRef.current!.position.y = breathe * 0.02;
            lArmGroup.current!.rotation.z = -0.15 + breathe * 0.05;
            rArmGroup.current!.rotation.z = 0.15 - breathe * 0.05;
            lLegGroup.current!.rotation.x = THREE.MathUtils.lerp(lLegGroup.current!.rotation.x, 0, 0.1);
            rLegGroup.current!.rotation.x = THREE.MathUtils.lerp(rLegGroup.current!.rotation.x, 0, 0.1);
            state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, 0, 0.1);
        }

        // Action States: REFINED 3-STAGE ATTACK
        if (isAttacking) {
            const attackDuration = 0.5;
            const p = Math.min(1, animationTimer.current / attackDuration);

            // 3-Stage Rotation Physics
            if (p < 0.25) { // Stage 1: Windup (Shoulder pull back)
                const wp = p / 0.25;
                rArmGroup.current!.rotation.x = THREE.MathUtils.lerp(0, 0.8, wp);
                rArmGroup.current!.rotation.z = THREE.MathUtils.lerp(0.15, 0.5, wp);
                bodyRef.current!.rotation.y = THREE.MathUtils.lerp(0, -0.2, wp);
            }
            else if (p < 0.45) { // Stage 2: Strike (Flash forward)
                const sp = (p - 0.25) / 0.2;
                rArmGroup.current!.rotation.x = THREE.MathUtils.lerp(0.8, -Math.PI * 0.85, sp);
                rArmGroup.current!.rotation.z = THREE.MathUtils.lerp(0.5, -0.6, sp);
                bodyRef.current!.rotation.y = THREE.MathUtils.lerp(-0.2, 0.3, sp);
            }
            else { // Stage 3: Recovery (Braking and return)
                const rp = (p - 0.45) / 0.55;
                rArmGroup.current!.rotation.x = THREE.MathUtils.lerp(-Math.PI * 0.85, 0, rp);
                rArmGroup.current!.rotation.z = THREE.MathUtils.lerp(-0.6, 0.15, rp);
                bodyRef.current!.rotation.y = THREE.MathUtils.lerp(0.3, 0, rp);
            }

            animationTimer.current += delta;

            // PREMIUM: FOV Pulse for impact
            if (p > 0.25 && p < 0.45 && state.camera instanceof THREE.PerspectiveCamera) {
                state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, state.camera.fov - 4, 0.4);
                state.camera.updateProjectionMatrix();
            }
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
                triggerScreenShake(0.8);
                soundEffects.play('land');
                // Squat impact animation
                bodyRef.current!.position.y = -0.3;
            }
        }

        // HIT-STOP & CHRONO-STASIS ENGINE
        const hitStopActive = state.clock.getElapsedTime() < (window as any).hitStopTime;
        if (hitStopActive && !isTimeSlowed) return; // Player is immune to stasis during Nova

        // TRAIL LOGIC: Generate ghosts during dash or high speed
        if (isDashing || speed > 15) {
            if (state.clock.getElapsedTime() % 0.05 < 0.016) {
                setTrails(prev => [...prev.slice(-8), {
                    id: Date.now(),
                    pos: groupRef.current!.position.clone(),
                    rot: groupRef.current!.rotation.y,
                    opacity: 0.5
                }]);
            }
        }
        if (trails.length > 0) {
            setTrails(prev => prev.map(t => ({ ...t, opacity: t.opacity - delta * 2 })).filter(t => t.opacity > 0));
        }

        (window as any).playerPos = groupRef.current.position.clone();
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (e.code === 'Space') if (isGrounded) { setVerticalVelocity(0.4); setIsGrounded(false); setPlayerGrounded(false); soundEffects.play('jump'); }
            if (e.code === 'ShiftLeft' || e.code === 'KeyQ') handleDash();
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
            {/* RENDER GHOST TRAILS */}
            {trails.map(t => (
                <group key={t.id} position={t.pos} rotation={[0, t.rot, 0]}>
                    <mesh position={[0, 1.1, 0]}>
                        <capsuleGeometry args={[0.2, 0.45, 4, 8]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={t.opacity * 0.2} />
                    </mesh>
                </group>
            ))}
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

            {/* ACTION VFX: HIGH-FIDELITY SLASH ARC */}
            {isAttacking && (
                <group position={[0, 1.2, 0.4]}>
                    {/* Balanced Flash for Stability */}
                    <mesh rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1]}>
                        <ringGeometry args={[0.8, 1.6, 64, 1, 0, Math.PI]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Sharp Inner Core */}
                    <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.95, 0.95, 1]} position={[0, 0, 0.05]}>
                        <ringGeometry args={[1.0, 1.3, 64, 1, 0, Math.PI]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={8} transparent opacity={0.8} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Subtle Wake */}
                    <mesh rotation={[0, 0, Math.PI / 4]} scale={[1.1, 1.1, 1]} position={[0, 0, -0.05]}>
                        <ringGeometry args={[0.7, 1.8, 64, 1, 0, Math.PI]} />
                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} transparent opacity={0.2} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            )}

            {/* DASH PULSE */}
            {isDashing && (
                <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh>
                        <ringGeometry args={[0.5, 2.5, 32]} />
                        <meshStandardMaterial color="#00ffff" transparent opacity={0.4} emissive="#00ffff" emissiveIntensity={5} />
                    </mesh>
                </group>
            )}

            {/* DAMAGE OVERLAY */}
            {isDamaged && (
                <mesh position={[0, 1, 0]}>
                    <sphereGeometry args={[0.85]} />
                    <meshStandardMaterial color="#f00" transparent opacity={0.3} emissive="#f00" emissiveIntensity={5} />
                </mesh>
            )}

            {/* SENTINEL DRONES */}
            <DroneController parentRef={groupRef} />
        </group>
    );
};

export default RealisticPlayer;
