
import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

const OperationsPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { playerStats, claimMissionReward } = useGameStore();
    const missions = playerStats.missions;

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300 pointer-events-auto" onClick={onBack}>
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-orange-900/20 to-transparent">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Daily Operations</h2>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Vanguard Tasks // Sector 01</p>
                        </div>
                        <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all">✕</button>
                    </div>
                </div>

                {/* Mission List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar max-h-[60vh]">
                    {missions.map((m) => (
                        <div
                            key={m.id}
                            className={`group p-6 rounded-3xl border transition-all ${m.completed ? (m.claimed ? 'bg-black/40 border-white/5' : 'bg-orange-500/10 border-orange-500/30') : 'bg-white/5 border-white/10'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-black uppercase tracking-tight ${m.completed ? 'text-orange-400' : 'text-white'}`}>{m.title}</h3>
                                        {m.completed && !m.claimed && <span className="bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">READY</span>}
                                    </div>
                                    <p className="text-white/40 text-xs">{m.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-white/80 text-sm font-black italic">
                                        {m.type === 'SHARDS' && '✨'}
                                        {m.type === 'TITAN_CREDITS' && '🛡️'}
                                        {m.type === 'STARDUST' && '💠'}
                                        {m.reward}
                                    </div>
                                    <div className="text-[8px] text-white/20 font-black uppercase tracking-widest">{m.type}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ${m.completed ? 'bg-orange-500' : 'bg-white/40'}`}
                                    style={{ width: `${(m.current / m.goal) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-white/30 tabular-nums uppercase">Progress: {m.current} / {m.goal}</span>
                                {m.completed ? (
                                    <button
                                        disabled={m.claimed}
                                        onClick={() => claimMissionReward(m.id)}
                                        className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${m.claimed ? 'bg-white/5 text-white/20' : 'bg-orange-500 text-black hover:scale-105 active:scale-95'}`}
                                    >
                                        {m.claimed ? 'Awarded' : 'Receive Reward'}
                                    </button>
                                ) : (
                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">In Progress</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">Titan Credits</div>
                            <div className="text-white font-black italic tracking-tighter">🛡️ {playerStats.titanCredits}</div>
                        </div>
                    </div>
                    <DeeJayLabsLogo className="scale-75 opacity-20" />
                </div>
            </div>
        </div>
    );
};

export default OperationsPanel;
