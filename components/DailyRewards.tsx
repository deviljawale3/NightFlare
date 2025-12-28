import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface DailyReward {
    day: number;
    type: 'wood' | 'stone' | 'lightShards' | 'food' | 'cosmetic' | 'special';
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

    initializeRewards: () => void;
    canClaimToday: () => boolean;
    claimDailyReward: () => DailyReward | null;
    setShowRewardModal: (show: boolean) => void;
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

            initializeRewards: () => {
                const rewards: DailyReward[] = [
                    { day: 1, type: 'wood', amount: 100, icon: '🪵', claimed: false },
                    { day: 2, type: 'stone', amount: 100, icon: '🪨', claimed: false },
                    { day: 3, type: 'lightShards', amount: 50, icon: '✨', claimed: false },
                    { day: 4, type: 'food', amount: 50, icon: '🍖', claimed: false },
                    { day: 5, type: 'lightShards', amount: 100, icon: '💎', claimed: false },
                    { day: 6, type: 'special', item: 'Weapon Upgrade', icon: '⚔️', claimed: false },
                    { day: 7, type: 'cosmetic', item: 'Legendary Skin', icon: '👑', claimed: false }
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

                // Check if streak continues
                const isConsecutive = lastClaimDate === yesterday;
                const newStreak = isConsecutive ? currentStreak + 1 : 1;

                // Get current day reward (cycles through 7 days)
                const dayIndex = (newStreak - 1) % 7;
                const reward = { ...rewards[dayIndex], claimed: true };

                set({
                    lastClaimDate: today,
                    currentStreak: newStreak,
                    longestStreak: Math.max(longestStreak, newStreak),
                    totalClaimed: totalClaimed + 1,
                    rewards: rewards.map((r, i) =>
                        i === dayIndex ? { ...r, claimed: true } : r
                    ),
                    showRewardModal: true
                });

                return reward;
            },

            setShowRewardModal: (show: boolean) => set({ showRewardModal: show }),

            resetStreak: () => set({ currentStreak: 0 })
        }),
        {
            name: 'nightflare-daily-rewards'
        }
    )
);

// Daily Reward Modal Component
export const DailyRewardModal: React.FC = () => {
    const {
        rewards,
        currentStreak,
        longestStreak,
        canClaimToday,
        claimDailyReward,
        showRewardModal,
        setShowRewardModal
    } = useDailyRewardStore();

    const [claimedReward, setClaimedReward] = useState<DailyReward | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleClaim = () => {
        const reward = claimDailyReward();
        if (reward) {
            setClaimedReward(reward);
            setShowCelebration(true);

            // Hide celebration after 3 seconds
            setTimeout(() => {
                setShowCelebration(false);
            }, 3000);
        }
    };

    const handleClose = () => {
        setShowRewardModal(false);
        setClaimedReward(null);
        setShowCelebration(false);
    };

    if (!showRewardModal) return null;

    const currentDayIndex = (currentStreak % 7) || 7;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">

            {/* Celebration Effect */}
            {showCelebration && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-2xl animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${1 + Math.random()}s`
                            }}
                        >
                            {['🎉', '✨', '🎊', '⭐', '💫'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-2 border-white/10 shadow-2xl relative overflow-hidden">

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white/70 hover:text-white transition-all z-50 border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                    aria-label="Close"
                >
                    <span className="text-xl font-bold">✕</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6 relative z-10">
                    <div className="text-5xl mb-3 animate-bounce">🎁</div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                        Daily Rewards
                    </h2>
                    <p className="text-white/60 text-sm uppercase tracking-wider font-bold">
                        Login every day for amazing rewards!
                    </p>
                </div>

                {/* Streak Info */}
                <div className="flex justify-center gap-4 mb-6 relative z-10">
                    <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                        <div className="text-white/50 text-xs uppercase font-bold mb-1">Current Streak</div>
                        <div className="text-orange-500 text-2xl font-black text-center">{currentStreak} 🔥</div>
                    </div>
                    <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                        <div className="text-white/50 text-xs uppercase font-bold mb-1">Best Streak</div>
                        <div className="text-purple-500 text-2xl font-black text-center">{longestStreak} ⭐</div>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-6 relative z-10">
                    {rewards.map((reward, index) => {
                        const isToday = index + 1 === currentDayIndex;
                        const isClaimed = reward.claimed;
                        const isAvailable = canClaimToday() && isToday;

                        return (
                            <div
                                key={reward.day}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all relative ${isToday && !isClaimed
                                    ? 'bg-gradient-to-br from-orange-600 to-red-600 border-yellow-400 shadow-[0_0_30px_rgba(251,146,60,0.6)] scale-110 animate-pulse'
                                    : isClaimed
                                        ? 'bg-green-900/30 border-green-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {/* Day number */}
                                <div className={`text-[10px] font-black uppercase mb-1 ${isToday ? 'text-yellow-300' : isClaimed ? 'text-green-400' : 'text-white/50'
                                    }`}>
                                    Day {reward.day}
                                </div>

                                {/* Icon */}
                                <div className={`text-2xl sm:text-3xl mb-1 ${isClaimed ? 'grayscale opacity-50' : ''}`}>
                                    {reward.icon}
                                </div>

                                {/* Amount/Item */}
                                <div className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight ${isToday ? 'text-white' : isClaimed ? 'text-green-400' : 'text-white/70'
                                    }`}>
                                    {reward.amount ? `${reward.amount}` : reward.item}
                                </div>

                                {/* Claimed checkmark */}
                                {isClaimed && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                        ✓
                                    </div>
                                )}

                                {/* Today indicator */}
                                {isToday && !isClaimed && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                        Today
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Claim Button or Status */}
                <div className="relative z-10">
                    {canClaimToday() ? (
                        <button
                            onClick={handleClaim}
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white font-black text-xl uppercase tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(251,146,60,0.4)] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative z-10">🎁 Claim Today's Reward</span>
                        </button>
                    ) : (
                        <div className="w-full py-4 bg-white/5 rounded-xl text-white/50 font-bold text-center border border-white/10">
                            ✓ Come back tomorrow for your next reward!
                        </div>
                    )}
                </div>

                {/* Claimed Reward Display */}
                {claimedReward && showCelebration && (
                    <div className="mt-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-4 border-2 border-green-500/50 animate-in zoom-in duration-300 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">{claimedReward.icon}</div>
                            <div className="flex-1">
                                <div className="text-green-400 text-xs uppercase font-black mb-1">Reward Claimed!</div>
                                <div className="text-white font-bold">
                                    {claimedReward.amount && `+${claimedReward.amount} ${claimedReward.type}`}
                                    {claimedReward.item && claimedReward.item}
                                </div>
                            </div>
                            <div className="text-3xl animate-bounce">🎉</div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex justify-center opacity-30 relative z-10 scale-75">
                    <DeeJayLabsLogo />
                </div>
            </div>
        </div>
    );
};

export default useDailyRewardStore;
