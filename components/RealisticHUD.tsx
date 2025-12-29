import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store';
import { useSettingsStore } from './SettingsPanel';
import { GameState } from '../types';
import Minimap from './Minimap';

interface RealisticHUDProps {
    showInventory: () => void;
    showCrafting: () => void;
}

const RealisticHUD: React.FC<RealisticHUDProps> = ({ showInventory, showCrafting }) => {
    const {
        resources,
        playerStats,
        score,
        wave,
        level,
        levelTimer,
        setGameState,
        triggerNova
    } = useGameStore();

    const { toggleSettings } = useSettingsStore();

    const [showMap, setShowMap] = useState(true);

    // Joystick State
    const joystickRef = useRef<HTMLDivElement>(null);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
    const [isJoystickActive, setIsJoystickActive] = useState(false);
    const [dynamicOrigin, setDynamicOrigin] = useState<{ x: number, y: number } | null>(null);
    const movementMode = useSettingsStore(s => s.movementMode);

    const handleJoystickStart = (e: React.PointerEvent) => {
        setIsJoystickActive(true);
        (e.target as Element).setPointerCapture(e.pointerId);

        if (movementMode === 'touch') {
            setDynamicOrigin({ x: e.clientX, y: e.clientY });
            setJoystickPos({ x: 0, y: 0 });
        } else {
            handleJoystickMove(e);
        }
    };

    const handleJoystickMove = (e: React.PointerEvent) => {
        if (!isJoystickActive && e.type !== 'pointerdown') return;

        // Calculate Center
        let centerX, centerY;

        if (movementMode === 'touch') {
            if (!dynamicOrigin) return;
            centerX = dynamicOrigin.x;
            centerY = dynamicOrigin.y;
        } else {
            if (!joystickRef.current) return;
            const rect = joystickRef.current.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        }

        // Calculate raw delta from center
        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;

        // Calculate distance and clamp to radius
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = movementMode === 'touch' ? 50 : 35; // Larger radius for dynamic

        if (distance > maxRadius) {
            const ratio = maxRadius / distance;
            dx *= ratio;
            dy *= ratio;
        }

        // Update visual position
        setJoystickPos({ x: dx, y: dy });

        // Update Global Input for Player.tsx
        // Normalize to -1 to 1 range
        (window as any).joystickX = dx / maxRadius;
        (window as any).joystickY = dy / maxRadius;
    };

    const handleJoystickEnd = (e: React.PointerEvent) => {
        setIsJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        setDynamicOrigin(null);
        (window as any).joystickX = 0;
        (window as any).joystickY = 0;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 safe-padding">

            {/* TOP BAR - Transparent overlay */}
            <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />

            {/* TOP LEFT: Minimap + Resources */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2 pointer-events-auto">

                {/* Minimap */}
                {showMap && (
                    <div className="relative animate-in slide-in-from-left-4 duration-300">
                        <Minimap />
                        <button
                            onClick={() => setShowMap(false)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white/60 hover:text-white text-xs border border-white/20 hover:bg-black transition-all"
                            title="Hide Map"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {!showMap && (
                    <button
                        onClick={() => setShowMap(true)}
                        className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-lg"
                        title="Show Map"
                    >
                        <span className="text-lg">🗺️</span>
                    </button>
                )}

                {/* Resources - Compact */}
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-2 border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                            <span className="text-sm">🪵</span>
                            <span className="text-white font-mono font-bold text-xs">{resources.wood}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                            <span className="text-sm">🪨</span>
                            <span className="text-white font-mono font-bold text-xs">{resources.stone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-yellow-500/10 rounded-lg px-2 py-1 border border-yellow-500/20">
                            <span className="text-sm">✨</span>
                            <span className="text-yellow-400 font-mono font-bold text-xs">{resources.lightShards}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                            <span className="text-sm">🍖</span>
                            <span className="text-white font-mono font-bold text-xs">{resources.food}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOP CENTER: Timer/Objective */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-6 py-2 border border-white/10 shadow-2xl">
                    <div className="text-orange-500 text-[8px] font-black uppercase tracking-wider text-center mb-0.5">
                        Wave {wave} • Level {level}
                    </div>
                    <div className="text-white text-2xl sm:text-3xl font-black tabular-nums text-center">
                        {formatTime(levelTimer)}
                    </div>
                </div>
            </div>

            {/* TOP RIGHT: Stats + Quick Actions */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 pointer-events-auto">

                {/* Stats Card */}
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-2 border border-white/10 shadow-2xl">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3 bg-orange-500/10 rounded-lg px-2 py-1 border border-orange-500/20">
                            <span className="text-white/60 text-[8px] uppercase font-bold">Wave</span>
                            <span className="text-orange-400 font-black text-lg">{wave}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-cyan-500/10 rounded-lg px-2 py-1 border border-cyan-500/20">
                            <span className="text-white/60 text-[8px] uppercase font-bold">Score</span>
                            <span className="text-cyan-400 font-mono font-bold text-xs">{score.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setGameState(GameState.PAUSED)}
                        className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-lg active:scale-95"
                        title="Pause"
                    >
                        <span className="text-lg">⏸️</span>
                    </button>
                    <button
                        onClick={toggleSettings}
                        className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-lg active:scale-95"
                        title="Settings"
                    >
                        <span className="text-lg">⚙️</span>
                    </button>
                </div>
            </div>

            {/* BOTTOM BAR - Transparent overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

            {/* BOTTOM LEFT: Movement Controls */}
            {movementMode === 'touch' ? (
                // DYNAMIC TOUCH ZONE (Left Half)
                <div
                    className="absolute inset-y-0 left-0 w-1/2 pointer-events-auto z-40 touch-none"
                    onPointerDown={handleJoystickStart}
                    onPointerMove={handleJoystickMove}
                    onPointerUp={handleJoystickEnd}
                    onPointerLeave={handleJoystickEnd}
                >
                    {isJoystickActive && dynamicOrigin && (
                        <div
                            className="absolute w-24 h-24 bg-white/10 rounded-full border border-white/20 shadow-xl backdrop-blur-sm pointer-events-none animate-in fade-in duration-100"
                            style={{
                                left: dynamicOrigin.x - 48,
                                top: dynamicOrigin.y - 48
                            }}
                        >
                            {/* Knob */}
                            <div
                                className="absolute w-12 h-12 bg-white/40 rounded-full border border-white/50 shadow-lg"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
                                }}
                            />
                        </div>
                    )}
                    {!isJoystickActive && (
                        <div className="absolute bottom-10 left-10 text-white/30 text-[10px] font-mono animate-pulse pointer-events-none">
                            TOUCH ANYWHERE TO MOVE
                        </div>
                    )}
                </div>
            ) : (
                // FIXED JOYSTICK (Bottom Left)
                <div className="absolute bottom-4 left-4 pointer-events-auto">
                    <div
                        ref={joystickRef}
                        className="relative w-32 h-32 bg-black/40 backdrop-blur-md rounded-full border-2 border-white/20 shadow-2xl touch-none"
                        onPointerDown={handleJoystickStart}
                        onPointerMove={handleJoystickMove}
                        onPointerUp={handleJoystickEnd}
                        onPointerLeave={handleJoystickEnd}
                    >
                        {/* Joystick Knob */}
                        <div
                            className="absolute w-14 h-14 bg-white/20 rounded-full border-2 border-white/30 shadow-lg backdrop-blur-sm transition-transform duration-75 pointer-events-none"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
                            }}
                        />

                        {/* Direction indicators */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold">W</div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold">S</div>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">A</div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">D</div>
                    </div>
                    <div className="text-center mt-1 text-[8px] text-white/40 font-bold uppercase tracking-widest">Move</div>
                </div>
            )}

            {/* BOTTOM CENTER: Health + Nova */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl min-w-[280px] sm:min-w-[320px]">

                    {/* Health Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-white/70 text-[8px] uppercase font-bold tracking-wider">Health</span>
                            <span className="text-white font-mono font-bold text-[10px]">{playerStats.currentHealth}/{playerStats.maxHealth}</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/20 shadow-inner">
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
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-white/70 text-[8px] uppercase font-bold tracking-wider">Nova Charge</span>
                            <span className={`font-mono font-bold text-[10px] ${playerStats.novaCharge >= 100 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                                {playerStats.novaCharge}%
                            </span>
                        </div>
                        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-yellow-500/30 shadow-inner relative">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 transition-all duration-300"
                                style={{ width: `${playerStats.novaCharge}%` }}
                            />
                            {playerStats.novaCharge >= 100 && (
                                <div className="absolute inset-0 bg-yellow-400/30 animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM RIGHT: Action Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 pointer-events-auto">

                {/* Nova Button */}
                <button
                    onClick={triggerNova}
                    disabled={playerStats.novaCharge < 100}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 shadow-2xl ${playerStats.novaCharge >= 100
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 border-yellow-400 shadow-[0_0_30px_rgba(251,146,60,0.8)] hover:scale-105 active:scale-95'
                        : 'bg-black/60 border-white/20 opacity-50 cursor-not-allowed'
                        }`}
                    title="Nova Attack (Q)"
                >
                    <span className="text-3xl sm:text-4xl">🔥</span>
                    <span className="text-[7px] text-white font-bold uppercase mt-1">Nova</span>
                </button>

                {/* Action Buttons Row */}
                <div className="flex gap-2">
                    {/* Jump */}
                    <button
                        onPointerDown={() => window.dispatchEvent(new Event('player-jump'))}
                        className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-400 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
                        title="Jump (Space)"
                    >
                        <span className="text-2xl sm:text-3xl">🌀</span>
                        <span className="text-[7px] text-white font-bold uppercase">Jump</span>
                    </button>

                    {/* Attack */}
                    <button
                        onPointerDown={() => window.dispatchEvent(new Event('player-attack'))}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
                        title="Attack (Click)"
                    >
                        <span className="text-3xl sm:text-4xl">⚔️</span>
                        <span className="text-[7px] text-white font-bold uppercase">Attack</span>
                    </button>
                </div>

                {/* Inventory/Crafting */}
                <div className="flex gap-2">
                    <button
                        onClick={showInventory}
                        className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-xl hover:bg-black/80 transition-all shadow-lg active:scale-95 pointer-events-auto"
                        title="Inventory (I)"
                    >
                        🎒
                    </button>
                    <button
                        onClick={showCrafting}
                        className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-xl hover:bg-black/80 transition-all shadow-lg active:scale-95 pointer-events-auto"
                        title="Crafting (C)"
                    >
                        🛠️
                    </button>
                </div>
            </div>

            {/* Enemy Counter (if enemies nearby) */}
            {(() => {
                const enemies = (window as any).gameEnemies || [];
                const activeEnemies = enemies.filter((e: any) => e.health && e.health > 0);
                return activeEnemies.length > 0 && (
                    <div className="absolute top-24 sm:top-28 right-3 sm:right-4 pointer-events-auto">
                        <div className="bg-red-900/60 backdrop-blur-md rounded-xl px-3 py-2 border border-red-500/30 shadow-2xl flex items-center gap-2 animate-pulse">
                            <span className="text-red-400 text-lg">⚠️</span>
                            <div>
                                <div className="text-red-400 text-xs font-black uppercase">Enemies</div>
                                <div className="text-white text-xl font-black">{activeEnemies.length}</div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default RealisticHUD;
