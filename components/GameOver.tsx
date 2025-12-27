
import React from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';

const GameOver: React.FC = () => {
  const { score, wave, resetGame, setGameState, bestNight, getNightName, kills } = useGameStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md pointer-events-auto relative p-6">
      <div className="max-w-md w-full p-8 md:p-12 text-center flex flex-col items-center">
        <div className="text-white/50 text-xs font-black uppercase tracking-[0.4em] mb-4">The Eternal Shadow Consumes All</div>
        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic">NIGHT ENDED</h2>
        
        <div className="bg-black/40 rounded-[2.5rem] p-8 mb-10 border border-white/5 w-full">
            <div className="mb-6">
                <div className="text-red-400 text-[11px] font-black uppercase tracking-widest mb-1 italic">Last Stand</div>
                <div className="text-white text-2xl font-black">
                   {wave} – {getNightName(wave)}
                </div>
                <div className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">{kills} Enemies Slain</div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                    <div className="text-white/40 text-[10px] font-bold uppercase mb-1">Final Score</div>
                    <div className="text-white text-4xl font-black tabular-nums">{score}</div>
                </div>
                <div>
                    <div className="text-orange-500 text-[10px] font-bold uppercase mb-1 italic">Best Night</div>
                    <div className="text-white text-4xl font-black tabular-nums">{bestNight}</div>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
            <button 
                onClick={() => resetGame()}
                className="w-full bg-white text-red-950 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
                TRY AGAIN
            </button>
            <button 
                onClick={() => setGameState(GameState.MAIN_MENU)}
                className="w-full bg-white/10 text-white/70 py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/20 transition-all"
            >
                MAIN MENU
            </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <DeeJayLabsLogo />
      </div>
    </div>
  );
};

export default GameOver;
