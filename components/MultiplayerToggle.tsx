
import React from 'react';
import { useGameStore } from '../store';

const MultiplayerToggle: React.FC = () => {
    const { multiplayerState, toggleMultiplayer, connectToServer, disconnectFromServer } = useGameStore();

    const isConnected = multiplayerState.connectionStatus === 'CONNECTED';
    const isConnecting = multiplayerState.connectionStatus === 'CONNECTING';

    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 w-full">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-white font-black uppercase text-[9px] tracking-wider">Multiplayer Co-op</h3>
                    <div className="text-[7px] text-white/30 uppercase tracking-tight mt-0.5">Experimental</div>
                </div>
                <button
                    onClick={() => toggleMultiplayer(!multiplayerState.enabled)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${multiplayerState.enabled ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${multiplayerState.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {multiplayerState.enabled && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[8px] font-black text-white/60 uppercase tracking-wider">
                                {multiplayerState.connectionStatus}
                            </span>
                        </div>
                        {isConnected ? (
                            <button
                                onClick={disconnectFromServer}
                                className="text-[8px] font-black text-red-500 uppercase tracking-wider hover:text-red-400 transition-colors"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={connectToServer}
                                disabled={isConnecting}
                                className={`text-[8px] font-black text-blue-500 uppercase tracking-wider hover:text-blue-400 transition-colors ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isConnecting ? 'Linking...' : 'Connect'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                            <div className="text-[7px] text-white/20 font-black uppercase tracking-wider mb-0.5">Region</div>
                            <div className="text-[8px] text-white/80 font-bold uppercase">EU-West</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                            <div className="text-[7px] text-white/20 font-black uppercase tracking-wider mb-0.5">Latency</div>
                            <div className={`text-[8px] font-bold uppercase ${isConnected ? 'text-green-500' : 'text-white/20'}`}>
                                {isConnected ? '24ms' : '--'}
                            </div>
                        </div>
                    </div>

                    <p className="text-[7px] text-white/20 text-center uppercase font-bold px-1 leading-tight">
                        See other survivors in real-time and trade resources
                    </p>
                </div>
            )}
        </div>
    );
};

export default MultiplayerToggle;
