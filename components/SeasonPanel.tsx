
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

interface SeasonPanelProps {
    onBack: () => void;
}

const SeasonPanel: React.FC<SeasonPanelProps> = ({ onBack }) => {
    const { currentSeason, initializeSeason, claimSeasonRewards, arenaStats, leaderboard } = useGameStore();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!currentSeason) {
            initializeSeason();
        }
    }, [currentSeason, initializeSeason]);

    useEffect(() => {
        if (!currentSeason) return;
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = currentSeason.endDate - now;
            if (diff <= 0) {
                setTimeLeft('SEASON ENDED');
                return;
            }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${d}D ${h}H ${m}M`);
        }, 1000);
        return () => clearInterval(timer);
    }, [currentSeason]);

    if (!currentSeason) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">

                {/* Banner Header */}
                <div className="h-48 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-40" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />

                    <div className="relative text-center z-10">
                        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-2xl">
                            Season {currentSeason.number}
                        </h2>
                        <div className="flex items-center justify-center gap-4">
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest">
                                {currentSeason.name}
                            </span>
                            <span className="bg-orange-500/80 border border-orange-400 px-4 py-1 rounded-full text-xs font-black text-black uppercase tracking-widest">
                                {timeLeft}
                            </span>
                        </div>
                    </div>

                    <button onClick={onBack} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/50 hover:text-white transition-all z-20">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar">

                    {/* Left: Progression & Rewards */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2">
                                <span className="text-xl">🏆</span> Current Rank Standing
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                    {arenaStats.rank === 'BRONZE' ? '🥉' : arenaStats.rank === 'SILVER' ? '🥈' : '🥇'}
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white uppercase italic">{arenaStats.rank} DIVISION</div>
                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                                        Rank Points: {arenaStats.rankPoints} • Win Streak: {arenaStats.winStreak}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black uppercase text-sm mb-6">Season Rewards</h3>
                            <div className="space-y-3">
                                {currentSeason.rewards.map((reward, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${arenaStats.rank === reward.rankThreshold ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-black/40 border-white/5'}`}>
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                                            {reward.rankThreshold === 'LEGEND' ? '👑' : reward.rankThreshold === 'DIAMOND' ? '💎' : '⭐'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-white/30 font-black uppercase tracking-tighter">{reward.rankThreshold} REWARD</div>
                                            <div className="text-white font-bold text-xs">{reward.title || `${reward.shards} Light Shards`}</div>
                                        </div>
                                        {arenaStats.rank === reward.rankThreshold && currentSeason.status === 'ENDED' && (
                                            <button
                                                onClick={claimSeasonRewards}
                                                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                Claim
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Top 10 Leaderboard */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center justify-between">
                            <span>Top Survivors</span>
                            <span className="text-[9px] text-white/20 tracking-widest">REALTIME SYNC</span>
                        </h3>
                        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                            {leaderboard.map((entry, idx) => (
                                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                                    <div className={`w-6 text-center font-black text-xs ${idx < 3 ? 'text-orange-500' : 'text-white/20'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-base">
                                        {entry.avatar}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <div className="text-white font-black uppercase text-[10px]">{entry.name}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-tighter">Wave {entry.wave}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-blue-400 font-black text-xs tabular-nums">{entry.score.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Status Bar */}
                <div className="p-4 bg-orange-600/10 border-t border-orange-500/20 text-center">
                    <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        Season {currentSeason.number} will end soon. Secure your position!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SeasonPanel;
