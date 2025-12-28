import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Achievement Types
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'combat' | 'survival' | 'collection' | 'social' | 'mastery' | 'special';
    requirement: number;
    progress: number;
    unlocked: boolean;
    unlockedAt?: number;
    reward?: {
        type: 'resources' | 'cosmetic' | 'title';
        amount?: number;
        item?: string;
    };
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Achievement Store
interface AchievementStore {
    achievements: Achievement[];
    recentUnlock: Achievement | null;
    totalPoints: number;

    initializeAchievements: () => void;
    updateProgress: (id: string, progress: number) => void;
    unlockAchievement: (id: string) => void;
    clearRecentUnlock: () => void;
    getAchievementsByCategory: (category: string) => Achievement[];
    getUnlockedCount: () => number;
    getCompletionPercentage: () => number;
}

export const useAchievementStore = create<AchievementStore>()(
    persist(
        (set, get) => ({
            achievements: [],
            recentUnlock: null,
            totalPoints: 0,

            initializeAchievements: () => {
                const defaultAchievements: Achievement[] = [
                    // Combat Achievements
                    {
                        id: 'first_blood',
                        title: 'First Blood',
                        description: 'Defeat your first shadow creature',
                        icon: '⚔️',
                        category: 'combat',
                        requirement: 1,
                        progress: 0,
                        unlocked: false,
                        rarity: 'common',
                        reward: { type: 'resources', amount: 50 }
                    },
                    {
                        id: 'shadow_slayer',
                        title: 'Shadow Slayer',
                        description: 'Defeat 100 shadow creatures',
                        icon: '🗡️',
                        category: 'combat',
                        requirement: 100,
                        progress: 0,
                        unlocked: false,
                        rarity: 'rare',
                        reward: { type: 'resources', amount: 500 }
                    },
                    {
                        id: 'shadow_hunter',
                        title: 'Shadow Hunter',
                        description: 'Defeat 500 shadow creatures',
                        icon: '⚡',
                        category: 'combat',
                        requirement: 500,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'cosmetic', item: 'Hunter Skin' }
                    },
                    {
                        id: 'shadow_legend',
                        title: 'Shadow Legend',
                        description: 'Defeat 1000 shadow creatures',
                        icon: '👑',
                        category: 'combat',
                        requirement: 1000,
                        progress: 0,
                        unlocked: false,
                        rarity: 'legendary',
                        reward: { type: 'title', item: 'Legendary Hunter' }
                    },

                    // Survival Achievements
                    {
                        id: 'survivor',
                        title: 'Survivor',
                        description: 'Survive 5 nights',
                        icon: '🌙',
                        category: 'survival',
                        requirement: 5,
                        progress: 0,
                        unlocked: false,
                        rarity: 'common',
                        reward: { type: 'resources', amount: 100 }
                    },
                    {
                        id: 'night_owl',
                        title: 'Night Owl',
                        description: 'Survive 10 nights',
                        icon: '🦉',
                        category: 'survival',
                        requirement: 10,
                        progress: 0,
                        unlocked: false,
                        rarity: 'rare',
                        reward: { type: 'resources', amount: 300 }
                    },
                    {
                        id: 'eternal_guardian',
                        title: 'Eternal Guardian',
                        description: 'Survive 25 nights',
                        icon: '🛡️',
                        category: 'survival',
                        requirement: 25,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'cosmetic', item: 'Guardian Armor' }
                    },

                    // Collection Achievements
                    {
                        id: 'gatherer',
                        title: 'Gatherer',
                        description: 'Collect 100 resources',
                        icon: '🪵',
                        category: 'collection',
                        requirement: 100,
                        progress: 0,
                        unlocked: false,
                        rarity: 'common',
                        reward: { type: 'resources', amount: 50 }
                    },
                    {
                        id: 'hoarder',
                        title: 'Hoarder',
                        description: 'Collect 1000 resources',
                        icon: '💎',
                        category: 'collection',
                        requirement: 1000,
                        progress: 0,
                        unlocked: false,
                        rarity: 'rare',
                        reward: { type: 'resources', amount: 200 }
                    },
                    {
                        id: 'treasure_hunter',
                        title: 'Treasure Hunter',
                        description: 'Collect 100 Light Shards',
                        icon: '✨',
                        category: 'collection',
                        requirement: 100,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'resources', amount: 500 }
                    },

                    // Social Achievements
                    {
                        id: 'social_butterfly',
                        title: 'Social Butterfly',
                        description: 'Share your first clip',
                        icon: '📱',
                        category: 'social',
                        requirement: 1,
                        progress: 0,
                        unlocked: false,
                        rarity: 'common',
                        reward: { type: 'resources', amount: 50 }
                    },
                    {
                        id: 'influencer',
                        title: 'Influencer',
                        description: 'Share 10 clips',
                        icon: '🎬',
                        category: 'social',
                        requirement: 10,
                        progress: 0,
                        unlocked: false,
                        rarity: 'rare',
                        reward: { type: 'cosmetic', item: 'Streamer Badge' }
                    },
                    {
                        id: 'arena_champion',
                        title: 'Arena Champion',
                        description: 'Win 10 PvP matches',
                        icon: '🏆',
                        category: 'social',
                        requirement: 10,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'title', item: 'Champion' }
                    },

                    // Mastery Achievements
                    {
                        id: 'nova_master',
                        title: 'Nova Master',
                        description: 'Use Nova ability 50 times',
                        icon: '🔥',
                        category: 'mastery',
                        requirement: 50,
                        progress: 0,
                        unlocked: false,
                        rarity: 'rare',
                        reward: { type: 'resources', amount: 300 }
                    },
                    {
                        id: 'perfect_defense',
                        title: 'Perfect Defense',
                        description: 'Complete a wave without taking damage',
                        icon: '🛡️',
                        category: 'mastery',
                        requirement: 1,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'resources', amount: 500 }
                    },
                    {
                        id: 'speedrunner',
                        title: 'Speedrunner',
                        description: 'Complete a wave in under 60 seconds',
                        icon: '⚡',
                        category: 'mastery',
                        requirement: 1,
                        progress: 0,
                        unlocked: false,
                        rarity: 'epic',
                        reward: { type: 'cosmetic', item: 'Speed Trails' }
                    },

                    // Special Achievements
                    {
                        id: 'completionist',
                        title: 'Completionist',
                        description: 'Unlock all other achievements',
                        icon: '🌟',
                        category: 'special',
                        requirement: 15, // Total other achievements
                        progress: 0,
                        unlocked: false,
                        rarity: 'legendary',
                        reward: { type: 'title', item: 'The Complete' }
                    }
                ];

                set({ achievements: defaultAchievements });
            },

            updateProgress: (id: string, progress: number) => {
                set(state => ({
                    achievements: state.achievements.map(achievement => {
                        if (achievement.id === id && !achievement.unlocked) {
                            const newProgress = Math.min(progress, achievement.requirement);
                            const shouldUnlock = newProgress >= achievement.requirement;

                            if (shouldUnlock) {
                                get().unlockAchievement(id);
                            }

                            return { ...achievement, progress: newProgress };
                        }
                        return achievement;
                    })
                }));
            },

            unlockAchievement: (id: string) => {
                set(state => {
                    const achievement = state.achievements.find(a => a.id === id);
                    if (!achievement || achievement.unlocked) return state;

                    const updatedAchievement = {
                        ...achievement,
                        unlocked: true,
                        unlockedAt: Date.now(),
                        progress: achievement.requirement
                    };

                    return {
                        achievements: state.achievements.map(a =>
                            a.id === id ? updatedAchievement : a
                        ),
                        recentUnlock: updatedAchievement,
                        totalPoints: state.totalPoints + (achievement.rarity === 'legendary' ? 100 :
                            achievement.rarity === 'epic' ? 50 :
                                achievement.rarity === 'rare' ? 25 : 10)
                    };
                });
            },

            clearRecentUnlock: () => set({ recentUnlock: null }),

            getAchievementsByCategory: (category: string) => {
                return get().achievements.filter(a => a.category === category);
            },

            getUnlockedCount: () => {
                return get().achievements.filter(a => a.unlocked).length;
            },

            getCompletionPercentage: () => {
                const total = get().achievements.length;
                const unlocked = get().getUnlockedCount();
                return Math.round((unlocked / total) * 100);
            }
        }),
        {
            name: 'nightflare-achievements'
        }
    )
);

// Achievement Popup Component
export const AchievementPopup: React.FC = () => {
    const { recentUnlock, clearRecentUnlock } = useAchievementStore();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (recentUnlock) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(clearRecentUnlock, 500);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [recentUnlock]);

    if (!recentUnlock || !show) return null;

    const rarityColors = {
        common: 'from-gray-600 to-gray-800',
        rare: 'from-blue-600 to-blue-800',
        epic: 'from-purple-600 to-purple-800',
        legendary: 'from-yellow-500 to-orange-600'
    };

    const rarityGlow = {
        common: 'shadow-[0_0_20px_rgba(156,163,175,0.5)]',
        rare: 'shadow-[0_0_30px_rgba(37,99,235,0.6)]',
        epic: 'shadow-[0_0_40px_rgba(147,51,234,0.7)]',
        legendary: 'shadow-[0_0_50px_rgba(251,146,60,0.8)]'
    };

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] animate-in slide-in-from-top-8 duration-500 pointer-events-none">
            <div className={`bg-gradient-to-br ${rarityColors[recentUnlock.rarity]} backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 ${rarityGlow[recentUnlock.rarity]} min-w-[320px] max-w-md`}>

                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl animate-bounce">{recentUnlock.icon}</div>
                    <div className="flex-1">
                        <div className="text-yellow-300 text-xs uppercase font-black tracking-wider mb-1">
                            🎉 Achievement Unlocked!
                        </div>
                        <div className="text-white text-lg font-black uppercase tracking-tight">
                            {recentUnlock.title}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-white/80 text-sm mb-3 italic">
                    {recentUnlock.description}
                </p>

                {/* Reward */}
                {recentUnlock.reward && (
                    <div className="bg-black/30 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-white/60 text-xs uppercase font-bold">Reward</span>
                        <span className="text-yellow-300 text-sm font-bold">
                            {recentUnlock.reward.type === 'resources' && `+${recentUnlock.reward.amount} Resources`}
                            {recentUnlock.reward.type === 'cosmetic' && `🎨 ${recentUnlock.reward.item}`}
                            {recentUnlock.reward.type === 'title' && `👑 ${recentUnlock.reward.item}`}
                        </span>
                    </div>
                )}

                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${recentUnlock.rarity === 'legendary' ? 'bg-yellow-500 text-black' :
                            recentUnlock.rarity === 'epic' ? 'bg-purple-500 text-white' :
                                recentUnlock.rarity === 'rare' ? 'bg-blue-500 text-white' :
                                    'bg-gray-500 text-white'
                        }`}>
                        {recentUnlock.rarity}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default useAchievementStore;
