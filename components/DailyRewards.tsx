import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Text, Sparkles, PerspectiveCamera, ContactShadows, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface DailyReward {
    day: number;
    type: 'wood' | 'stone' | 'lightShards' | 'food' | 'cosmetic' | 'special' | 'shards' | 'energy';
    amount?: number;
    item?: string;
    icon: string;
    claimed: boolean;
}

interface DailyRewardStore {
    lastClaimDate: string | null;
    currentStreak: number;
    longestStreak: number;
    totalClaimed: number;
    rewards: DailyReward[];
    showRewardModal: boolean;
    isRevealing: boolean;

    initializeRewards: () => void;
    canClaimToday: () => boolean;
    claimDailyReward: () => DailyReward | null;
    setShowRewardModal: (show: boolean) => void;
    setRevealing: (val: boolean) => void;
    resetStreak: () => void;
}

export const useDailyRewardStore = create<DailyRewardStore>()(
    persist(
        (set, get) => ({
            lastClaimDate: null,
            currentStreak: 0,
            longestStreak: 0,
            totalClaimed: 0,
            rewards: [],
            showRewardModal: false,
            isRevealing: false,

            initializeRewards: () => {
                const rewards: DailyReward[] = [
                    { day: 1, type: 'wood', amount: 150, icon: '🪵', claimed: false },
                    { day: 2, type: 'stone', amount: 150, icon: '🪨', claimed: false },
                    { day: 3, type: 'lightShards', amount: 80, icon: '✨', claimed: false },
                    { day: 4, type: 'food', amount: 60, icon: '🍖', claimed: false },
                    { day: 5, type: 'shards', amount: 120, icon: '💎', claimed: false },
                    { day: 6, type: 'energy', amount: 100, icon: '⚡', claimed: false },
                    { day: 7, type: 'special', item: 'Mythic Core', icon: '🌌', claimed: false }
                ];
                set({ rewards });
            },

            canClaimToday: () => {
                const { lastClaimDate } = get();
                if (!lastClaimDate) return true;
                const today = new Date().toDateString();
                return lastClaimDate !== today;
            },

            claimDailyReward: () => {
                const { lastClaimDate, currentStreak, longestStreak, rewards, totalClaimed } = get();
                if (!get().canClaimToday()) return null;

                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();

                const isConsecutive = lastClaimDate === yesterday;
                const newStreak = isConsecutive ? currentStreak + 1 : 1;
                const dayIndex = (newStreak - 1) % 7;
                const reward = { ...rewards[dayIndex], claimed: true };

                set({
                    lastClaimDate: today,
                    currentStreak: newStreak,
                    longestStreak: Math.max(longestStreak, newStreak),
                    totalClaimed: totalClaimed + 1,
                    rewards: rewards.map((r, i) => i === dayIndex ? { ...r, claimed: true } : r),
                });

                return reward;
            },

            setShowRewardModal: (show: boolean) => set({ showRewardModal: show }),
            setRevealing: (val: boolean) => set({ isRevealing: val }),
            resetStreak: () => set({ currentStreak: 0 })
        }),
        { name: 'nightflare-daily-rewards-v2' }
    )
);

// --- 3D MYSTERY BOX COMPONENT ---
const PremiumGiftBox: React.FC<{ isOpen: boolean; onReveal: () => void; reward: DailyReward | null }> = ({ isOpen, onReveal, reward }) => {
    const group = useRef<THREE.Group>(null);
    const lid = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();

        if (isOpen) {
            // Animation for opened state
            lid.current!.rotation.x = THREE.MathUtils.lerp(lid.current!.rotation.x, -Math.PI * 0.7, 0.1);
            lid.current!.position.y = THREE.MathUtils.lerp(lid.current!.position.y, 0.8, 0.1);
            group.current.rotation.y += 0.01;
        } else {
            // Idle float and rotation
            group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
            group.current.position.y = Math.sin(t * 2) * 0.1;

            if (hovered) {
                group.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
                group.current.rotation.z = Math.sin(t * 15) * 0.05; // Shake on hover
            } else {
                group.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                group.current.rotation.z = 0;
            }
        }
    });

    return (
        <group ref={group} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {/* Box Body */}
            <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.1} />
            </mesh>

            {/* Box Trim/Accents */}
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[1.02, 0.82, 1.02]} />
                <meshStandardMaterial color="#00f2ff" transparent opacity={0.3} wireframe />
            </mesh>

            {/* Lid */}
            <group ref={lid} position={[0, 0.3, 0]}>
                <mesh castShadow position={[0, 0.1, 0]}>
                    <boxGeometry args={[1.1, 0.2, 1.1]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[1.12, 0.22, 1.12]} />
                    <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} transparent opacity={0.4} wireframe />
                </mesh>
            </group>

            {/* Glowing Core */}
            <pointLight intensity={isOpen ? 10 : 2} color="#00f2ff" distance={5} />
            {isOpen && (
                <group position={[0, 0.5, 0]}>
                    <Sparkles count={40} scale={2} size={6} speed={1.5} color="#00f2ff" />
                    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
                        <Text
                            position={[0, 0.5, 0]}
                            fontSize={0.4}
                            color="#fff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {reward?.icon || "?"}
                        </Text>
                    </Float>
                </group>
            )}
        </group>
    );
};

// --- MAIN MODAL COMPONENT ---
export const DailyRewardModal: React.FC = () => {
    const {
        currentStreak,
        longestStreak,
        canClaimToday,
        claimDailyReward,
        showRewardModal,
        setShowRewardModal,
        isRevealing,
        setRevealing
    } = useDailyRewardStore();

    const [reward, setReward] = useState<DailyReward | null>(null);

    const handleClaim = () => {
        if (!canClaimToday() || isRevealing) return;
        setRevealing(true);

        // Delay reward logic to match animation
        setTimeout(() => {
            const r = claimDailyReward();
            setReward(r);
        }, 1200);
    };

    const handleClose = () => {
        if (isRevealing && !reward) return; // Prevent closing during unboxing
        setShowRewardModal(false);
        setReward(null);
        setRevealing(false);
    };

    if (!showRewardModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden font-['Outfit']">

            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
                    <color attach="background" args={['#050505']} />
                    <fog attach="fog" args={['#050505', 5, 15]} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, -10, -10]} color="red" intensity={1} />

                    <Suspense fallback={null}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <PremiumGiftBox isOpen={!!reward} onReveal={() => { }} reward={reward} />
                        </Float>
                        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#000000" />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI LAYER */}
            <div className="relative z-10 w-full max-w-lg flex flex-col items-center pointer-events-none">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                >
                    ✕
                </button>

                {/* Info Display */}
                <div className={`text-center transition-all duration-700 ${isRevealing ? 'opacity-0 -translate-y-8' : 'opacity-100'}`}>
                    <div className="text-cyan-400 text-xs font-black tracking-[0.5em] uppercase mb-2">SUPPLY DROP DETECTED</div>
                    <h2 className="text-5xl sm:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                        Daily Bounty
                    </h2>
                    <div className="flex gap-4 justify-center">
                        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <span className="text-[10px] block text-white/40 font-black uppercase tracking-widest">Streak</span>
                            <span className="text-xl font-black text-orange-400">{currentStreak} DAYS</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <span className="text-[10px] block text-white/40 font-black uppercase tracking-widest">Best</span>
                            <span className="text-xl font-black text-cyan-400">{longestStreak} DAYS</span>
                        </div>
                    </div>
                </div>

                {/* Reward Reveal Display */}
                <div className={`mt-24 text-center transition-all duration-1000 ${reward ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="text-white/40 text-xs font-black tracking-[0.4em] uppercase mb-2 animate-pulse">PRIZE SECURED</div>
                    <div className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter mb-4">
                        {reward?.amount && `+${reward.amount}`} {reward?.item || reward?.type.toUpperCase()}
                    </div>
                    <button
                        onClick={handleClose}
                        className="pointer-events-auto px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        COLLECT ALL
                    </button>
                </div>

                {/* Claim Trigger */}
                {!reward && (
                    <div className={`mt-32 w-full transition-all duration-500 ${isRevealing ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
                        {canClaimToday() ? (
                            <button
                                onClick={handleClaim}
                                className="pointer-events-auto w-full group relative bg-cyan-400 text-black py-6 rounded-[2rem] font-black text-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-[0_15px_60px_rgba(0,242,255,0.4)] overflow-hidden italic tracking-tighter"
                            >
                                <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    OPEN MYSTERY BOX <span className="opacity-40">➔</span>
                                </span>
                            </button>
                        ) : (
                            <div className="w-full py-6 bg-white/5 rounded-[2rem] border border-white/10 text-center text-white/30 font-black uppercase tracking-[0.2em]">
                                VAULT LOCKED • RETURN TOMORROW
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Branding */}
                <div className="absolute -bottom-16 opacity-20 scale-75">
                    <DeeJayLabsLogo />
                </div>
            </div>
        </div>
    );
};

export default DailyRewardStore;
