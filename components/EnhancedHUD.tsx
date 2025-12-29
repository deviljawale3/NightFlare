import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { IslandTheme } from '../types';

const EnhancedHUD: React.FC = () => {
    const {
        resources,
        playerStats,
        score,
        wave,
        level,
        levelTimer,
        challengeState,
        arenaStats,
        kills,
        islandTheme,
        getNightName
    } = useGameStore();

    // Location-themed color schemes
    const themeColors = {
        [IslandTheme.FOREST]: {
            primary: 'from-green-900/90 to-emerald-800/70',
            accent: 'border-green-500/30',
            glow: 'shadow-[0_8px_32px_rgba(34,197,94,0.3)]',
            text: 'text-green-400',
            badge: 'bg-green-500/20 border-green-500/40'
        },
        [IslandTheme.VOLCANO]: {
            primary: 'from-red-900/90 to-orange-800/70',
            accent: 'border-red-500/30',
            glow: 'shadow-[0_8px_32px_rgba(239,68,68,0.3)]',
            text: 'text-red-400',
            badge: 'bg-red-500/20 border-red-500/40'
        },
        [IslandTheme.ARCTIC]: {
            primary: 'from-blue-900/90 to-cyan-800/70',
            accent: 'border-cyan-500/30',
            glow: 'shadow-[0_8px_32px_rgba(6,182,212,0.3)]',
            text: 'text-cyan-400',
            badge: 'bg-cyan-500/20 border-cyan-500/40'
        }
    };

    const currentTheme = themeColors[islandTheme];
    const locationName = islandTheme === IslandTheme.FOREST ? '🌲 Forest Realm' :
        islandTheme === IslandTheme.VOLCANO ? '🌋 Volcanic Wastes' :
            '❄️ Arctic Tundra';

    // Rank tier configuration
    const getRankConfig = (rank: string) => {
        switch (rank) {
            case 'LEGEND':
                return { color: 'bg-gradient-to-br from-yellow-400 to-amber-500', icon: '👑', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.8)]' };
            case 'DIAMOND':
                return { color: 'bg-gradient-to-br from-cyan-400 to-blue-500', icon: '💎', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.6)]' };
            case 'PLATINUM':
                return { color: 'bg-gradient-to-br from-slate-300 to-slate-400', icon: '⭐', glow: 'shadow-[0_0_12px_rgba(203,213,225,0.5)]' };
            case 'GOLD':
                return { color: 'bg-gradient-to-br from-yellow-600 to-yellow-700', icon: '🥇', glow: 'shadow-[0_0_10px_rgba(202,138,4,0.4)]' };
            case 'SILVER':
                return { color: 'bg-gradient-to-br from-slate-400 to-slate-500', icon: '🥈', glow: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]' };
            default:
                return { color: 'bg-gradient-to-br from-orange-700 to-orange-800', icon: '🥉', glow: '' };
        }
    };

    const rankConfig = getRankConfig(arenaStats.rank);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 safe-padding">
            {/* Top Left: Resources - Sleek Cards - MOBILE OPTIMIZED */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                <div className="bg-black/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-all duration-300 hover:border-white/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/5 to-transparent blur-xl opacity-50" />

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-3 relative z-10">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-white/10 transition-all hover:bg-white/15">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🪵</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.wood}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-white/10 transition-all hover:bg-white/15">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🪨</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.stone}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-yellow-500/15 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-yellow-500/30 transition-all hover:bg-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <span className="text-base sm:text-2xl drop-shadow-lg">✨</span>
                            <span className="text-yellow-400 font-mono font-bold text-xs sm:text-lg">{resources.lightShards}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-white/10 transition-all hover:bg-white/15">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🍖</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.food}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Right: Stats, Rank & Kills - MOBILE OPTIMIZED */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <div className={`bg-gradient-to-br ${currentTheme.primary} backdrop-blur-2xl rounded-xl sm:rounded-2xl p-2 sm:p-4 border ${currentTheme.accent} ${currentTheme.glow} pointer-events-auto transition-all duration-500`}>
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        {/* Location + Wave */}
                        <div className={`flex items-center justify-between gap-2 sm:gap-4 ${currentTheme.badge} rounded-lg px-2 sm:px-3 py-1 sm:py-2 border`}>
                            <span className="text-white/60 text-[9px] sm:text-xs uppercase font-bold tracking-wider">{locationName}</span>
                            <span className={`${currentTheme.text} font-black text-lg sm:text-2xl`}>{getNightName(wave)}</span>
                        </div>

                        {/* Kill Counter */}
                        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-red-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-red-500/20">
                            <span className="text-white/60 text-[9px] sm:text-xs uppercase font-bold tracking-wider">💀 Kills</span>
                            <span className="text-red-400 font-black text-lg sm:text-2xl tabular-nums">{kills}</span>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-cyan-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-cyan-500/20">
                            <span className="text-white/60 text-[9px] sm:text-xs uppercase font-bold tracking-wider">Score</span>
                            <span className="text-cyan-400 font-mono font-bold text-xs sm:text-lg">{score.toLocaleString()}</span>
                        </div>

                        {/* Enhanced Rank Badge */}
                        <div className={`flex items-center gap-1.5 sm:gap-2 ${currentTheme.badge} rounded-lg px-2 sm:px-3 py-1 sm:py-2 border relative overflow-hidden`}>
                            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-lg sm:text-2xl ${rankConfig.color} ${rankConfig.glow} animate-pulse`}>
                                {rankConfig.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-black text-[10px] sm:text-sm uppercase">{arenaStats.rank}</span>
                                <span className="text-white/50 text-[8px] sm:text-[10px] font-mono">{arenaStats.rankPoints} pts</span>
                            </div>
                            {/* Animated background shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Center: Timer/Challenge Status - MOBILE OPTIMIZED */}
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 max-w-[90vw] sm:max-w-none">
                {challengeState?.isActive ? (
                    // PvP Challenge HUD
                    <div className="bg-gradient-to-br from-red-900/90 to-black/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-500/30 shadow-[0_8px_32px_rgba(220,38,38,0.6)] min-w-[280px] sm:min-w-[400px]">
                        <div className="text-center mb-2 sm:mb-3">
                            <div className="text-red-500 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center justify-center gap-1.5 sm:gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
                                SHADOW DUEL
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2">
                            <div className="text-center">
                                <div className="text-white/50 text-[8px] sm:text-[10px] uppercase font-bold mb-0.5 sm:mb-1">You</div>
                                <div className="text-green-400 text-xl sm:text-3xl font-black tabular-nums">{score}</div>
                            </div>

                            <div className="flex-1 h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (score / (score + challengeState.opponent.score)) * 100)}%` }}
                                />
                            </div>

                            <div className="text-center">
                                <div className="text-white/50 text-[8px] sm:text-[10px] uppercase font-bold mb-0.5 sm:mb-1 truncate max-w-[60px] sm:max-w-none">{challengeState.opponent.name}</div>
                                <div className="text-red-400 text-xl sm:text-3xl font-black tabular-nums">{Math.floor(challengeState.opponent.score)}</div>
                            </div>
                        </div>

                        <div className="text-center text-white/40 text-xs sm:text-sm font-mono">{formatTime(levelTimer)} remaining</div>
                    </div>
                ) : (
                    // Normal Timer
                    <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-2xl rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                        <div className="text-orange-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center mb-0.5 sm:mb-1">
                            Survive Level {level}
                        </div>
                        <div className="text-white text-2xl sm:text-4xl font-black tabular-nums text-center">
                            {formatTime(levelTimer)}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Center: Health & Nova - MOBILE OPTIMIZED */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 max-w-[95vw] sm:max-w-none">
                <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto">
                    {/* Health Bar */}
                    <div className="mb-3 sm:mb-4">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                            <span className="text-white/70 text-[9px] sm:text-xs uppercase font-bold tracking-wider">Health</span>
                            <span className="text-white font-mono font-bold text-[10px] sm:text-base">{playerStats.currentHealth}/{playerStats.maxHealth}</span>
                        </div>
                        <div className="w-[280px] sm:w-80 h-3 sm:h-4 bg-black/50 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                            <div
                                className={`h-full transition-all duration-300 ${playerStats.currentHealth / playerStats.maxHealth > 0.5 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    playerStats.currentHealth / playerStats.maxHealth > 0.25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                        'bg-gradient-to-r from-red-600 to-red-700 animate-pulse'
                                    }`}
                                style={{ width: `${(playerStats.currentHealth / playerStats.maxHealth) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Nova Charge */}
                    <div>
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                            <span className="text-white/70 text-[9px] sm:text-xs uppercase font-bold tracking-wider">Nova Charge</span>
                            <span className={`font-mono font-bold text-[10px] sm:text-base ${playerStats.novaCharge >= 100 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                                {playerStats.novaCharge}%
                            </span>
                        </div>
                        <div className="w-[280px] sm:w-80 h-3 sm:h-4 bg-black/50 rounded-full overflow-hidden border-2 border-yellow-500/30 shadow-inner relative">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 transition-all duration-300"
                                style={{ width: `${playerStats.novaCharge}%` }}
                            />
                            {playerStats.novaCharge >= 100 && (
                                <>
                                    <div className="absolute inset-0 bg-yellow-400/30 animate-pulse" />
                                    <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm animate-pulse" />
                                </>
                            )}
                        </div>
                        {playerStats.novaCharge >= 100 && (
                            <div className="text-center mt-1.5 sm:mt-2 text-yellow-400 text-[9px] sm:text-xs font-black uppercase tracking-wider animate-pulse">
                                ⚡ READY TO UNLEASH ⚡
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Right: Controls Hint - HIDDEN ON MOBILE */}
            <div className="absolute bottom-4 right-4 hidden md:block">
                <div className="bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10 text-white/40 text-xs">
                    <div className="flex gap-4">
                        <span><kbd className="bg-white/10 px-2 py-1 rounded">WASD</kbd> Move</span>
                        <span><kbd className="bg-white/10 px-2 py-1 rounded">SPACE</kbd> Jump</span>
                        <span><kbd className="bg-white/10 px-2 py-1 rounded">CLICK</kbd> Attack</span>
                        <span><kbd className="bg-white/10 px-2 py-1 rounded">Q</kbd> Nova</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedHUD;
