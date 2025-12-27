
import React, { useState } from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import HowToPlay from './HowToPlay';
import SettingsPage from './SettingsPage';

const MainMenu: React.FC = () => {
  const { resetGame, loadGame, lastWave, bestScore } = useGameStore();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const hasSave = !!localStorage.getItem('nightflare_save_v7');

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-gradient-to-b from-black/10 via-black/30 to-black/90 backdrop-blur-[1px] pointer-events-auto overflow-y-auto px-6 custom-scrollbar z-[100] safe-padding">
      <div className="w-full max-w-md flex flex-col items-center justify-start pt-4 sm:pt-12 pb-8 min-h-full animate-in fade-in zoom-in duration-700">

        {/* Main Logo Section */}
        <div className="mb-6 sm:mb-14 text-center w-full px-4">
          <h1 className="text-[10vw] sm:text-6xl font-black text-white tracking-tighter italic leading-none select-none drop-shadow-[0_10px_60px_rgba(255,107,0,0.8)]">
            NIGHT<span className="text-[#ff6b00]">FLARE</span>
          </h1>
          <p className="text-white mt-2 font-black tracking-[0.5em] text-[10px] sm:text-[12px] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] opacity-90">
            Survive the Eternal Shadow
          </p>
          <div className="h-1 w-24 bg-orange-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.7)]" />
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col gap-4 w-full max-w-[340px] items-center">

          {/* PREMIUM 3D NEW JOURNEY BUTTON */}
          <div className="relative w-full group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-pulse" />

            <button
              onClick={() => resetGame(true)}
              className="relative w-full h-16 sm:h-20 bg-gradient-to-b from-white via-slate-100 to-slate-300 rounded-2xl font-black text-xl sm:text-2xl hover:scale-[1.02] active:translate-y-1 active:scale-95 transition-all shadow-[0_10px_0_rgb(180,180,180),0_20px_40px_rgba(0,0,0,0.4)] uppercase italic tracking-tighter flex items-center justify-center text-black overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite]" />
              <span className="relative z-10 drop-shadow-sm">NEW JOURNEY</span>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/60" />
            </button>
          </div>

          {hasSave && (
            <button
              onClick={() => loadGame()}
              className="w-full h-14 sm:h-16 bg-gradient-to-b from-orange-500 to-orange-700 text-white rounded-2xl font-black text-lg sm:text-xl hover:scale-[1.02] active:translate-y-1 active:scale-95 transition-all shadow-[0_8px_0_rgb(154,52,18),0_15px_30px_rgba(0,0,0,0.3)] uppercase italic tracking-tighter"
            >
              CONTINUE
            </button>
          )}

          {/* POLISHED SMALL SECONDARY BUTTONS */}
          <div className="flex flex-col gap-3 w-full max-w-[280px] mt-2 sm:mt-6">
            <button
              onClick={() => setShowSettings(true)}
              className="group w-full h-10 sm:h-12 bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] text-white/70 rounded-xl font-black border-t border-white/10 hover:text-white transition-all text-[11px] sm:text-[12px] uppercase italic tracking-widest shadow-[0_4px_0_rgb(0,0,0),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_rgb(0,0,0)] flex items-center justify-center"
            >
              <span className="group-hover:scale-110 transition-transform">SETTINGS</span>
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="group w-full h-10 sm:h-12 bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] text-white/70 rounded-xl font-black border-t border-white/10 hover:text-white transition-all text-[11px] sm:text-[12px] uppercase italic tracking-widest shadow-[0_4px_0_rgb(0,0,0),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_rgb(0,0,0)] flex items-center justify-center"
            >
              <span className="group-hover:scale-110 transition-transform">HOW TO PLAY</span>
            </button>

            <button
              className="group w-full h-10 sm:h-12 bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] text-white/70 rounded-xl font-black border-t border-white/10 hover:text-white transition-all text-[11px] sm:text-[12px] uppercase italic tracking-widest shadow-[0_4px_0_rgb(0,0,0),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_rgb(0,0,0)] flex items-center justify-center"
            >
              <span className="group-hover:scale-110 transition-transform">EXIT GAME</span>
            </button>
          </div>
        </div>

        {/* Stats Section - Pushed to Bottom */}
        <div className="mt-auto pt-8 sm:pt-12 w-full flex flex-col items-center">
          <div className="flex gap-12 sm:gap-16 mb-6 sm:mb-12">
            <div className="text-center">
              <div className="text-[#ff6b00] text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-80">Last Wave</div>
              <div className="text-white text-3xl sm:text-4xl font-black tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {lastWave ? lastWave : '--'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#3a86ff] text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-80">Best Score</div>
              <div className="text-white text-3xl sm:text-4xl font-black tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {bestScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_20px_rgba(255,107,0,0.5)] pb-4 sm:pb-6">
            <DeeJayLabsLogo className="scale-[1.2] sm:scale-[1.6]" />
          </div>
        </div>
      </div>

      {showHowToPlay && <HowToPlay onBack={() => setShowHowToPlay(false)} />}
      {showSettings && <SettingsPage onBack={() => setShowSettings(false)} />}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
};

export default MainMenu;
