
import React, { useState } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

/**
 * BestiaryMenu Component
 * Phase 4 Narrative & Info Hub.
 * Optimized for mobile with large touch targets and partitioned layout.
 */
const BestiaryMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { bestiary } = useGameStore();
    const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);

    const enemyData: Record<string, { name: string, desc: string, weakness: string, icon: string, color: string }> = {
        'SHADOW_STALKER': { name: 'Shadow Stalker', desc: 'The most common void entity. Aggressive, persistent, and hunts in packs. They thrive in the shadows and fear the core flare.', weakness: 'Plasma Blade / Fire', icon: '👤', color: 'from-blue-600 to-slate-900' },
        'VOID_WRAITH': { name: 'Void Wraith', desc: 'Floating specters that manipulate void energy. They can phase through solid objects and attack from a distance with ethereal bolts.', weakness: 'Pulse Bow / High Velocity', icon: '👻', color: 'from-purple-600 to-slate-900' },
        'BRUTE': { name: 'Shadow Brute', desc: 'Massive, heavy-armored guardians. Their obsidian hide is nearly impervious to light attacks. Do not engage without heavy artillery.', weakness: 'Nova Pulse / Explosives', icon: '👹', color: 'from-orange-600 to-slate-900' },
        'OBSIDIAN_GOLEM': { name: 'Obsidian Golem', desc: 'A volcanic titan of immense power. It can cause seismic tremors and hurl molten rock at any survivors daring to enter its territory.', weakness: 'Void Blade / Cryo Damage', icon: '🪨', color: 'from-red-600 to-slate-900' },
        'VOID_WEAVER': { name: 'Void Weaver', desc: 'A nightmare architect of the deepest abyss. This Colossus generates a kinetic shield that adapts to damage patterns. Requires extreme firepower.', weakness: 'Orbital Strike / Titan Core tech', icon: '🕸️', color: 'from-cyan-600 to-slate-900' }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-3xl animate-in fade-in zoom-in duration-300 pointer-events-auto transition-all" onClick={onClose}>
            <div className={`bg-[#050505] border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)]`} onClick={e => e.stopPropagation()}>

                {/* Header Section */}
                <div className="p-5 sm:p-10 flex justify-between items-start shrink-0 bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h1 className="text-3xl sm:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Bestiary
                        </h1>
                        <p className="text-cyan-400 font-bold text-[8px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-1 sm:mt-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                            Titan Logbook // Biometric Analysis
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 hover:bg-red-600/20 hover:border-red-500/50 rounded-xl sm:rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 active:scale-90"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-4 sm:px-10 pb-6 sm:pb-10 gap-4 sm:gap-10">

                    {/* List of Entities */}
                    <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4 custom-scrollbar pr-1 sm:pr-4">
                        {Object.entries(bestiary).map(([id, stats]) => {
                            const data = enemyData[id] || { name: id, desc: 'Unknown entity.', weakness: 'Unknown', icon: '❓', color: 'from-slate-700 to-slate-900' };
                            const isActive = selectedEnemy === id;

                            return (
                                <div
                                    key={id}
                                    onClick={() => stats.identified && setSelectedEnemy(id)}
                                    className={`
                                        group relative p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 sm:gap-6
                                        ${isActive ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                                        ${!stats.identified && 'opacity-30 grayscale pointer-events-none filter sepia'}
                                    `}
                                >
                                    {/* Entity Icon Container */}
                                    <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stats.identified ? data.color : 'from-slate-800 to-black'} flex items-center justify-center text-2xl sm:text-5xl shadow-inner border border-white/5`}>
                                        {stats.identified ? data.icon : '❔'}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-2xl font-black text-white italic tracking-tight">{stats.identified ? data.name : 'Classified Entry'}</h3>
                                        <div className="flex items-center gap-2 sm:gap-4 mt-1">
                                            <span className="text-[7px] sm:text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Exterminated:</span>
                                            <span className="text-[10px] sm:text-sm font-black text-cyan-400 tabular-nums">{stats.kills}</span>
                                        </div>
                                    </div>

                                    {stats.identified && (
                                        <div className={`text-[10px] font-black tracking-widest uppercase transition-all ${isActive ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/50'}`}>
                                            {isActive ? 'ANALYZING' : 'EXPLORE'}
                                        </div>
                                    )}

                                    {/* Locked Overlay overlay */}
                                    {!stats.identified && (
                                        <div className="absolute inset-0 flex items-center justify-end pr-8">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] rotate-90 sm:rotate-0">ENCRYPTED</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed Analysis View (Mainly for Desktop or Tablet, but simplified for Smartphone) */}
                    <div className={`
                        lg:w-[400px] h-full sm:h-auto bg-gradient-to-br from-slate-900/40 to-black/60 rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-md
                        ${!selectedEnemy ? 'hidden lg:flex' : 'flex'}
                    `}>
                        {selectedEnemy ? (
                            <div className="animate-in fade-in slide-in-from-right duration-500 h-full flex flex-col">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="text-6xl sm:text-9xl mb-6 sm:mb-8 self-center drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    {enemyData[selectedEnemy].icon}
                                </div>

                                <h2 className="text-2xl sm:text-4xl font-black text-white italic mb-2 sm:mb-4 uppercase tracking-tighter">
                                    {enemyData[selectedEnemy].name}
                                </h2>

                                <div className="w-12 h-1 bg-cyan-400 mb-6" />

                                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 flex-1 font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                                    {enemyData[selectedEnemy].desc}
                                </p>

                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
                                        <span className="text-[8px] sm:text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-2">Tactical Weakness</span>
                                        <p className="text-white font-black text-lg sm:text-xl italic">{enemyData[selectedEnemy].weakness}</p>
                                    </div>

                                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                                        <span className="text-[8px] sm:text-[10px] text-red-400 font-bold uppercase tracking-widest block mb-2">Threat Level</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= (selectedEnemy === 'VOID_WEAVER' ? 5 : (selectedEnemy === 'OBSIDIAN_GOLEM' ? 4 : (selectedEnemy === 'BRUTE' ? 3 : 2))) ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] shrink-0">
                                    <span>Analysis 100%</span>
                                    <span>REF: NF-BIO-{selectedEnemy.substring(0, 4)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center animate-spin-slow mb-6">
                                    <span className="text-4xl">📡</span>
                                </div>
                                <p className="text-[9px] uppercase font-black tracking-[0.3em] max-w-[180px]">Select an identified entity for deep scan analysis</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Logo */}
                <div className="absolute bottom-4 right-6 sm:bottom-8 sm:right-10 hidden sm:block">
                    <DeeJayLabsLogo className="opacity-10 scale-90 origin-bottom-right" />
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default BestiaryMenu;
