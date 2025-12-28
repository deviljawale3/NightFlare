import React, { useState } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import type { ChallengeMode } from '../types';

interface ArenaHubProps {
    onBack: () => void;
}

const ArenaHub: React.FC<ArenaHubProps> = ({ onBack }) => {
    const { leaderboard, startChallenge, resources, arenaStats } = useGameStore();
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
    const [wager, setWager] = useState(100);
    const [mode, setMode] = useState<ChallengeMode>('SCORE_RUSH');

    const handleChallenge = () => {
        if (!selectedOpponent) return;
        startChallenge(selectedOpponent, wager, mode);
    };

    const wagers = [100, 500, 1000, 2500];

    return (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in duration-300 overflow-y-auto">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-[2rem] overflow-hidden flex flex-col sm:flex-row shadow-2xl relative my-auto">

                {/* Background visuals */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 blur-[100px] pointer-events-none" />

                {/* CLOSE BUTTON - Mobile Optimized */}
                <button
                    onClick={onBack}
                    className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/80 hover:bg-red-600 text-white/70 hover:text-white transition-all z-50 border border-white/20 shadow-lg"
                >
                    ✕
                </button>

                {/* LEFT: Opponent Selection */}
                <div className="w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-white/10 p-4 sm:p-6 md:p-8 flex flex-col bg-[#111] max-h-[40vh] sm:max-h-none">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2 sm:gap-3">
                            <span className="text-orange-600">⚔️</span> Shadow Arena
                        </h2>
                        <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 sm:mt-2">Select an opponent to challenge</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 sm:pr-2">
                        {leaderboard.map((player) => (
                            <button
                                key={player.id}
                                onClick={() => setSelectedOpponent(player.id)}
                                className={`w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all group relative overflow-hidden ${selectedOpponent === player.id ? 'bg-orange-600 border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                            >
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl bg-black/30 border border-white/10 ${selectedOpponent === player.id ? 'scale-110' : ''}`}>
                                    {player.avatar}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className={`font-black text-xs sm:text-sm uppercase ${selectedOpponent === player.id ? 'text-white' : 'text-white/70'}`}>{player.name}</div>
                                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Night {player.wave}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-mono font-bold text-[10px] sm:text-xs ${selectedOpponent === player.id ? 'text-white' : 'text-[#3a86ff]'}`}>{player.score.toLocaleString()}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Match Settings */}
                <div className="w-full sm:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col relative z-10 overflow-y-auto custom-scrollbar max-h-[60vh] sm:max-h-none">

                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {selectedOpponent ? (
                            <>
                                <div className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-[0.5em] font-bold mb-4 sm:mb-8">Match Stakes</div>

                                <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10 w-full justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/10 bg-black flex items-center justify-center text-3xl sm:text-4xl mb-2 sm:mb-3 shadow-xl">
                                            🦁
                                        </div>
                                        <div className="text-white font-black uppercase text-xs sm:text-sm tracking-wider">You</div>
                                    </div>
                                    <div className="text-3xl sm:text-4xl text-orange-600 font-black italic">VS</div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-red-900/50 bg-black flex items-center justify-center text-3xl sm:text-4xl mb-2 sm:mb-3 shadow-xl">
                                            {leaderboard.find(p => p.id === selectedOpponent)?.avatar}
                                        </div>
                                        <div className="text-white font-black uppercase text-xs sm:text-sm tracking-wider text-white/50">{leaderboard.find(p => p.id === selectedOpponent)?.name}</div>
                                    </div>
                                </div>

                                {/* Mode Selector */}
                                <div className="w-full bg-black/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 mb-4 sm:mb-6">
                                    <div className="text-white/50 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest mb-2 sm:mb-3 text-center">Battle Mode</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setMode('SCORE_RUSH')}
                                            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all ${mode === 'SCORE_RUSH' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        >
                                            <div className="text-base sm:text-lg mb-1">⏱️</div>
                                            Score Rush
                                            <div className="text-[7px] sm:text-[8px] opacity-60 mt-1">3 Min Timer</div>
                                        </button>
                                        <button
                                            onClick={() => setMode('SUDDEN_DEATH')}
                                            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all ${mode === 'SUDDEN_DEATH' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        >
                                            <div className="text-base sm:text-lg mb-1">💀</div>
                                            Sudden Death
                                            <div className="text-[7px] sm:text-[8px] opacity-60 mt-1">First to Die</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Player Rank Badge */}
                                <div className="w-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-2 sm:p-3 border border-purple-500/20 mb-4 sm:mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-black ${arenaStats.rank === 'LEGEND' ? 'bg-yellow-500 text-black' :
                                                arenaStats.rank === 'DIAMOND' ? 'bg-cyan-400 text-black' :
                                                    arenaStats.rank === 'PLATINUM' ? 'bg-slate-300 text-black' :
                                                        arenaStats.rank === 'GOLD' ? 'bg-yellow-600 text-black' :
                                                            arenaStats.rank === 'SILVER' ? 'bg-slate-400 text-black' :
                                                                'bg-orange-700 text-white'
                                                }`}>
                                                {arenaStats.rank[0]}
                                            </div>
                                            <div>
                                                <div className="text-white font-black text-[10px] sm:text-xs uppercase">{arenaStats.rank}</div>
                                                <div className="text-white/40 text-[8px] sm:text-[9px]">{arenaStats.wins}W - {arenaStats.losses}L</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-purple-400 font-mono text-[10px] sm:text-xs font-bold">{arenaStats.rankPoints} RP</div>
                                            {arenaStats.winStreak > 0 && (
                                                <div className="text-green-400 text-[8px] sm:text-[9px] font-bold">🔥 {arenaStats.winStreak}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Wager Selection */}
                                <div className="w-full bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-4 sm:mb-8">
                                    <div className="flex justify-between items-end mb-3 sm:mb-4">
                                        <span className="text-white/50 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">Wager Amount</span>
                                        <span className="text-orange-400 font-mono font-bold text-lg sm:text-xl">✨ {wager}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {wagers.map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setWager(amt)}
                                                disabled={resources.lightShards < amt}
                                                className={`py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${wager === amt ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-black/40 text-white/30 hover:bg-white/10'} ${resources.lightShards < amt ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 sm:mt-4 flex justify-between text-[8px] sm:text-[9px] text-white/30 font-mono border-t border-white/5 pt-2 sm:pt-3">
                                        <span>POT: {wager * 2}</span>
                                        <span>TAX: {(wager * 2) * 0.1}</span>
                                        <span className="text-green-500">WIN: {(wager * 2) * 0.9}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleChallenge}
                                    disabled={resources.lightShards < wager}
                                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-black text-lg sm:text-xl italic uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:grayscale"
                                >
                                    INITIATE DUEL
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-white/20">
                                <span className="text-5xl sm:text-6xl mb-4">⚔️</span>
                                <span className="uppercase font-black tracking-widest text-xs sm:text-sm">Select an Opponent</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 sm:mt-auto pt-4 sm:pt-6 flex justify-center opacity-30">
                        <DeeJayLabsLogo className="scale-75" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArenaHub;
