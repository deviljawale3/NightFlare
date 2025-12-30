import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { TimeOfDay, GameState } from '../types';
import ChatPanel from './ChatPanel';
import SocialShare from './SocialShare';
import Minimap from './Minimap';
import OrientationToggle from './OrientationToggle';
import CameraControls from './CameraControls';
import PremiumJoystick from './PremiumJoystick';
import BossHealthBar from './BossHealthBar';
import { getHapticManager } from './HapticFeedback';
interface PremiumHUDProps {
    onOpenInventory: () => void;
    onOpenCrafting: () => void;
    onOpenConstellation?: () => void;
    onOpenOperations?: () => void;
}

const PremiumHUD: React.FC<PremiumHUDProps> = ({ onOpenInventory, onOpenCrafting, onOpenConstellation, onOpenOperations }) => {
    const {
        resources, playerStats, nightflareHealth, level, levelTimer, chatMessages,
        setGameState, triggerNova, isPlayerGrounded, wave, score, challengeState,
        kills, bestScore, islandTheme, notification, combo, constellation, cycleWeapon
    } = useGameStore();

    const haptics = getHapticManager();

    const [showChat, setShowChat] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const lastMsgCount = useRef(chatMessages.length);

    React.useEffect(() => {
        if (chatMessages.length > lastMsgCount.current && !showChat) {
            setHasUnread(true);
        }
        lastMsgCount.current = chatMessages.length;
    }, [chatMessages.length, showChat]);

    React.useEffect(() => {
        if (showChat) setHasUnread(false);
    }, [showChat]);

    // Ranking system
    const getRank = (points: number): { name: string; color: string; icon: string; min: number; max: number } => {
        if (points >= 75000) return { name: 'LEGEND', color: '#FFD700', icon: '👑', min: 75000, max: 999999 };
        if (points >= 35000) return { name: 'DIAMOND', color: '#B9F2FF', icon: '💎', min: 35000, max: 75000 };
        if (points >= 15000) return { name: 'PLATINUM', color: '#E5E4E2', icon: '⭐', min: 15000, max: 35000 };
        if (points >= 5000) return { name: 'GOLD', color: '#FFD700', icon: '🏆', min: 5000, max: 15000 };
        if (points >= 1000) return { name: 'SILVER', color: '#C0C0C0', icon: '🥈', min: 1000, max: 5000 };
        return { name: 'BRONZE', color: '#CD7F32', icon: '🥉', min: 0, max: 1000 };
    };

    const currentRank = getRank(score);
    const rankProgress = ((score - currentRank.min) / (currentRank.max - currentRank.min)) * 100;

    // Location theming
    const getLocationTheme = () => {
        // Use useGameStore.getState() to avoid unnecessary re-renders in hook for static theme data
        const currentBiome = islandTheme;
        const themes: Record<string, { name: string; color: string; bgGradient: string; accentColor: string }> = {
            FOREST: { name: 'Sylvan Wilds', color: '#4ADE80', bgGradient: 'from-green-900/90 to-black/95', accentColor: '#22C55E' },
            DESERT: { name: 'Solaris Wastes', color: '#FACC15', bgGradient: 'from-yellow-900/90 to-black/95', accentColor: '#EAB308' },
            VOLCANO: { name: 'Igneous Peak', color: '#FB7185', bgGradient: 'from-red-900/90 to-black/95', accentColor: '#F43F5E' },
            ARCTIC: { name: 'Glacial Void', color: '#38BDF8', bgGradient: 'from-blue-900/90 to-black/95', accentColor: '#0EA5E9' },
            VOID: { name: 'Singularity', color: '#A855F7', bgGradient: 'from-purple-900/90 to-black/95', accentColor: '#9333EA' },
            CELESTIAL: { name: 'Quasar Hub', color: '#00F2FF', bgGradient: 'from-cyan-900/90 to-black/95', accentColor: '#00D1FF' },
            CRYSTAL: { name: 'Prism Mines', color: '#E879F9', bgGradient: 'from-pink-900/90 to-black/95', accentColor: '#D946EF' },
            CORRUPTION: { name: 'Rotting Maw', color: '#84CC16', bgGradient: 'from-lime-900/90 to-black/95', accentColor: '#65A30D' },
            ABYSS: { name: 'Deep Trench', color: '#4338CA', bgGradient: 'from-indigo-900/90 to-black/95', accentColor: '#3730A3' },
            ETERNAL_SHADOW: { name: 'Master Apex', color: '#F9FAFB', bgGradient: 'from-slate-900/90 to-black/95', accentColor: '#FFFFFF' }
        };

        const theme = themes[currentBiome] || themes.FOREST;
        return theme;
    };

    const locationTheme = getLocationTheme();
    const premiumLevelName = useGameStore(s => s.getNightName(level));

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full h-full flex flex-col justify-between p-2 sm:p-6 select-none pointer-events-none overflow-hidden relative safe-padding">

            {/* GLOBAL NOTIFICATION BANNER */}
            {notification && notification.visible && (
                <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none p-4">
                    <div className="flex flex-col items-center animate-in zoom-in fade-in slide-in-from-top-12 duration-1000 w-full max-w-4xl">
                        <div className={`
                            backdrop-blur-3xl px-8 sm:px-20 py-8 sm:py-12 text-center 
                            rounded-[2.5rem] sm:rounded-[4rem] border-4 
                            shadow-[0_0_100px_rgba(0,0,0,0.8)]
                            ${notification.type === 'night'
                                ? 'bg-red-950/90 border-red-500/50 shadow-red-900/40'
                                : 'bg-slate-900/90 border-blue-500/50 shadow-blue-900/40'}
                        `}>
                            <div className={`font-black tracking-[0.3em] sm:tracking-[0.8em] text-[8px] sm:text-sm uppercase mb-3 sm:mb-5 animate-pulse
                                ${notification.type === 'night' ? 'text-red-500' : 'text-blue-400'}
                            `}>
                                {notification.subtext || "ALERT"}
                            </div>
                            <h1 className="text-white text-3xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,1)] leading-none">
                                {notification.text}
                            </h1>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT OVERLAY */}
            {showChat && (
                <div className="absolute top-20 left-2 sm:left-4 z-50 w-[85vw] sm:w-96 h-72 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl rounded-3xl border-2 border-cyan-400/20 pointer-events-auto flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in slide-in-from-left-4 duration-200">
                    <div className="flex justify-between items-center p-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-900/20 to-transparent rounded-t-3xl">
                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400 pl-2 text-shadow-sm">📡 Comms</span>
                        <button onClick={() => setShowChat(false)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all">✕</button>
                    </div>
                    <div className="flex-1 overflow-hidden relative p-1">
                        <ChatPanel compact />
                    </div>
                </div>
            )}

            {/* TOP SECTION: HEALTH, TIMER, RESOURCES */}
            <div className="flex justify-between items-start w-full relative min-h-[140px] sm:min-h-[160px]">

                {/* TOP LEFT: TACTICAL HEALTH DISPLAY */}
                <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-red-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto min-w-[140px] sm:min-w-[220px] scale-[0.85] sm:scale-100 origin-top-left transition-transform hover:scale-[0.88] sm:hover:scale-[1.03]">
                    <div className="space-y-2 sm:space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] sm:text-xs font-black text-red-400/80 tracking-widest uppercase italic leading-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    Survivor
                                </span>
                                <span className="text-white text-[11px] sm:text-sm font-black italic leading-none tabular-nums drop-shadow-md">{Math.ceil(playerStats.currentHealth)}%</span>
                            </div>
                            <div className="w-full h-2 sm:h-3.5 bg-black/60 rounded-full overflow-hidden border border-red-900/50 shadow-inner p-[1px]">
                                <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                                    style={{ width: `${(playerStats.currentHealth / playerStats.maxHealth) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] sm:text-xs font-black text-orange-400/80 tracking-widest uppercase italic leading-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                                    Core
                                </span>
                                <span className="text-orange-300 text-[11px] sm:text-sm font-black italic leading-none tabular-nums drop-shadow-md">{Math.ceil(nightflareHealth)}%</span>
                            </div>
                            <div className="w-full h-2 sm:h-3.5 bg-black/60 rounded-full overflow-hidden border border-orange-900/50 shadow-inner p-[1px]">
                                <div className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(251,146,60,0.6)]"
                                    style={{ width: `${nightflareHealth}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <BossHealthBar />

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none top-0 z-10">
                    <div className="bg-black/60 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-white/10 text-center shadow-2xl mt-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ transform: `scaleX(${playerStats.xp / (playerStats.level * 1000)})` }} />
                        <div className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.25em] italic mb-0 text-cyan-400 whitespace-nowrap drop-shadow-[0_0_10px_#06b6d4]">
                            {premiumLevelName}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                            WAVE {wave} • {formatTime(levelTimer)}
                        </div>
                        {/* XP Small Bar */}
                        <div className="w-full h-1 bg-white/15 mt-2 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all duration-500" style={{ width: `${(playerStats.xp / (playerStats.level * 1000)) * 100}%` }} />
                        </div>
                    </div>
                    {/* Tiny Score Pill */}
                    <div className="mt-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 flex items-center gap-4 shadow-lg pointer-events-auto">
                        <span className="text-[10px] font-black text-yellow-400 drop-shadow-md">✨ {score.toLocaleString()}</span>
                        <div className="w-[1.5px] h-3 bg-white/20" />
                        <span className="text-[10px] font-black text-red-400 drop-shadow-md">💀 {kills}</span>
                    </div>

                    {/* COMBO COUNTER */}
                    {combo > 1 && (
                        <div className="mt-3 animate-bounce">
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent text-2xl font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                                COMBO X{combo}
                            </span>
                        </div>
                    )}

                    {/* Ultimate Charge Overlay */}
                    {playerStats.ultimateCharge >= 100 && (
                        <div className="mt-4 animate-in slide-in-from-bottom-2 fade-in">
                            <button
                                onClick={() => { haptics.impact('heavy'); useGameStore.getState().triggerUltimate(); }}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full font-black text-[11px] uppercase tracking-widest text-white border-2 border-white/40 shadow-[0_0_30px_rgba(79,70,229,0.7)] active:scale-95 hover:scale-105 transition-all pointer-events-auto"
                            >
                                READY FOR AWAKENING ⚡
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 sm:gap-4 pointer-events-auto max-w-[180px] sm:max-w-none">
                    {/* RESOURCES GRID - REFINED FOR MOBILE */}
                    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl px-2 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-3xl border-2 border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-x-3 sm:gap-x-6 gap-y-2 shadow-2xl scale-[0.85] sm:scale-100 origin-top-right">
                        {[
                            { type: 'wood', icon: '🪵', color: '#fbbf24' },
                            { type: 'stone', icon: '🪨', color: '#94a3b8' },
                            { type: 'food', icon: '🍎', color: '#f87171' },
                            { type: 'shards', icon: '✨', color: '#22d3ee' },
                            { type: 'titanCores', icon: '⚛️', color: '#ef4444' }
                        ].map(res => (
                            <div key={res.type} className="flex items-center gap-1.5 group">
                                <span className="text-xl sm:text-2xl transition-transform group-hover:scale-125 duration-300 drop-shadow-md">{res.icon}</span>
                                <span className="text-[13px] sm:text-lg font-black tabular-nums drop-shadow-md" style={{ color: locationTheme.accentColor }}>
                                    {res.type === 'shards' ? resources.lightShards : (resources as any)[res.type]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* MINIMAP & UTILITY CLUSTER */}
                    <div className="flex gap-3 items-end scale-[0.9] sm:scale-100 origin-bottom-right">
                        {/* UTILITY BUTTON SET */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowShare(true)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600/50 to-purple-700/40 hover:from-purple-600/70 hover:to-purple-700/60 border-2 border-purple-400/40 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl pointer-events-auto group"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">📸</span>
                            </button>
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${showChat ? 'from-blue-600 to-blue-700 shadow-blue-500/50' : 'from-blue-900/50 to-blue-800/40'} border-2 border-blue-400/40 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl pointer-events-auto relative group`}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
                                {hasUnread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_red] border-2 border-white" />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => useGameStore.getState().setGameState(GameState.PAUSED)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700/50 to-slate-800/40 hover:from-slate-700/70 hover:to-slate-800/60 border-2 border-white/30 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl pointer-events-auto group"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">⏸️</span>
                            </button>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-900/50 to-slate-800/40 border-2 border-cyan-400/30 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl pointer-events-auto">
                                <OrientationToggle />
                            </div>
                        </div>

                        {/* MINIMAP */}
                        <div className="pointer-events-auto backdrop-blur-2xl rounded-2xl border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] p-1.5 overflow-hidden bg-black/40">
                            <Minimap />
                        </div>
                    </div>
                </div>
            </div>

            {/* BRANDING watermark - CONSISTENT LOGO */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none z-0 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center gap-1">
                    <div className="scale-75">
                        <DeeJayLabsLogo />
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: PREMIUM CONTROLS */}
            <div className="flex justify-between items-end w-full pb-4 sm:pb-8 px-2 sm:px-6 relative z-10">

                {/* Premium Joystick - Optimized Scale */}
                <div className="transform scale-[0.75] sm:scale-110 origin-bottom-left ml-0 sm:ml-4">
                    <PremiumJoystick />
                </div>

                {/* Center Utilities - Spacing Fix */}
                <div className="flex flex-col items-center gap-4 sm:gap-8 pointer-events-auto mb-2">
                    <button
                        onClick={() => { haptics.medium(); triggerNova(); }}
                        className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all border-4 ${playerStats.novaCharge >= 100 ? 'bg-gradient-to-br from-orange-500 to-red-600 border-yellow-300 shadow-[0_0_50px_rgba(251,146,60,0.9)] animate-pulse' : 'bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-600/40 opacity-80'}`}>
                        <span className="text-3xl sm:text-5xl text-white drop-shadow-lg">🔥</span>
                        <div className="text-[9px] sm:text-[12px] font-black text-white mt-1 italic tabular-nums drop-shadow-sm">{Math.floor(playerStats.novaCharge)}%</div>
                    </button>
                    <div className="flex gap-3 sm:gap-6 items-end">
                        <button onClick={() => { haptics.light(); onOpenInventory(); }} className="w-12 h-12 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/40 flex items-center justify-center text-2xl sm:text-5xl active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-1">🎒</button>
                        <button onClick={() => { haptics.light(); onOpenCrafting(); }} className="w-14 h-14 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-orange-700 to-orange-800 border-2 border-orange-500/40 flex items-center justify-center text-3xl sm:text-6xl active:scale-95 shadow-[0_15px_35px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-1 border-b-8">🛠️</button>
                        <button onClick={() => { haptics.light(); onOpenConstellation?.(); }} className="w-12 h-12 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-800 border-2 border-indigo-500/40 flex items-center justify-center text-2xl sm:text-5xl active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-1 text-white">🌌</button>
                    </div>
                </div>

                {/* Orbital Command Center */}
                {
                    constellation.find(n => n.id === 'orbital_strike')?.currentLevel! > 0 && (
                        <div className="flex flex-col items-center gap-1 pointer-events-auto absolute bottom-32 right-2 sm:right-40 scale-[0.7] sm:scale-100">
                            <button
                                onClick={() => {
                                    if (useGameStore.getState().resources.titanCores >= 1) {
                                        window.dispatchEvent(new Event('orbital-strike-target'));
                                        useGameStore.getState().consumeResource('titanCores', 1);
                                        useGameStore.getState().showNotification('ORBITAL LAUNCH', 'Target Designated', 'unlock');
                                    } else {
                                        useGameStore.getState().showNotification('OFFLINE', 'Requires 1 Titan Core', 'night');
                                    }
                                }}
                                className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full border-2 border-cyan-400 shadow-[0_0_30px_#06b6d4] active:scale-90 transition-all flex flex-col items-center justify-center group"
                            >
                                <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-500">🛰️</span>
                            </button>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-black/70 px-3 py-0.5 rounded-full border border-cyan-500/40 drop-shadow-lg">Orbital</span>
                        </div>
                    )
                }

                {/* Premium Action Buttons - Optimized Cluster */}
                <div className="flex flex-col items-end gap-3 sm:gap-6 pointer-events-auto scale-[0.85] sm:scale-100 origin-bottom-right">
                    <div className="flex gap-2 sm:gap-4 items-end mb-1 sm:mb-2">
                        {/* Operations Button */}
                        <button
                            onClick={() => { haptics.impact('light'); onOpenOperations?.(); }}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/60 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center text-2xl hover:bg-white/10 active:scale-90 transition-all shadow-2xl group"
                        >
                            <span className="group-hover:rotate-12 transition-transform drop-shadow-md">📋</span>
                        </button>
                        {/* Weapon Cycle Button */}
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => { haptics.light(); cycleWeapon(); }}
                                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/50 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 shadow-2xl hover:scale-105"
                                title="Switch Weapon"
                            >
                                <span className="text-xl sm:text-2xl drop-shadow-md">🔄</span>
                            </button>
                            <span className="text-[8px] sm:text-[9px] font-black text-cyan-400 uppercase tracking-tighter bg-black/50 px-2 rounded-full border border-cyan-500/20">{playerStats.currentWeapon}</span>
                        </div>
                        <button
                            onPointerDown={() => { haptics.light(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); }}
                            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }))}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-emerald-700 border-2 border-green-300/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-90 hover:scale-105"
                            title="Harvest/Interact"
                        >
                            <span className="text-2xl sm:text-3xl text-white drop-shadow-md">🤚</span>
                        </button>
                        <button
                            onPointerDown={() => { haptics.medium(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); }}
                            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }))}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 border-2 border-orange-300/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-90 hover:scale-105"
                            title="Dash/Roll"
                        >
                            <span className="text-2xl sm:text-3xl text-white drop-shadow-md">⚡</span>
                        </button>
                        <button
                            onPointerDown={() => { if (isPlayerGrounded) { haptics.jump(); window.dispatchEvent(new Event('player-jump')); } }}
                            className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-300/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-90 hover:scale-105 ${!isPlayerGrounded ? 'opacity-30 grayscale' : 'opacity-100'}`}
                            title="Jump"
                        >
                            <span className="text-2xl sm:text-3xl text-white drop-shadow-md">🌀</span>
                        </button>
                    </div>

                    <button
                        onPointerDown={() => { haptics.heavy(); window.dispatchEvent(new Event('player-attack')); }}
                        className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-600 to-red-700 border-b-[8px] sm:border-b-[12px] border-red-900 rounded-[2.5rem] sm:rounded-[3rem] flex items-center justify-center active:translate-y-2 active:border-b-0 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.6)] hover:scale-[1.02]"
                    >
                        <span className="text-5xl sm:text-7xl drop-shadow-2xl">⚔️</span>
                    </button>
                </div>
            </div>

            {/* Camera Controls Cluster */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 scale-[0.8] sm:scale-100 origin-right">
                <CameraControls />
            </div>

            {showShare && <SocialShare onClose={() => setShowShare(false)} stats={{ wave, score }} />}

            {showChat && (
                <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] z-[9999] pointer-events-auto animate-in slide-in-from-right duration-500 shadow-[-10px_0_50px_rgba(0,0,0,0.8)]">
                    <ChatPanel onClose={() => setShowChat(false)} />
                </div>
            )}
        </div>
    );
};

export default PremiumHUD;
