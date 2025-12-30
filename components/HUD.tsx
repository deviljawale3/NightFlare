import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { TimeOfDay, GameState } from '../types';
import ChatPanel from './ChatPanel';
import SocialShare from './SocialShare';
import Minimap from './Minimap';
import PremiumJoystick from './PremiumJoystick';
import PremiumAttackButton from './PremiumAttackButton';
import PremiumCameraButton from './PremiumCameraButton';

interface HUDProps {
  onOpenInventory: () => void;
  onOpenCrafting: () => void;
}

// Premium Joystick handlers
const handleJoystickMove = (x: number, y: number) => {
  (window as any).joystickX = x;
  (window as any).joystickY = y;
};

const handleJoystickEnd = () => {
  (window as any).joystickX = 0;
  (window as any).joystickY = 0;
};

const HUD: React.FC<HUDProps> = ({ onOpenInventory, onOpenCrafting }) => {
  const {
    notification, resources, playerStats, nightflareHealth, level, levelTimer,
    chatMessages, setGameState, triggerNova, isPlayerGrounded, wave, score,
    challengeState, constellation, cycleWeapon
  } = useGameStore();

  const [orbitalCooldown, setOrbitalCooldown] = useState(0);
  const isOrbitalUnlocked = constellation.find(n => n.id === 'orbital_strike')?.currentLevel! > 0;

  const triggerOrbital = () => {
    if (orbitalCooldown > 0 || !isOrbitalUnlocked) return;
    window.dispatchEvent(new CustomEvent('orbital-strike-target'));
    setOrbitalCooldown(60); // 60s cooldown
  };

  React.useEffect(() => {
    if (orbitalCooldown > 0) {
      const timer = setInterval(() => setOrbitalCooldown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [orbitalCooldown]);

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


  const getThemeColor = () => {
    if (wave % 5 === 0) return { r: 220, g: 20, b: 60, name: 'BLOOD MOON' }; // Red for Boss Waves
    if (useGameStore.getState().timeOfDay === TimeOfDay.NIGHT) return { r: 147, g: 51, b: 234, name: 'VOID NIGHT' }; // Purple for Night
    return { r: 249, g: 115, b: 22, name: 'DAYLIGHT' }; // Orange for Day
  };

  const theme = getThemeColor();
  const themeStyle = {
    borderColor: `rgba(${theme.r}, ${theme.g}, ${theme.b}, 0.25)`,
    background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(${theme.r},${theme.g},${theme.b}, 0.05))`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3)`
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-8 select-none pointer-events-none font-['Outfit'] overflow-hidden relative safe-padding">

      {/* GLOBAL NOTIFICATION BANNER */}
      {notification && notification.visible && (
        <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none p-4">
          <div className="flex flex-col items-center animate-in zoom-in fade-in slide-in-from-top-12 duration-1000 w-full max-w-4xl">
            <div className={`
              backdrop-blur-3xl px-8 sm:px-20 py-8 sm:py-12 text-center 
              rounded-[2.5rem] sm:rounded-[4rem] border-4 
              shadow-[0_0_100px_rgba(0,0,0,0.8)]
              ${notification.type === 'night'
                ? 'bg-red-950/90 border-red-500/50 shadow-red-900/40'
                : 'bg-slate-900/90 border-blue-500/50 shadow-blue-900/40'}
            `}>
              <div className={`font-black tracking-[0.4em] sm:tracking-[0.8em] text-[10px] sm:text-sm uppercase mb-3 sm:mb-5 animate-pulse
                ${notification.type === 'night' ? 'text-red-500' : 'text-blue-400'}
              `}>
                {notification.subtext || "ALERT"}
              </div>
              <h1 className="text-white text-4xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,1)] leading-none">
                {notification.text}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* CHAT OVERLAY */}
      {showChat && (
        <div className="absolute top-24 left-4 z-50 w-[80vw] sm:w-96 h-64 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto flex flex-col shadow-2xl animate-in slide-in-from-left-10 zoom-in-95 duration-500 ease-out">
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
        <div className="backdrop-blur-xl p-3 sm:p-5 rounded-3xl border shadow-2xl pointer-events-auto min-w-[110px] sm:min-w-[200px]" style={themeStyle}>
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

        {/* TOP CENTER: TIMER & LEVEL - ULTRA COMPACT & TRANSPARENT */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none top-0">
          {challengeState?.isActive ? (
            // CHALLENGE MODE - MINIMAL
            <div className="bg-black/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-red-500/10 text-center shadow-sm min-w-[160px] sm:min-w-[220px]">
              <div className="text-[6px] sm:text-[8px] font-black text-red-400/60 uppercase tracking-[0.15em] italic mb-0.5 whitespace-nowrap flex items-center justify-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                DUEL
              </div>

              {/* Score Comparison - ULTRA COMPACT */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-0.5">
                <div className="flex flex-col items-center">
                  <div className="text-white/30 text-[6px] uppercase font-bold mb-0">You</div>
                  <div className="text-green-400 text-xs sm:text-sm font-black tabular-nums">{score}</div>
                </div>

                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden relative mx-1.5">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (score / (score + challengeState.opponent.score)) * 100)}%` }}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-white/30 text-[6px] uppercase font-bold mb-0">{challengeState.opponent.name}</div>
                  <div className="text-red-400 text-xs sm:text-sm font-black tabular-nums">{Math.floor(challengeState.opponent.score)}</div>
                </div>
              </div>

              <div className="text-white/20 text-[7px] font-mono tabular-nums">{formatTime(levelTimer)}</div>
            </div>
          ) : (
            // NORMAL MODE - ULTRA COMPACT & TRANSPARENT
            <div className="bg-black/15 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-white/5 text-center shadow-sm">
              <div className="text-[6px] sm:text-[8px] font-black opacity-40 uppercase tracking-[0.15em] italic mb-0 whitespace-nowrap" style={{ color: `rgba(${theme.r},${theme.g},${theme.b},0.6)` }}>{theme.name} • W{wave}</div>
              <div className="text-base sm:text-xl font-black text-white/80 tracking-tighter tabular-nums leading-none">
                {formatTime(levelTimer)}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT: RESOURCES & PAUSE - PREMIUM */}
        <div className="flex flex-col items-end gap-2 sm:gap-4 pointer-events-auto">
          {/* RESOURCES PANEL - PREMIUM GLASS */}
          <div className="
            relative group
            backdrop-blur-xl 
            bg-black/30 
            px-3 py-2 sm:px-4 sm:py-3
            rounded-2xl 
            border border-white/10 
            flex flex-wrap justify-end gap-x-3 sm:gap-x-5 gap-y-1 
            shadow-lg
            transition-all duration-300
            hover:bg-black/40 hover:border-white/20 hover:scale-[1.02]
          ">
            {[
              { icon: '🪵', val: resources.wood, color: 'text-amber-400' },
              { icon: '🪨', val: resources.stone, color: 'text-stone-300' },
              { icon: '🍎', val: resources.food, color: 'text-red-400' },
              { icon: '✨', val: resources.lightShards, color: 'text-cyan-300' }
            ].map((res, i) => (
              <div key={i} className="flex items-center gap-1.5 transition-transform hover:scale-110">
                <span className="text-sm sm:text-2xl drop-shadow-md filter">{res.icon}</span>
                <span className={`text-xs sm:text-lg font-black ${res.color} tabular-nums leading-none tracking-tight`}>
                  {res.val}
                </span>
              </div>
            ))}
          </div>

          {/* MINIMAP CONTAINER - PREMIUM */}
          <div className="
            pointer-events-auto 
            backdrop-blur-xl 
            rounded-2xl 
            border border-white/10 
            shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
            p-1 
            overflow-hidden
            bg-black/20
            transition-transform hover:scale-105
          ">
            <Minimap />
          </div>

          <div className="flex gap-2 sm:gap-3">
            {/* SCREENSHOT BUTTON */}
            <button
              onClick={() => setShowShare(true)}
              className="
                relative group
                w-10 h-10 sm:w-14 sm:h-14
                rounded-xl
                bg-white/5 hover:bg-white/10
                backdrop-blur-xl
                border border-white/10
                flex items-center justify-center
                shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
                transition-all duration-300
                active:scale-95
              "
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-lg sm:text-2xl drop-shadow-lg transform group-hover:rotate-12 transition-transform">📸</span>
            </button>

            {/* CHAT BUTTON */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`
                relative group
                w-10 h-10 sm:w-14 sm:h-14
                rounded-xl
                backdrop-blur-xl
                border
                flex items-center justify-center
                shadow-lg
                transition-all duration-300
                active:scale-95
                ${showChat
                  ? 'bg-blue-600/60 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-900/40 border-blue-400/30 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                }
              `}
            >
              <span className="text-lg sm:text-2xl drop-shadow-lg transform group-hover:scale-110 transition-transform">💬</span>
              {hasUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red] border border-white/20" />
              )}
            </button>

            {/* PAUSE BUTTON */}
            <button
              onClick={() => useGameStore.getState().setGameState(GameState.PAUSED)}
              className="
                relative group
                w-10 h-10 sm:w-14 sm:h-14
                rounded-xl
                bg-red-500/10 hover:bg-red-500/20
                backdrop-blur-xl
                border border-red-500/20
                flex items-center justify-center
                shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
                transition-all duration-300
                active:scale-95
              "
            >
              <span className="text-lg sm:text-2xl drop-shadow-lg transform group-hover:scale-110 transition-transform">⏸️</span>
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

      {/* BOTTOM SECTION: PREMIUM CONTROLS */}
      <div className="flex justify-between items-end w-full pb-4 px-2">

        {/* Premium Joystick */}
        <PremiumJoystick onMove={handleJoystickMove} onEnd={handleJoystickEnd} />

        {/* Center Utilities */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto">
          {/* Orbital Strike Button (If Unlocked) */}
          {isOrbitalUnlocked && (
            <button
              onClick={triggerOrbital}
              className={`
                relative group
                w-12 h-12 sm:w-16 sm:h-16 
                rounded-2xl 
                flex flex-col items-center justify-center 
                transition-all duration-300
                border-2
                backdrop-blur-xl
                ${orbitalCooldown === 0
                  ? 'bg-gradient-to-br from-indigo-500/40 to-blue-500/40 border-cyan-400/60 shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-110 active:scale-95 cursor-pointer'
                  : 'bg-black/40 border-white/10 opacity-70 cursor-not-allowed'
                }
              `}
            >
              <span className="text-xl sm:text-3xl drop-shadow-lg">🛰️</span>
              {orbitalCooldown > 0 && (
                <span className="text-[8px] sm:text-[10px] font-black text-white mt-0.5">{orbitalCooldown}s</span>
              )}
            </button>
          )}

          <button
            onClick={triggerNova}
            className={`
              relative group
              w-16 h-16 sm:w-24 sm:h-24 
              rounded-full 
              flex flex-col items-center justify-center 
              transition-all duration-300
              border-2
              backdrop-blur-xl
              ${playerStats.novaCharge >= 100
                ? 'bg-gradient-to-br from-orange-500/40 to-red-500/40 border-yellow-400/60 shadow-[0_0_50px_rgba(251,146,60,0.8)] hover:scale-110 active:scale-95 cursor-pointer'
                : 'bg-black/40 border-white/10 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* Animated glow ring when ready */}
            {playerStats.novaCharge >= 100 && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-40" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 opacity-20 animate-pulse" />
              </>
            )}

            {/* Icon and charge */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-3xl sm:text-5xl drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]">🔥</span>
              <span className="text-[8px] sm:text-[10px] font-black text-white mt-1 italic drop-shadow-lg">
                {Math.floor(playerStats.novaCharge)}%
              </span>
            </div>

            {/* Charge progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="url(#novaGradient)"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                strokeDashoffset={2 * Math.PI * 45 * (1 - playerStats.novaCharge / 100)}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="novaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
          </button>
          <div className="flex gap-4">
            {/* Premium Inventory Button */}
            <button
              onClick={onOpenInventory}
              className="
                relative group
                w-12 h-12 sm:w-16 sm:h-16 
                rounded-2xl 
                bg-gradient-to-br from-purple-500/20 to-blue-500/20
                backdrop-blur-xl
                border border-purple-400/30 
                flex items-center justify-center 
                text-2xl 
                shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]
                transition-all duration-300
                hover:scale-110 active:scale-90
              "
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />

              {/* Icon */}
              <span className="relative z-10 drop-shadow-lg">🎒</span>

              {/* Shimmer */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </button>

            {/* Premium Crafting Button */}
            <button
              onClick={onOpenCrafting}
              className="
                relative group
                w-12 h-12 sm:w-16 sm:h-16 
                rounded-2xl 
                bg-gradient-to-br from-orange-500/20 to-amber-500/20
                backdrop-blur-xl
                border border-orange-400/30 
                flex items-center justify-center 
                text-2xl 
                shadow-lg hover:shadow-[0_0_30px_rgba(251,146,60,0.5)]
                transition-all duration-300
                hover:scale-110 active:scale-90
              "
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity" />

              {/* Icon */}
              <span className="relative z-10 drop-shadow-lg">🛠️</span>

              {/* Shimmer */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </button>
          </div>
        </div>

        {/* Premium Action Buttons */}
        <div className="flex flex-col items-end gap-6 sm:gap-14 pointer-events-auto">
          {/* Weapon Cycle Button */}
          <button
            onClick={cycleWeapon}
            className="
              relative group
              w-12 h-12 sm:w-16 sm:h-16 
              rounded-2xl 
              bg-white/5 hover:bg-white/10
              backdrop-blur-xl
              border border-white/10
              flex flex-col items-center justify-center
              shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
              transition-all duration-300
              active:scale-95
            "
          >
            <span className="text-xl sm:text-2xl drop-shadow-lg">🔄</span>
            <span className="text-[7px] sm:text-[9px] font-black text-white/50 uppercase tracking-tighter mt-0.5">{playerStats.currentWeapon}</span>
          </button>

          <button
            onPointerDown={() => isPlayerGrounded && window.dispatchEvent(new Event('player-jump'))}
            className={`
              relative group
              w-14 h-14 sm:w-20 sm:h-20 
              rounded-full 
              bg-gradient-to-br from-cyan-500/30 to-blue-500/30
              backdrop-blur-xl
              border border-cyan-400/40 
              flex items-center justify-center 
              shadow-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]
              transition-all duration-300
              ${!isPlayerGrounded ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-90 cursor-pointer'}
            `}
          >
            {/* Glow effect */}
            {isPlayerGrounded && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            )}

            {/* Icon */}
            <span className="relative z-10 text-3xl sm:text-5xl text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">🌀</span>

            {/* Shimmer */}
            {isPlayerGrounded && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            )}
          </button>

          {/* Premium Attack Button */}
          <PremiumAttackButton onAttack={() => window.dispatchEvent(new Event('player-attack'))} />
        </div>
      </div>

      {/* Premium Camera Button */}
      <PremiumCameraButton onToggle={() => {
        // Toggle camera mode - you can implement camera switching logic here
        console.log('Camera toggle');
      }} />

      {showShare && <SocialShare onClose={() => setShowShare(false)} stats={{ wave, score }} />}
    </div>
  );
};

export default HUD;
