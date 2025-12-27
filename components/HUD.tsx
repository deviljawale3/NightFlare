
import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { TimeOfDay, GameState } from '../types';

interface HUDProps {
  onOpenInventory: () => void;
  onOpenCrafting: () => void;
}

const HUD: React.FC<HUDProps> = ({ onOpenInventory, onOpenCrafting }) => {
  const { resources, playerStats, nightflareHealth, wave, timeOfDay, gameState, setGameState, triggerNova, getNightName, isPlayerGrounded, kills, score, level, levelTimer } = useGameStore();

  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current || (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL)) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dX = clientX - centerX;
    const dY = clientY - centerY;
    const dist = Math.sqrt(dX ** 2 + dY ** 2) || 0.001;
    const maxDist = window.innerWidth < 640 ? 45 : 65;
    const scale = Math.min(dist, maxDist) / dist;
    const limitedX = dX * scale;
    const limitedY = dY * scale;
    setJoystickPos({ x: limitedX, y: limitedY });
    (window as any).joystickX = limitedX / maxDist;
    (window as any).joystickY = limitedY / maxDist;
  };

  const stopJoystick = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    (window as any).joystickX = 0;
    (window as any).joystickY = 0;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-8 select-none pointer-events-none font-['Outfit'] overflow-hidden">

      {/* TOP SECTION: HEALTH, TIMER, RESOURCES */}
      <div className="flex justify-between items-start w-full relative h-24">

        {/* TOP LEFT: COMPACT HEALTH BARS */}
        <div className="bg-black/40 backdrop-blur-xl p-3 sm:p-5 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto min-w-[110px] sm:min-w-[200px]">
          <div className="space-y-2 sm:space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[8px] sm:text-[10px] font-black text-white/50 tracking-widest uppercase italic leading-none">Survivor</span>
                <span className="text-white text-[9px] sm:text-xs font-black italic leading-none">{Math.ceil(playerStats.currentHealth)}%</span>
              </div>
              <div className="w-full h-1.5 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{ width: `${(playerStats.currentHealth / playerStats.maxHealth) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[8px] sm:text-[10px] font-black text-orange-500/70 tracking-widest uppercase italic leading-none">Core</span>
                <span className="text-orange-400 text-[9px] sm:text-xs font-black italic leading-none">{Math.ceil(nightflareHealth)}%</span>
              </div>
              <div className="w-full h-1.5 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(234,88,12,0.5)]"
                  style={{ width: `${nightflareHealth}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* TOP CENTER: TIMER & LEVEL */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none top-0">
          <div className="bg-black/50 backdrop-blur-md px-4 sm:px-10 py-2 sm:py-3 rounded-[2rem] border border-white/10 text-center shadow-2xl">
            <div className="text-[8px] sm:text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] italic mb-0.5 sm:mb-1 whitespace-nowrap">Survive Level {level}</div>
            <div className="text-xl sm:text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
              {formatTime(levelTimer)}
            </div>
          </div>
        </div>

        {/* TOP RIGHT: RESOURCES & PAUSE */}
        <div className="flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl px-3 py-1.5 sm:px-6 sm:py-3 rounded-2xl border border-white/10 flex gap-3 sm:gap-8 shadow-2xl">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-2xl">🪵</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.wood}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-2xl">🪨</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.stone}</span>
            </div>
          </div>

          <button
            onClick={() => setGameState(GameState.PAUSED)}
            className="w-10 h-10 sm:w-16 sm:h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl pointer-events-auto"
          >
            <span className="text-lg sm:text-2xl">⏸️</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex justify-between items-end w-full pb-4 px-2">

        {/* Joystick */}
        <div className="flex flex-col items-center">
          <div ref={joystickBaseRef} className="w-28 h-28 sm:w-44 sm:h-44 rounded-full border border-white/10 bg-black/40 pointer-events-auto touch-none flex items-center justify-center shadow-inner"
            onPointerDown={e => { setJoystickActive(true); handleJoystick(e.clientX, e.clientY); }}
            onPointerMove={e => joystickActive && handleJoystick(e.clientX, e.clientY)}
            onPointerUp={stopJoystick} onPointerLeave={stopJoystick}>
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-2xl transition-transform duration-75"
              style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }} />
          </div>
        </div>

        {/* Center Utilities */}
        <div className="flex flex-col items-center gap-6 pointer-events-auto">
          <button
            onClick={triggerNova}
            className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all border-2 ${playerStats.novaCharge >= 100 ? 'bg-orange-600 border-white shadow-[0_0_35px_rgba(251,146,60,0.8)] animate-pulse' : 'bg-black/60 border-white/10 opacity-70'}`}>
            <span className="text-3xl sm:text-5xl">🔥</span>
            <span className="text-[8px] sm:text-[10px] font-black text-white mt-1 italic">{Math.floor(playerStats.novaCharge)}%</span>
          </button>
          <div className="flex gap-4">
            <button onClick={onOpenInventory} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-center text-2xl active:scale-90 shadow-2xl">🎒</button>
            <button onClick={onOpenCrafting} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-2xl active:scale-90 shadow-2xl">🛠️</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end gap-6 sm:gap-14 pointer-events-auto">
          <button
            onPointerDown={() => isPlayerGrounded && window.dispatchEvent(new Event('player-jump'))}
            className={`w-14 h-14 sm:w-20 sm:h-20 bg-cyan-900/40 border border-cyan-400/50 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${!isPlayerGrounded ? 'opacity-30' : 'opacity-100'}`}
          >
            <span className="text-3xl sm:text-5xl text-cyan-300">🌀</span>
          </button>

          <button
            onPointerDown={() => window.dispatchEvent(new Event('player-attack'))}
            className="w-28 h-28 sm:w-44 sm:h-44 bg-red-600 border-b-[8px] sm:border-b-[12px] border-red-900 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center active:translate-y-2 active:border-b-0 transition-all shadow-2xl"
          >
            <span className="text-5xl sm:text-8xl">⚔️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HUD;
