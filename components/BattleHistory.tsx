import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface BattleHistoryProps {
    onBack: () => void;
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ onBack }) => {
    const { battleHistory, arenaStats } = useGameStore();

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]">

                {/* Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <button
                        onClick={onBack}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-600 text-white/50 hover:text-white transition-all z-50 border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>

                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-4">
                        <span className="text-purple-500">📜</span> Battle Archives
                    </h2>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                            <div className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Total Battles</div>
                            <div className="text-white text-2xl font-black">{arenaStats.totalBattles}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 border border-green-500/20">
                            <div className="text-green-400/60 text-[9px] uppercase tracking-widest mb-1">Victories</div>
                            <div className="text-green-400 text-2xl font-black">{arenaStats.wins}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 border border-red-500/20">
                            <div className="text-red-400/60 text-[9px] uppercase tracking-widest mb-1">Defeats</div>
                            <div className="text-red-400 text-2xl font-black">{arenaStats.losses}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 border border-purple-500/20">
                            <div className="text-purple-400/60 text-[9px] uppercase tracking-widest mb-1">Net Profit</div>
                            <div className={`text-2xl font-black ${arenaStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {arenaStats.netProfit >= 0 ? '+' : ''}{arenaStats.netProfit}
                            </div>
                        </div>
                    </div>

                    {/* Titles */}
                    {arenaStats.titles.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {arenaStats.titles.map(title => (
                                <div key={title} className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded-full text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                                    🏅 {title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Battle List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 relative z-10">
                    {battleHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/20">
                            <span className="text-6xl mb-4">⚔️</span>
                            <span className="uppercase font-black tracking-widest">No Battles Yet</span>
                            <span className="text-xs mt-2">Enter the Shadow Arena to start your legend</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {battleHistory.map((battle) => (
                                <div
                                    key={battle.id}
                                    className={`bg-white/5 rounded-xl p-4 border transition-all hover:bg-white/10 ${battle.result === 'VICTORY' ? 'border-green-500/20' :
                                        battle.result === 'DEFEAT' ? 'border-red-500/20' :
                                            'border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${battle.result === 'VICTORY' ? 'bg-green-600/20 border-2 border-green-500' :
                                                battle.result === 'DEFEAT' ? 'bg-red-600/20 border-2 border-red-500' :
                                                    'bg-white/10 border-2 border-white/20'
                                                }`}>
                                                {battle.opponentAvatar}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-black text-sm uppercase">vs {battle.opponentName}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${battle.mode === 'SCORE_RUSH' ? 'bg-blue-600/20 text-blue-400' : 'bg-red-600/20 text-red-400'
                                                        }`}>
                                                        {battle.mode === 'SCORE_RUSH' ? '⏱️ RUSH' : '💀 DEATH'}
                                                    </span>
                                                </div>
                                                <div className="text-white/40 text-[10px] mt-0.5">{formatDate(battle.date)}</div>
                                            </div>
                                        </div>

                                        <div className={`text-right px-4 py-2 rounded-lg ${battle.result === 'VICTORY' ? 'bg-green-600/20' :
                                            battle.result === 'DEFEAT' ? 'bg-red-600/20' :
                                                'bg-white/10'
                                            }`}>
                                            <div className={`text-xs font-black uppercase ${battle.result === 'VICTORY' ? 'text-green-400' :
                                                battle.result === 'DEFEAT' ? 'text-red-400' :
                                                    'text-white/50'
                                                }`}>
                                                {battle.result}
                                            </div>
                                            <div className={`text-lg font-mono font-bold ${battle.winnings >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {battle.winnings >= 0 ? '+' : ''}{battle.winnings}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-center border-t border-white/5 pt-3">
                                        <div>
                                            <div className="text-white/40 text-[9px] uppercase mb-1">Your Score</div>
                                            <div className="text-white font-mono font-bold text-sm">{battle.playerScore.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-[9px] uppercase mb-1">Opponent</div>
                                            <div className="text-white font-mono font-bold text-sm">{battle.opponentScore.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-[9px] uppercase mb-1">Duration</div>
                                            <div className="text-white font-mono font-bold text-sm">{formatDuration(battle.duration)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-center opacity-30 relative z-10">
                    <DeeJayLabsLogo className="scale-75" />
                </div>
            </div>
        </div>
    );
};

export default BattleHistory;
