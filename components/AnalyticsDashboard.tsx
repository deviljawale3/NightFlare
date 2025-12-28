
import React, { useEffect } from 'react';
import { useGameStore } from '../store';

interface AnalyticsDashboardProps {
    onBack: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
    const { analytics, updateAnalytics, arenaStats, battleHistory } = useGameStore();

    useEffect(() => {
        updateAnalytics();
    }, [updateAnalytics]);

    const winRate = ((arenaStats.wins / (arenaStats.totalBattles || 1)) * 100).toFixed(1);

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="bg-[#050505] border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl">

                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-900/10 to-transparent flex justify-between items-start">
                    <div>
                        <div className="text-purple-500 font-black text-xs tracking-[0.3em] uppercase mb-2">Performance Metrics</div>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Strategic Analytics</h2>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-600 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">🎯</span>
                            </div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Win Rate</div>
                            <div className="text-3xl font-black text-white">{winRate}%</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">⚔️</span>
                            </div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Total Battles</div>
                            <div className="text-3xl font-black text-white">{arenaStats.totalBattles}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">💎</span>
                            </div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Net Profit</div>
                            <div className={`text-3xl font-black ${arenaStats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {arenaStats.netProfit >= 0 ? '+' : ''}{arenaStats.netProfit}
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">🔥</span>
                            </div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Best Streak</div>
                            <div className="text-3xl font-black text-orange-500">{arenaStats.bestStreak}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Detailed Metrics */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
                                    <div className="w-1 h-4 bg-purple-500 rounded-full" /> Mode Performance
                                </h3>

                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                                            <span>Score Rush</span>
                                            <span>{analytics.winRateByMode.SCORE_RUSH}% Win Rate</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${analytics.winRateByMode.SCORE_RUSH}%` }} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                                            <span>Sudden Death</span>
                                            <span>{analytics.winRateByMode.SUDDEN_DEATH}% Win Rate</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${analytics.winRateByMode.SUDDEN_DEATH}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/5">
                                    <div>
                                        <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Avg Score</div>
                                        <div className="text-xl font-black text-white">{analytics.averageScore.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Peak Time</div>
                                        <div className="text-xl font-black text-white">{analytics.peakPerformanceTime}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Progression (Mock Chart) */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 overflow-hidden relative">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                    <div className="w-1 h-4 bg-green-500 rounded-full" /> Recent Score History
                                </h3>
                                <div className="absolute inset-x-8 bottom-8 top-20 flex items-end gap-1">
                                    {analytics.scoreHistory.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/10 text-xs font-bold uppercase tracking-widest">No data collected</div>
                                    ) : (
                                        analytics.scoreHistory.map((s, i) => {
                                            const maxScore = Math.max(...analytics.scoreHistory.map(d => d.score), 1000);
                                            const h = (s.score / maxScore) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-purple-500/80 to-purple-400 group relative"
                                                    style={{ height: `${h}%` }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {s.score}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-6">
                                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Nemesis Analysis</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-white/30 text-[9px] font-bold uppercase mb-1">Best Matchup</div>
                                        <div className="text-sm font-black text-green-400">{analytics.bestOpponent || 'None'}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/30 text-[9px] font-bold uppercase mb-1">Worst Matchup</div>
                                        <div className="text-sm font-black text-red-400">{analytics.worstOpponent || 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Recent Form</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {analytics.recentForm.length === 0 ? (
                                        <span className="text-[10px] text-white/20 font-bold uppercase">No history</span>
                                    ) : (
                                        analytics.recentForm.map((f, i) => (
                                            <div
                                                key={i}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${f === 'W' ? 'bg-green-500/20 text-green-500' :
                                                    f === 'L' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white/50'
                                                    }`}
                                            >
                                                {f}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Rank Progression</h4>
                                <div className="space-y-3">
                                    {analytics.rankHistory.map((h, i) => (
                                        <div key={i} className="flex justify-between items-center text-[10px] font-bold py-2 border-b border-white/5 last:border-0 uppercase tracking-tighter">
                                            <span className="text-white/30">{new Date(h.date).toLocaleDateString()}</span>
                                            <span className="text-white">{h.rank} ({h.points} pts)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-6 bg-white/5 border-t border-white/5 text-center">
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        Tip: Focus on Sudden Death to increase your Rank Points efficiently.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
