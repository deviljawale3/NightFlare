import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { TimeOfDay, GameState } from '../types';
import ChatPanel from './ChatPanel';
import SocialShare from './SocialShare';

interface HUDProps {
  onOpenInventory: () => void;
  onOpenCrafting: () => void;
}

// Isolated Joystick Component to prevent parent re-renders
const Joystick: React.FC = React.memo(() => {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleStart = (e: React.PointerEvent) => {
    if (!baseRef.current) return;
    rectRef.current = baseRef.current.getBoundingClientRect();
    setActive(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    handleMove(e.clientX, e.clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!rectRef.current) return;

    // Use cached rect
    const width = rectRef.current.width;
    const height = rectRef.current.height;
    const centerX = rectRef.current.left + width / 2;
    const centerY = rectRef.current.top + height / 2;

    const dX = clientX - centerX;
    const dY = clientY - centerY;
    const dist = Math.sqrt(dX ** 2 + dY ** 2) || 0.001;

    // Slightly larger max dist for smoother feel
    const maxDist = window.innerWidth < 640 ? 50 : 70;

    const scale = Math.min(dist, maxDist) / dist;
    const limitedX = dX * scale;
    const limitedY = dY * scale;

    setPos({ x: limitedX, y: limitedY });

    // Direct global update (bypassing React state for game loop)
    (window as any).joystickX = limitedX / maxDist;
    (window as any).joystickY = limitedY / maxDist;
  };

  const handleEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    rectRef.current = null;
    (window as any).joystickX = 0;
    (window as any).joystickY = 0;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={baseRef}
        className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-white/10 bg-black/40 pointer-events-auto touch-none flex items-center justify-center shadow-inner"
        onPointerDown={handleStart}
        onPointerMove={e => { if (active) handleMove(e.clientX, e.clientY); }}
        onPointerUp={e => { (e.target as Element).releasePointerCapture(e.pointerId); handleEnd(); }}
        onPointerCancel={handleEnd}
      >
        <div
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-2xl pointer-events-none transition-transform duration-75"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        />
      </div>
    </div>
  );
});

const HUD: React.FC<HUDProps> = ({ onOpenInventory, onOpenCrafting }) => {
  const { resources, playerStats, nightflareHealth, level, levelTimer, chatMessages, setGameState, triggerNova, isPlayerGrounded, wave, score, challengeState } = useGameStore(
    // Selector for perf optimization: only re-render on specific changes
    (state) => ({
      resources: state.resources,
      playerStats: state.playerStats,
      nightflareHealth: state.nightflareHealth,
      level: state.level,
      levelTimer: state.levelTimer,
      chatMessages: state.chatMessages,
      setGameState: state.setGameState,
      triggerNova: state.triggerNova,
      isPlayerGrounded: state.isPlayerGrounded,
      wave: state.wave,
      score: state.score,
      challengeState: state.challengeState,
    })
  );

  // Shallow comparison isn't default for hook, so we might re-render. 
  // But moving joystick out is the biggest win.

  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const lastMsgCount = useRef(chatMessages.length);

  React.useEffect(() => {
    if (chatMessages.length > lastMsgCount.current && !showChat) {
      setHasUnread(true);
    }
    lastMsgCount.current = chatMessages.length;
  }, [chatMessages.length, showChat]);

  React.useEffect(() => {
    if (showChat) setHasUnread(false);
  }, [showChat]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-8 select-none pointer-events-none font-['Outfit'] overflow-hidden relative">

      {/* CHAT OVERLAY */}
      {showChat && (
        <div className="absolute top-24 left-4 z-50 w-[80vw] sm:w-96 h-64 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto flex flex-col shadow-2xl animate-in slide-in-from-left-4 duration-200">
          <div className="flex justify-between items-center p-2 border-b border-white/10 bg-white/5 rounded-t-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 pl-2">Radio Comms</span>
            <button onClick={() => setShowChat(false)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <ChatPanel compact />
          </div>
        </div>
      )}

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

        {/* TOP CENTER: TIMER & LEVEL OR CHALLENGE STATUS */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none top-0">
          {challengeState?.isActive ? (
            // CHALLENGE MODE UI
            <div className="bg-black/80 backdrop-blur-md px-6 sm:px-10 py-3 sm:py-4 rounded-[2rem] border border-red-500/30 text-center shadow-2xl min-w-[280px] sm:min-w-[400px]">
              <div className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] italic mb-2 whitespace-nowrap flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                SHADOW DUEL
              </div>

              {/* Score Comparison */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex flex-col items-center">
                  <div className="text-white/50 text-[8px] uppercase font-bold mb-1">You</div>
                  <div className="text-green-400 text-lg sm:text-2xl font-black tabular-nums">{score}</div>
                </div>

                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative mx-4">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (score / (score + challengeState.opponent.score)) * 100)}%` }}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-white/50 text-[8px] uppercase font-bold mb-1">{challengeState.opponent.name}</div>
                  <div className="text-red-400 text-lg sm:text-2xl font-black tabular-nums">{Math.floor(challengeState.opponent.score)}</div>
                </div>
              </div>

              <div className="text-white/30 text-[9px] font-mono tabular-nums">{formatTime(levelTimer)} remaining</div>
            </div>
          ) : (
            // NORMAL MODE UI
            <div className="bg-black/50 backdrop-blur-md px-4 sm:px-10 py-2 sm:py-3 rounded-[2rem] border border-white/10 text-center shadow-2xl">
              <div className="text-[8px] sm:text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] italic mb-0.5 sm:mb-1 whitespace-nowrap">Survive Level {level}</div>
              <div className="text-xl sm:text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
                {formatTime(levelTimer)}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT: RESOURCES & PAUSE */}
        <div className="flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/10 flex flex-wrap justify-end gap-x-4 gap-y-1 shadow-2xl max-w-[160px] sm:max-w-none">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-2xl">🪵</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.wood}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-2xl">🪨</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.stone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-2xl">🍎</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.food}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-2xl">✨</span>
              <span className="text-xs sm:text-lg font-black text-white">{resources.lightShards}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="w-10 h-10 sm:w-16 sm:h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl pointer-events-auto"
            >
              <span className="text-lg sm:text-2xl">📸</span>
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-10 h-10 sm:w-16 sm:h-16 bg-blue-900/40 border border-blue-400/30 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl pointer-events-auto ${showChat ? 'bg-blue-600' : ''}`}
            >
              <span className="text-lg sm:text-2xl">💬</span>
              {hasUnread && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />}
            </button>
            <button
              onClick={() => {
                // Force immediate state update
                useGameStore.getState().setGameState(GameState.PAUSED);
              }}
              className="w-10 h-10 sm:w-16 sm:h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl pointer-events-auto"
            >
              <span className="text-lg sm:text-2xl">⏸️</span>
            </button>
          </div>
        </div>
      </div>

      {/* BRANDING watermark */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none z-0">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-black text-white uppercase tracking-widest italic">DeeJay Labs</span>
        </div>
      </div>

      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex justify-between items-end w-full pb-4 px-2">

        {/* Joystick - Isolated */}
        <Joystick />

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

      {showShare && <SocialShare onClose={() => setShowShare(false)} stats={{ wave, score }} />}
    </div>
  );
};

export default HUD;
