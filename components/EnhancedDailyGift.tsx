import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import DeeJayLabsLogo from './DeeJayLabsLogo';

/**
 * Enhanced Daily Gift System
 * - Animated gift opening
 * - Surprise rewards
 * - Performance-based cycles
 * - 7-day reward streak
 */

interface Reward {
    type: 'coins' | 'gems' | 'weapon' | 'skin' | 'boost' | 'life' | 'special';
    amount?: number;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
}

interface DailyGiftState {
    lastClaimDate: string | null;
    currentStreak: number;
    totalClaims: number;
    showGiftModal: boolean;

    // Performance tracking
    lastScore: number;
    lastWave: number;
    performanceMultiplier: number;

    setShowGiftModal: (show: boolean) => void;
    canClaimToday: () => boolean;
    claimDailyGift: () => Reward;
    calculateReward: () => Reward;
    updatePerformance: (score: number, wave: number) => void;
}

export const useDailyGiftStore = create<DailyGiftState>()(
    persist(
        (set, get) => ({
            lastClaimDate: null,
            currentStreak: 0,
            totalClaims: 0,
            showGiftModal: false,
            lastScore: 0,
            lastWave: 0,
            performanceMultiplier: 1.0,

            setShowGiftModal: (show) => set({ showGiftModal: show }),

            canClaimToday: () => {
                const { lastClaimDate } = get();
                if (!lastClaimDate) return true;

                const today = new Date().toDateString();
                const lastClaim = new Date(lastClaimDate).toDateString();
                return today !== lastClaim;
            },

            updatePerformance: (score, wave) => {
                const { lastScore, lastWave } = get();

                // Calculate performance improvement
                const scoreImprovement = score > lastScore ? (score / Math.max(lastScore, 1)) : 1;
                const waveImprovement = wave > lastWave ? (wave / Math.max(lastWave, 1)) : 1;

                const performanceMultiplier = Math.min(3.0, (scoreImprovement + waveImprovement) / 2);

                set({
                    lastScore: Math.max(score, lastScore),
                    lastWave: Math.max(wave, lastWave),
                    performanceMultiplier
                });
            },

            calculateReward: () => {
                const { currentStreak, performanceMultiplier, totalClaims } = get();
                const dayInCycle = (currentStreak % 7) + 1;

                // Base rewards for 7-day cycle
                const cycleRewards: Reward[] = [
                    // Day 1 - Common
                    {
                        type: 'coins',
                        amount: Math.floor(100 * performanceMultiplier),
                        name: 'Survivor Coins',
                        description: 'Currency for upgrades',
                        rarity: 'common',
                        icon: '🪙'
                    },
                    // Day 2 - Common
                    {
                        type: 'boost',
                        amount: 1,
                        name: 'Speed Boost',
                        description: '+20% speed for next game',
                        rarity: 'common',
                        icon: '⚡'
                    },
                    // Day 3 - Rare
                    {
                        type: 'gems',
                        amount: Math.floor(50 * performanceMultiplier),
                        name: 'Star Shards',
                        description: 'Premium currency',
                        rarity: 'rare',
                        icon: '💎'
                    },
                    // Day 4 - Rare
                    {
                        type: 'life',
                        amount: 1,
                        name: 'Extra Life',
                        description: 'One more chance to survive',
                        rarity: 'rare',
                        icon: '❤️'
                    },
                    // Day 5 - Epic
                    {
                        type: 'weapon',
                        amount: 1,
                        name: 'Legendary Sword',
                        description: '+50% attack damage',
                        rarity: 'epic',
                        icon: '⚔️'
                    },
                    // Day 6 - Epic
                    {
                        type: 'skin',
                        amount: 1,
                        name: 'Shadow Armor',
                        description: 'Exclusive cosmetic',
                        rarity: 'epic',
                        icon: '🛡️'
                    },
                    // Day 7 - Legendary
                    {
                        type: 'special',
                        amount: 1,
                        name: 'Mystery Box',
                        description: 'Contains rare treasures!',
                        rarity: 'legendary',
                        icon: '🎁'
                    }
                ];

                // Bonus for completing full cycles
                const completedCycles = Math.floor(totalClaims / 7);
                if (completedCycles > 0 && dayInCycle === 7) {
                    cycleRewards[6].amount = 1 + completedCycles;
                    cycleRewards[6].description = `Contains ${1 + completedCycles} rare treasures!`;
                }

                return cycleRewards[dayInCycle - 1];
            },

            claimDailyGift: () => {
                const { currentStreak, lastClaimDate } = get();
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();

                // Check if streak continues
                const lastClaim = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
                const streakContinues = lastClaim === yesterday;

                const newStreak = streakContinues ? currentStreak + 1 : 1;
                const reward = get().calculateReward();

                set({
                    lastClaimDate: new Date().toISOString(),
                    currentStreak: newStreak,
                    totalClaims: get().totalClaims + 1
                });

                return reward;
            }
        }),
        {
            name: 'nightflare-daily-gift'
        }
    )
);

// Main Component
export const EnhancedDailyGift: React.FC = () => {
    const {
        showGiftModal,
        setShowGiftModal,
        canClaimToday,
        claimDailyGift,
        currentStreak,
        performanceMultiplier
    } = useDailyGiftStore();

    const [giftState, setGiftState] = useState<'closed' | 'shaking' | 'opening' | 'opened'>('closed');
    const [reward, setReward] = useState<Reward | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (showGiftModal && canClaimToday()) {
            // Auto-start animation
            setTimeout(() => setGiftState('shaking'), 500);
        }
    }, [showGiftModal]);

    const handleOpenGift = () => {
        if (giftState === 'shaking') {
            setGiftState('opening');

            // Claim reward
            const claimedReward = claimDailyGift();

            setTimeout(() => {
                setReward(claimedReward);
                setGiftState('opened');
                setShowConfetti(true);

                // Hide confetti after 3 seconds
                setTimeout(() => setShowConfetti(false), 3000);
            }, 1000);
        }
    };

    const handleClose = () => {
        setShowGiftModal(false);
        setGiftState('closed');
        setReward(null);
        setShowConfetti(false);
    };

    if (!showGiftModal) return null;

    const dayInCycle = (currentStreak % 7) + 1;
    const rarityColors = {
        common: 'from-gray-600 to-gray-700',
        rare: 'from-blue-600 to-cyan-600',
        epic: 'from-purple-600 to-pink-600',
        legendary: 'from-yellow-500 to-orange-600'
    };

    const rarityGlow = {
        common: 'shadow-[0_0_30px_rgba(156,163,175,0.5)]',
        rare: 'shadow-[0_0_50px_rgba(59,130,246,0.8)]',
        epic: 'shadow-[0_0_70px_rgba(168,85,247,0.9)]',
        legendary: 'shadow-[0_0_100px_rgba(251,191,36,1)]'
    };

    return (
        <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            {['🎉', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="relative max-w-2xl w-full">

                {/* Close Button */}
                {giftState === 'opened' && (
                    <button
                        onClick={handleClose}
                        className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-all border-2 border-white/20 shadow-lg backdrop-blur-md active:scale-90"
                    >
                        <span className="text-2xl font-bold">✕</span>
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-5xl font-black text-white italic uppercase tracking-tighter mb-2 animate-in slide-in-from-top duration-700">
                        Daily Gift
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-white/70 text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <span className="text-orange-400">🔥</span>
                            <span>{currentStreak} Day Streak</span>
                        </div>
                        <div className="w-1 h-1 bg-white/30 rounded-full" />
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400">📅</span>
                            <span>Day {dayInCycle}/7</span>
                        </div>
                        {performanceMultiplier > 1 && (
                            <>
                                <div className="w-1 h-1 bg-white/30 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">⚡</span>
                                    <span>{performanceMultiplier.toFixed(1)}x Bonus</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Gift Box Container */}
                <div className="relative flex items-center justify-center min-h-[30vh] sm:min-h-[400px]">

                    {giftState !== 'opened' ? (
                        // Gift Box (Closed/Shaking/Opening)
                        <div
                            className={`relative cursor-pointer transition-all duration-500 ${giftState === 'shaking' ? 'animate-shake' : ''
                                } ${giftState === 'opening' ? 'animate-bounce-out scale-150 opacity-0' : 'scale-100 opacity-100'
                                }`}
                            onClick={handleOpenGift}
                        >
                            {/* Gift Box */}
                            <div className="relative w-64 h-64">
                                {/* Box Body */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl border-4 border-red-400 shadow-2xl transform perspective-1000 rotate-y-12">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />

                                    {/* Ribbon Vertical */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg" />

                                    {/* Ribbon Horizontal */}
                                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-16 bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-lg" />

                                    {/* Bow */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl animate-pulse">
                                        🎀
                                    </div>

                                    {/* Sparkles */}
                                    {giftState === 'shaking' && (
                                        <>
                                            <div className="absolute -top-4 -left-4 text-2xl animate-ping">✨</div>
                                            <div className="absolute -top-4 -right-4 text-2xl animate-ping" style={{ animationDelay: '0.2s' }}>✨</div>
                                            <div className="absolute -bottom-4 -left-4 text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>✨</div>
                                            <div className="absolute -bottom-4 -right-4 text-2xl animate-ping" style={{ animationDelay: '0.6s' }}>✨</div>
                                        </>
                                    )}
                                </div>

                                {/* Shadow */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/30 rounded-full blur-xl" />
                            </div>

                            {/* Instruction Text */}
                            {giftState === 'shaking' && (
                                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/20 animate-bounce">
                                        <span className="text-white font-black uppercase text-sm tracking-wider">
                                            👆 Click to Open!
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Reward Display (Opened)
                        <div className="animate-in zoom-in duration-700">
                            <div className={`relative bg-gradient-to-br ${rarityColors[reward!.rarity]} rounded-3xl p-8 border-4 border-white/30 ${rarityGlow[reward!.rarity]} min-w-[400px]`}>

                                {/* Rarity Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/30">
                                    <span className="text-white font-black uppercase text-xs tracking-widest">
                                        {reward!.rarity}
                                    </span>
                                </div>

                                {/* Reward Icon */}
                                <div className="text-center mb-6">
                                    <div className="text-9xl mb-4 animate-bounce-slow inline-block">
                                        {reward!.icon}
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                        {reward!.name}
                                    </h3>
                                    {reward!.amount && reward!.amount > 1 && (
                                        <div className="text-5xl font-black text-white mb-2">
                                            ×{reward!.amount}
                                        </div>
                                    )}
                                    <p className="text-white/80 text-sm font-medium">
                                        {reward!.description}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-black/30 rounded-xl p-3 text-center">
                                        <div className="text-white/60 text-xs font-bold uppercase mb-1">Streak</div>
                                        <div className="text-white text-2xl font-black">{currentStreak}</div>
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-3 text-center">
                                        <div className="text-white/60 text-xs font-bold uppercase mb-1">Next In</div>
                                        <div className="text-white text-2xl font-black">24h</div>
                                    </div>
                                </div>

                                {/* Claim Button */}
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-6 py-4 bg-white hover:bg-white/90 rounded-2xl text-black font-black text-lg uppercase tracking-wider transition-all shadow-lg active:scale-95"
                                >
                                    Claim Reward
                                </button>

                                {/* Progress to Next Reward */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-white/60 text-xs font-bold uppercase mb-2">
                                        <span>Weekly Progress</span>
                                        <span>{dayInCycle}/7</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(dayInCycle / 7) * 100}%` }}
                                        />
                                    </div>
                                    {dayInCycle < 7 && (
                                        <div className="text-center mt-3 text-white/50 text-xs">
                                            Come back tomorrow for an even better reward!
                                        </div>
                                    )}
                                    {dayInCycle === 7 && (
                                        <div className="text-center mt-3 text-yellow-400 text-sm font-bold animate-pulse">
                                            🎉 Cycle Complete! Starting fresh tomorrow!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-center opacity-40">
                    <DeeJayLabsLogo />
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-5deg); }
          20%, 40%, 60%, 80% { transform: rotate(5deg); }
        }
        
        @keyframes bounce-out {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2) translateY(-20px); opacity: 0.8; }
          100% { transform: scale(2) translateY(-100px); opacity: 0; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .animate-shake {
          animation: shake 0.5s infinite;
        }
        
        .animate-bounce-out {
          animation: bounce-out 1s forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
        </div>
    );
};

export default EnhancedDailyGift;
