
import React, { useState } from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import SettingsPanel, { useSettingsStore } from './SettingsPanel';

const PauseMenu: React.FC = () => {
  const { setGameState } = useGameStore();
  const settings = useSettingsStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[120] pointer-events-auto p-6">
      <div className="bg-[#0a0f1a] border border-white/10 p-10 sm:p-14 rounded-[3rem] max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,1)] text-center animate-in zoom-in duration-300 flex flex-col items-center">

        <h2 className="text-white text-5xl sm:text-6xl font-black mb-1 italic tracking-tighter uppercase leading-none">
          PAUSED
        </h2>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mb-12 italic">
          Session Suspended
        </p>

        <div className="flex flex-col gap-4 w-full mb-12">
          <button
            onClick={() => setGameState(GameState.PLAYING)}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all uppercase italic tracking-tight"
          >
            RESUME
          </button>

          <button
            onClick={() => settings.setIsOpen(true)}
            className="w-full bg-white/5 text-white/80 py-4 rounded-2xl font-black text-base border border-white/10 hover:bg-white/10 transition-all uppercase italic tracking-tight"
          >
            SETTINGS
          </button>

          <button
            onClick={() => setGameState(GameState.MAIN_MENU)}
            className="w-full bg-red-600/10 text-red-500 py-4 rounded-2xl font-black text-base border border-red-500/20 hover:bg-red-500/20 transition-all uppercase italic tracking-tight"
          >
            RETURN TO HOME
          </button>
        </div>

        <div className="opacity-60 hover:opacity-100 transition-opacity scale-110">
          <DeeJayLabsLogo />
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
