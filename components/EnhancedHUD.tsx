import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';

const EnhancedHUD: React.FC = () => {
    const {
        resources,
        playerStats,
        score,
        wave,
        level,
        levelTimer,
        challengeState,
        arenaStats
    } = useGameStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 safe-padding">
            {/* Top Left: Resources - Sleek Cards - MOBILE OPTIMIZED */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto">
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🪵</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.wood}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🪨</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.stone}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-yellow-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-yellow-500/20">
                            <span className="text-base sm:text-2xl drop-shadow-lg">✨</span>
                            <span className="text-yellow-400 font-mono font-bold text-xs sm:text-lg">{resources.lightShards}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                            <span className="text-base sm:text-2xl drop-shadow-lg">🍖</span>
                            <span className="text-white font-mono font-bold text-xs sm:text-lg">{resources.food}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Right: Stats & Rank - MOBILE OPTIMIZED */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto">
                    <div className="flex flex-col gap-1.5 sm:gap-3">
                        {/* Wave */}
                        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-orange-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-orange-500/20">
                            <span className="text-white/60 text-[9px] sm:text-xs uppercase font-bold tracking-wider">Wave</span>
                            <span className="text-orange-400 font-black text-lg sm:text-2xl">{wave}</span>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-cyan-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-cyan-500/20">
                            <span className="text-white/60 text-[9px] sm:text-xs uppercase font-bold tracking-wider">Score</span>
                            <span className="text-cyan-400 font-mono font-bold text-xs sm:text-lg">{score.toLocaleString()}</span>
                        </div>

                        {/* Rank Badge */}
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-500/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-purple-500/20">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${arenaStats.rank === 'LEGEND' ? 'bg-yellow-500 text-black' :
                                arenaStats.rank === 'DIAMOND' ? 'bg-cyan-400 text-black' :
                                    arenaStats.rank === 'PLATINUM' ? 'bg-slate-300 text-black' :
                                        arenaStats.rank === 'GOLD' ? 'bg-yellow-600 text-black' :
                                            arenaStats.rank === 'SILVER' ? 'bg-slate-400 text-black' :
                                                'bg-orange-700 text-white'
                                }`}>
                                {arenaStats.rank[0]}
                            </div>
                            <span className="text-white font-bold text-[10px] sm:text-sm">{arenaStats.rank}</span>
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
