import React, { useState } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface TournamentHubProps {
    onBack: () => void;
}

const TournamentHub: React.FC<TournamentHubProps> = ({ onBack }) => {
    const { tournaments, resources, userProfile } = useGameStore();
    const [selectedTab, setSelectedTab] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ACTIVE');

    const filteredTournaments = tournaments.filter(t => t.status === selectedTab);

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300" onClick={onBack}>
            <div
                className="w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >

                {/* Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/20 blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 shrink-0">
                    <button
                        onClick={onBack}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-red-600 text-white/50 hover:text-white transition-all z-50 border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>

                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-2">
                        <span className="text-yellow-500">🏆</span> Tournament Arena
                    </h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest">Compete for Glory & Riches</p>
                </div>

                {/* Tabs */}
                <div className="relative z-10 flex border-b border-white/10 bg-black/40 shrink-0">
                    {(['ACTIVE', 'UPCOMING', 'COMPLETED'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`flex-1 py-4 px-6 font-black text-xs uppercase tracking-widest transition-all ${selectedTab === tab
                                ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-500'
                                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tournament List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 relative z-10">
                    {filteredTournaments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 min-h-[300px]">
                            <span className="text-6xl mb-4 grayscale opacity-50">🏆</span>
                            <span className="uppercase font-black tracking-widest">No {selectedTab.toLowerCase()} Tournaments</span>
                            <span className="text-xs mt-2">Check back soon for new competitions</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTournaments.map((tournament) => (
                                <div
                                    key={tournament.id}
                                    className="bg-gradient-to-br from-yellow-900/10 to-orange-900/10 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    {/* Tournament Header */}
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-white font-black text-lg uppercase tracking-tight">{tournament.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${tournament.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' :
                                                    tournament.status === 'UPCOMING' ? 'bg-blue-600/20 text-blue-400' :
                                                        'bg-gray-600/20 text-gray-400'
                                                    }`}>
                                                    {tournament.status}
                                                </span>
                                                <span className="text-white/40 text-[10px]">
                                                    {tournament.currentPlayers}/{tournament.maxPlayers} Players
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-yellow-400 text-2xl font-black font-mono">{tournament.prizePool}</div>
                                            <div className="text-white/40 text-[9px] uppercase">Prize Pool</div>
                                        </div>
                                    </div>

                                    {/* Tournament Info */}
                                    <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                        <div className="bg-black/40 rounded-lg p-3">
                                            <div className="text-white/40 text-[9px] uppercase mb-1">Entry Fee</div>
                                            <div className="text-orange-400 font-mono font-bold">✨ {tournament.entryFee}</div>
                                        </div>
                                        <div className="bg-black/40 rounded-lg p-3">
                                            <div className="text-white/40 text-[9px] uppercase mb-1">Format</div>
                                            <div className="text-white font-bold text-sm">Single Elim</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="relative z-10">
                                        {tournament.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => useGameStore.getState().joinTournament(tournament.id)}
                                                disabled={resources.lightShards < tournament.entryFee}
                                                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-white font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover:shadow-yellow-500/20"
                                            >
                                                {resources.lightShards < tournament.entryFee ? 'Insufficient Funds' : 'Join Tournament'}
                                            </button>
                                        )}

                                        {tournament.status === 'UPCOMING' && (
                                            <button className="w-full py-3 bg-blue-600/20 rounded-lg text-blue-400 font-black text-sm uppercase tracking-wider text-center border border-blue-500/30 cursor-default">
                                                Starts Soon
                                            </button>
                                        )}

                                        {tournament.status === 'COMPLETED' && (
                                            <button className="w-full py-3 bg-white/5 rounded-lg text-white/50 font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all hover:text-white">
                                                View Results
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between items-center relative z-10 bg-black/40 shrink-0">
                    <div className="text-white/40 text-xs">
                        <span className="font-bold">Your Balance:</span> <span className="text-orange-400 font-mono">✨ {resources.lightShards}</span>
                    </div>
                    <DeeJayLabsLogo className="scale-75 opacity-30" />
                </div>
            </div>
        </div>
    );
};

export default TournamentHub;
