import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

const BossHealthBar: React.FC = () => {
    const { bossState } = useGameStore();
    const [shake, setShake] = useState(0);

    // Shake effect on hit
    useEffect(() => {
        const initialHp = bossState.health;
        // This is a naive way to detect damage without previous proc storage, 
        // effectively we just rely on react re-render if health changes? 
        // No, we want animation trigger.
        setShake(5);
        const t = setTimeout(() => setShake(0), 200);
        return () => clearTimeout(t);
    }, [bossState.health]);

    if (!bossState.active) return null;

    const hpPercent = (bossState.health / bossState.maxHealth) * 100;

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] pointer-events-none z-50 flex flex-col items-center animate-in fade-in slide-in-from-top-10 duration-1000">
            {/* Boss Name */}
            <h2 className="text-red-500 font-black text-2xl md:text-3xl italic tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(255,0,0,0.8)] mb-2" style={{ transform: `translate(${Math.random() * shake - shake / 2}px, ${Math.random() * shake - shake / 2}px)` }}>
                {bossState.name || bossState.type.replace('_', ' ')}
            </h2>

            {/* Bar Container */}
            <div className="w-full h-6 md:h-8 bg-black/80 border-2 border-red-900/50 rounded-full relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWwyIDE4IiBzdHJva2U9IiM1MDAiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')]"></div>

                {/* Health Fill */}
                <div
                    className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 ease-out relative"
                    style={{ width: `${hpPercent}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                    {/* Pulsing Glint */}
                    <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                </div>

                {/* Armor Fill */}
                {bossState.armorHealth > 0 && (
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-900 via-cyan-500 to-white/50 transition-all duration-300 ease-out"
                        style={{ width: `${(bossState.armorHealth / bossState.maxArmor) * 100}%` }}
                    />
                )}

                {/* Skull Icon Checkpoint? Optional */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] md:text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tighter">
                    {bossState.armorHealth > 0 ? `SHIELD: ${Math.ceil(bossState.armorHealth)}` : `CORE: ${Math.ceil(bossState.health)}`}
                </div>
            </div>

            {/* Underline Decoration */}
            <div className="w-0 h-1 bg-red-600 mt-1 animate-[growWidth_1s_ease-out_forwards] shadow-[0_0_15px_#ff0000]"></div>
            <style>{`
                @keyframes growWidth {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default BossHealthBar;
