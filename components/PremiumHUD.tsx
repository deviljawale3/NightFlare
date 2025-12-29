import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { TimeOfDay, GameState } from '../types';
import ChatPanel from './ChatPanel';
import SocialShare from './SocialShare';
import Minimap from './Minimap';
import OrientationToggle from './OrientationToggle';

interface PremiumHUDProps {
    onOpenInventory: () => void;
    onOpenCrafting: () => void;
}

// Premium Joystick with enhanced mobile design
const PremiumJoystick: React.FC = React.memo(() => {
    const [active, setActive] = useState(false);
    const knobRef = useRef<HTMLDivElement>(null);
    const baseRef = useRef<HTMLDivElement>(null);
    const rectRef = useRef<DOMRect | null>(null);

    const handleStart = (e: React.PointerEvent) => {
        if (!baseRef.current) return;
        rectRef.current = baseRef.current.getBoundingClientRect();
        setActive(true);
        (e.target as Element).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!rectRef.current || !knobRef.current) return;

        const width = rectRef.current.width;
        const height = rectRef.current.height;
        const centerX = rectRef.current.left + width / 2;
        const centerY = rectRef.current.top + height / 2;

        const dX = clientX - centerX;
        const dY = clientY - centerY;
        const dist = Math.sqrt(dX ** 2 + dY ** 2) || 0.001;

        const maxDist = window.innerWidth < 640 ? 60 : 80;

        const scale = Math.min(dist, maxDist) / dist;
        const limitedX = dX * scale;
        const limitedY = dY * scale;

        // Performant direct DOM update
        knobRef.current.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

        (window as any).joystickX = limitedX / maxDist;
        (window as any).joystickY = limitedY / maxDist;
    };

    const handleEnd = () => {
        setActive(false);
        if (knobRef.current) knobRef.current.style.transform = `translate(0px, 0px)`;
        rectRef.current = null;
        (window as any).joystickX = 0;
        (window as any).joystickY = 0;
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={baseRef}
                className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-cyan-400/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl pointer-events-auto touch-none flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2),inset_0_0_20px_rgba(0,0,0,0.5)]"
                onPointerDown={handleStart}
                onPointerMove={e => { if (active) handleMove(e.clientX, e.clientY); }}
                onPointerUp={e => { (e.target as Element).releasePointerCapture(e.pointerId); handleEnd(); }}
                onPointerCancel={handleEnd}
            >
                <div
                    ref={knobRef}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 backdrop-blur-md border-2 border-white/40 shadow-[0_0_20px_rgba(6,182,212,0.6)] pointer-events-none transition-transform duration-75 will-change-transform"
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                </div>
            </div>
            <div className="mt-2 text-[10px] font-bold text-cyan-400/60 tracking-widest uppercase">Move</div>
        </div>
    );
});

const PremiumHUD: React.FC<PremiumHUDProps> = ({ onOpenInventory, onOpenCrafting }) => {
    const { resources, playerStats, nightflareHealth, level, levelTimer, chatMessages, setGameState, triggerNova, isPlayerGrounded, wave, score, challengeState } = useGameStore(
        (state) => ({
            resources: state.resources,
            playerStats: state.playerStats,
            nightflareHealth: state.nightflareHealth,
            level: state.level,
            levelTimer: state.levelTimer,
            chatMessages: state.chatMessages,
            setGameState: state.setGameState,
            triggerNova: state.triggerNova,
            isPlayerGrounded: state.isPlayerGrounded,
            wave: state.wave,
            score: state.score,
            challengeState: state.challengeState,
        })
    );

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full h-full flex flex-col justify-between p-2 sm:p-6 select-none pointer-events-none font-['Outfit'] overflow-hidden relative safe-padding">

            {/* CHAT OVERLAY */}
            {showChat && (
                <div className="absolute top-20 left-2 sm:left-4 z-50 w-[85vw] sm:w-96 h-72 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl rounded-3xl border-2 border-cyan-400/20 pointer-events-auto flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in slide-in-from-left-4 duration-200">
                    <div className="flex justify-between items-center p-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-900/20 to-transparent rounded-t-3xl">
                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400 pl-2">📡 Comms</span>
                        <button onClick={() => setShowChat(false)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all">✕</button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <ChatPanel compact />
                    </div>
                </div>
            )}

            {/* TOP SECTION: HEALTH, TIMER, RESOURCES */}
            <div className="flex justify-between items-start w-full relative min-h-[100px] sm:min-h-[120px]">

                {/* TOP LEFT: TACTICAL HEALTH DISPLAY */}
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl p-2 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] pointer-events-auto min-w-[120px] sm:min-w-[220px]">
                    <div className="space-y-2 sm:space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] sm:text-xs font-black text-red-400/80 tracking-widest uppercase italic leading-none flex items-center gap-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    Survivor
                                </span>
                                <span className="text-white text-xs sm:text-sm font-black italic leading-none tabular-nums">{Math.ceil(playerStats.currentHealth)}%</span>
                            </div>
                            <div className="w-full h-2.5 sm:h-3.5 bg-black/40 rounded-full overflow-hidden border border-red-900/50 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                                    style={{ width: `${(playerStats.currentHealth / playerStats.maxHealth) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] sm:text-xs font-black text-orange-400/80 tracking-widest uppercase italic leading-none flex items-center gap-1">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                                    Core
                                </span>
                                <span className="text-orange-300 text-xs sm:text-sm font-black italic leading-none tabular-nums">{Math.ceil(nightflareHealth)}%</span>
                            </div>
                            <div className="w-full h-2.5 sm:h-3.5 bg-black/40 rounded-full overflow-hidden border border-orange-900/50 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(251,146,60,0.6)]"
                                    style={{ width: `${nightflareHealth}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOP CENTER: MISSION TIMER */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none top-0 z-10">
                    {challengeState?.isActive ? (
                        // CHALLENGE MODE UI
                        <div className="bg-gradient-to-br from-red-900/95 to-red-800/90 backdrop-blur-2xl px-4 sm:px-12 py-2 sm:py-5 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-red-400/40 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] min-w-[200px] sm:min-w-[420px]">
                            <div className="text-[9px] sm:text-xs font-black text-red-300 uppercase tracking-[0.3em] italic mb-2 whitespace-nowrap flex items-center justify-center gap-2">
                                <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                                SHADOW DUEL
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex flex-col items-center">
                                    <div className="text-white/60 text-[9px] sm:text-[10px] uppercase font-bold mb-1">You</div>
                                    <div className="text-green-400 text-lg sm:text-3xl font-black tabular-nums">{score}</div>
                                </div>

                                <div className="flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden relative mx-4 border border-white/10">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                                        style={{ width: `${Math.min(100, (score / (score + challengeState.opponent.score)) * 100)}%` }}
                                    />
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-white/60 text-[9px] sm:text-[10px] uppercase font-bold mb-1">{challengeState.opponent.name}</div>
                                    <div className="text-red-400 text-lg sm:text-3xl font-black tabular-nums">{Math.floor(challengeState.opponent.score)}</div>
                                </div>
                            </div>

                            <div className="text-white/40 text-[10px] sm:text-xs font-mono tabular-nums">{formatTime(levelTimer)} remaining</div>
                        </div>
                    ) : (
                        // NORMAL MODE UI
                        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl px-4 sm:px-10 py-2 sm:py-4 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-cyan-400/30 text-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                            <div className="text-[8px] sm:text-xs font-black text-cyan-400 uppercase tracking-[0.2em] italic mb-0.5 whitespace-nowrap">Level {level}</div>
                            <div className="text-xl sm:text-5xl font-black text-white tracking-tighter tabular-nums leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                {formatTime(levelTimer)}
                            </div>
                            <div className="text-[8px] sm:text-sm font-black text-yellow-400 mt-0.5 tracking-widest tabular-nums drop-shadow-md">
                                {score.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* TOP RIGHT: RESOURCES & CONTROLS */}
                <div className="flex flex-col items-end gap-1.5 sm:gap-3 pointer-events-auto">
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl px-2 sm:px-4 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-cyan-400/20 grid grid-cols-2 gap-x-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-5 gap-y-1 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                        <div className="flex items-center gap-1.5 bg-transparent px-2 py-1 rounded-lg">
                            <span className="text-base sm:text-2xl">🪵</span>
                            <span className="text-sm sm:text-xl font-black text-amber-200 tabular-nums drop-shadow-md">{resources.wood}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-transparent px-2 py-1 rounded-lg">
                            <span className="text-base sm:text-2xl">🪨</span>
                            <span className="text-sm sm:text-xl font-black text-slate-200 tabular-nums drop-shadow-md">{resources.stone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-transparent px-2 py-1 rounded-lg">
                            <span className="text-base sm:text-2xl">🍎</span>
                            <span className="text-sm sm:text-xl font-black text-red-200 tabular-nums drop-shadow-md">{resources.food}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-transparent px-2 py-1 rounded-lg">
                            <span className="text-base sm:text-2xl">✨</span>
                            <span className="text-sm sm:text-xl font-black text-cyan-200 tabular-nums drop-shadow-md">{resources.lightShards}</span>
                        </div>
                    </div>

                    {/* MINIMAP */}
                    <div className="mt-1 mb-1 pointer-events-auto backdrop-blur-xl rounded-xl border border-cyan-400/20 shadow-[0_0_20px_rgba(6,182,212,0.2)] p-1 overflow-hidden self-end">
                        <Minimap />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowShare(true)}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600/40 to-purple-700/30 hover:from-purple-600/60 hover:to-purple-700/50 border-2 border-purple-400/30 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-[0_0_20px_rgba(168,85,247,0.3)] pointer-events-auto"
                        >
                            <span className="text-xl sm:text-3xl">📸</span>
                        </button>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${showChat ? 'from-blue-600 to-blue-700' : 'from-blue-900/40 to-blue-800/30'} border-2 border-blue-400/30 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-[0_0_20px_rgba(59,130,246,0.3)] pointer-events-auto relative`}
                        >
                            <span className="text-xl sm:text-3xl">💬</span>
                            {hasUnread && <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />}
                        </button>
                        <button
                            onClick={() => useGameStore.getState().setGameState(GameState.PAUSED)}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-700/40 to-slate-800/30 hover:from-slate-700/60 hover:to-slate-800/50 border-2 border-white/20 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.1)] pointer-events-auto"
                        >
                            <span className="text-xl sm:text-3xl">⏸️</span>
                        </button>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-900/40 to-slate-800/30 border-2 border-cyan-400/20 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-[0_0_20px_rgba(6,182,212,0.1)] pointer-events-auto">
                            <OrientationToggle />
                        </div>
                    </div>
                </div>
            </div>

            {/* BRANDING watermark */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none z-0">
                <div className="flex items-center gap-1">
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest italic">DeeJay Labs</span>
                </div>
            </div>

            {/* BOTTOM SECTION: PREMIUM CONTROLS */}
            <div className="flex justify-between items-end w-full pb-2 sm:pb-4 px-1 sm:px-2">

                {/* Premium Joystick */}
                <PremiumJoystick />

                {/* Center Utilities */}
                <div className="flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto">
                    <button
                        onClick={triggerNova}
                        className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all border-4 ${playerStats.novaCharge >= 100 ? 'bg-gradient-to-br from-orange-500 to-red-600 border-yellow-300 shadow-[0_0_50px_rgba(251,146,60,0.9)] animate-pulse' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/30 opacity-70'}`}>
                        <span className="text-4xl sm:text-6xl">🔥</span>
                        <span className="text-[9px] sm:text-xs font-black text-white mt-1 italic tabular-nums">{Math.floor(playerStats.novaCharge)}%</span>
                    </button>
                    <div className="flex gap-3 sm:gap-4">
                        <button onClick={onOpenInventory} className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500/40 flex items-center justify-center text-3xl sm:text-4xl active:scale-90 shadow-[0_0_20px_rgba(100,116,139,0.3)] transition-all">🎒</button>
                        <button onClick={onOpenCrafting} className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-orange-700 to-orange-800 border-2 border-orange-500/40 flex items-center justify-center text-3xl sm:text-4xl active:scale-90 shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all">🛠️</button>
                    </div>
                </div>

                {/* Premium Action Buttons */}
                <div className="flex flex-col items-end gap-4 sm:gap-8 pointer-events-auto">
                    <button
                        onPointerDown={() => isPlayerGrounded && window.dispatchEvent(new Event('player-jump'))}
                        className={`w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-600 to-blue-700 border-4 border-cyan-300/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-90 ${!isPlayerGrounded ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <span className="text-4xl sm:text-6xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🌀</span>
                    </button>

                    <button
                        onPointerDown={() => window.dispatchEvent(new Event('player-attack'))}
                        className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-red-600 to-red-700 border-b-[10px] sm:border-b-[16px] border-red-900 rounded-[2.5rem] sm:rounded-[4rem] flex items-center justify-center active:translate-y-2 active:border-b-0 transition-all shadow-[0_0_40px_rgba(220,38,38,0.6),0_10px_30px_rgba(0,0,0,0.5)]"
                    >
                        <span className="text-6xl sm:text-9xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">⚔️</span>
                    </button>
                </div>
            </div>

            {showShare && <SocialShare onClose={() => setShowShare(false)} stats={{ wave, score }} />}
        </div>
    );
};

export default PremiumHUD;
