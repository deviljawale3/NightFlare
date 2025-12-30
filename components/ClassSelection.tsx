
import React from 'react';
import { useGameStore } from '../store';
import { HeroClass } from '../types';

/**
 * ClassSelection Component
 * Entry point for Phase 5 gameplay. Selection grants unique bonuses.
 */
const ClassSelection: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
    const { setHeroClass, resetGame } = useGameStore();

    const classes: { id: HeroClass, name: string, icon: string, color: string, desc: string, bonus: string }[] = [
        {
            id: 'WARDEN',
            name: 'The Warden',
            icon: '🛡️',
            color: 'from-emerald-600 to-teal-900',
            desc: 'A master of defense and resilience. Built to withstand the harshest tectonic shifts and void assaults.',
            bonus: 'Passive: +50 Max Health & Core Reinforcement'
        },
        {
            id: 'WRAITH',
            name: 'The Wraith',
            icon: '⚡',
            color: 'from-blue-600 to-indigo-900',
            desc: 'The ultimate survival operative. Specialized in high-speed maneuvers and rapid reconnaissance.',
            bonus: 'Passive: +25% Movement Speed & Tactical Dash'
        },
        {
            id: 'NOVA',
            name: 'Nova Core',
            icon: '🔥',
            color: 'from-orange-600 to-red-900',
            desc: 'Harnesses the raw energy of Flare technology. Capable of devastating area-of-effect destruction.',
            bonus: 'Passive: +50% Nova Damage & Rapid Recharge'
        }
    ];

    const confirmSelection = (id: HeroClass) => {
        setHeroClass(id);
        resetGame(true); // Initiate game starting logic
        onSelect();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 pointer-events-auto">
            <div className="text-center mb-10 sm:mb-16">
                <h1 className="text-4xl sm:text-7xl font-black text-white italic tracking-tighter uppercase mb-4">
                    SELECT YOUR <span className="text-orange-500">ORIGIN</span>
                </h1>
                <p className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em]">
                    Vanguard Protocol Phase 01 // Combat Specialization
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        onClick={() => confirmSelection(cls.id)}
                        className={`
                            group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-95 hover:border-white/30
                        `}
                    >
                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                        <div className="text-6xl sm:text-8xl mb-8 group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            {cls.icon}
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                            {cls.name}
                        </h2>

                        <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-8 font-medium">
                            {cls.desc}
                        </p>

                        <div className="mt-auto py-3 px-4 bg-white/10 rounded-2xl border border-white/5 group-hover:bg-white/20 transition-colors">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1 opacity-50">Operational Bonus</span>
                            <p className="text-orange-400 font-bold text-xs uppercase">{cls.bonus}</p>
                        </div>

                        {/* Animated selection hint */}
                        <div className="absolute bottom-6 right-8 text-white/0 group-hover:text-white/40 transition-all font-black italic text-sm tracking-tighter">
                            INITIALIZE ➔
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-[9px] font-bold text-white/20 uppercase tracking-[0.6em]">
                DeeJay Labs Hardware Labs • Sector 7-G
            </div>
        </div>
    );
};

export default ClassSelection;
