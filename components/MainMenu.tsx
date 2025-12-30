
import React, { useState, useEffect } from 'react';
import { useGameStore, GameState } from '../store';
import { useSettingsStore } from './SettingsPanel';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import HowToPlay from './HowToPlay';
import EnhancedChat from './EnhancedChat';
import ArenaHub from './ArenaHub';
import BattleHistory from './BattleHistory';
import ConstellationMenu from './ConstellationMenu';
import MultiplayerToggle from './MultiplayerToggle';

const MainMenu: React.FC = () => {
  const {
    gameState,
    setGameState,
    userProfile,
    updateUserProfile,
    bestScore,
    lastWave,
    leaderboard,
    hasSave,
    loadGame,
    constellation
  } = useGameStore();

  const settings = useSettingsStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showNexus, setShowNexus] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSeason, setShowSeason] = useState(false);

  const [editName, setEditName] = useState(userProfile.name);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);
  const [editEmail, setEditEmail] = useState(userProfile.email || '');

  const avatarOptions = ['👤', '🛡️', '⚔️', '🔥', '🌟', '🌙', '🌊', '🌪️', '🌋', '🍀', '💎', '🗿'];

  useEffect(() => {
    if (gameState === GameState.MENU) {
      soundEffects.playAmbient('menu_theme');
    }
  }, [gameState]);

  const onStartGame = () => {
    soundEffects.stopAmbient();
    soundEffects.playSuccess();
    haptics.impact('heavy');
    setGameState(GameState.PLAYING);
  };

  const getNightName = (wave: number) => {
    if (wave <= 5) return "PALE MOON";
    if (wave <= 10) return "CRIMSON DUSK";
    if (wave <= 15) return "OBSIDIAN VOID";
    return "ETERNAL SHADOW";
  };

  if (gameState !== GameState.MENU) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] overflow-hidden flex flex-col items-center safe-padding">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-orange-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Header / Profile Bar */}
      <div className="w-full p-4 sm:p-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] transform -rotate-90 origin-right">System v2.4</div>
          <div className="h-10 w-[2px] bg-orange-600 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
        </div>

        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group pointer-events-auto"
        >
          <div className="text-right">
            <div className="text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">{userProfile.name}</div>
            <div className="text-cyan-400 text-[9px] font-bold tabular-nums">BEST: {bestScore.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform">
            {userProfile.avatar}
          </div>
        </button>
      </div>

      {/* Main Menu Layout */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative z-10 px-6 py-4 overflow-y-auto no-scrollbar pt-12 sm:pt-0">

        {/* Logo Section */}
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter italic leading-none drop-shadow-[0_10px_50px_rgba(255,107,0,0.6)]">
            NIGHT<span className="text-orange-500">FLARE</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-px w-8 sm:w-16 bg-white/20" />
            <span className="text-white/40 text-[8px] sm:text-xs font-black uppercase tracking-[0.4em]">Survive the Eternal Shadow</span>
            <div className="h-px w-8 sm:w-16 bg-white/20" />
          </div>
        </div>

        {/* Actions Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">

          {/* Primary Button: New Journey */}
          <button
            onClick={onStartGame}
            className="col-span-1 sm:col-span-2 lg:col-span-2 h-20 sm:h-28 bg-gradient-to-b from-white via-slate-100 to-slate-200 rounded-3xl p-1 shadow-[0_15px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all text-black overflow-hidden group"
          >
            <div className="relative h-full w-full flex items-center justify-center gap-6 overflow-hidden bg-white/50 rounded-[1.25rem]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="text-4xl sm:text-6xl">🔥</span>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none">New Journey</div>
                <div className="text-[10px] sm:text-xs font-bold opacity-50 uppercase tracking-[0.2em] mt-2">Enter the void darkness</div>
              </div>
            </div>
          </button>

          {/* Constellation Button */}
          <button
            onClick={() => setShowConstellation(true)}
            className="h-20 sm:h-28 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-1 shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-white overflow-hidden group"
          >
            <div className="relative h-full w-full flex items-center justify-center gap-4 bg-indigo-950/40 rounded-[1.25rem]">
              <span className="text-3xl sm:text-5xl group-hover:rotate-12 transition-transform">🌌</span>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none">The Nebula</div>
                <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">Skill Evolution</div>
              </div>
            </div>
          </button>

          {/* Menu Buttons Grid Items */}
          <MenuButton icon="🏆" label="Leaderboards" sublabel="Global Ranks" onClick={() => setShowLeaderboard(true)} color="blue" />
          <MenuButton icon="⚙️" label="Settings" sublabel="Configuration" onClick={() => settings.setIsOpen(true)} color="slate" />
          <MenuButton icon="🏛️" label="Shadow Arena" sublabel="Coming Soon" onClick={() => { }} color="red" disabled />
          <MenuButton icon="📜" label="Battle Log" sublabel="Past Runs" onClick={() => setShowHistory(true)} color="purple" />
          <MenuButton icon="🛍️" label="Nexus Shop" sublabel="Premium" onClick={() => { }} color="cyan" />
          <MenuButton icon="❓" label="How to Play" sublabel="Tutorial" onClick={() => setShowHowToPlay(true)} color="orange" />
        </div>

        {/* Footer Branding */}
        <div className="mt-auto py-8 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
          <DeeJayLabsLogo />
          <div className="text-[8px] font-bold text-white uppercase tracking-[0.5em] italic">Hardware Protocol v2.4 Active</div>
        </div>
      </div>

      {/* Modals and Overlays */}
      {showHowToPlay && <HowToPlay onBack={() => setShowHowToPlay(false)} />}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white italic uppercase">Global Elite</h2>
                <button onClick={() => setShowLeaderboard(false)} className="text-white/50 hover:text-white text-2xl">✕</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="w-8 font-black text-white/30">#{idx + 1}</span>
                    <span className="text-3xl">{entry.avatar}</span>
                    <div className="flex-1">
                      <div className="text-white font-black uppercase text-sm">{entry.name}</div>
                      <div className="text-cyan-400 text-xs font-bold">{entry.wave}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white tabular-nums">{entry.score.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showConstellation && <ConstellationMenu onClose={() => setShowConstellation(false)} />}
      {showArena && <ArenaHub onBack={() => setShowArena(false)} />}
      {showHistory && <BattleHistory onBack={() => setShowHistory(false)} />}

      {showProfile && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 text-center">Survivor Profile</h2>

            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-orange-600 border-4 border-white/20 flex items-center justify-center text-5xl shadow-2xl relative group overflow-hidden">
                {editAvatar}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <span className="text-[10px] font-black text-white uppercase mt-12">Edit</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {avatarOptions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { haptics.light(); setEditAvatar(emoji); }}
                  className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${editAvatar === emoji ? 'bg-orange-600 scale-110 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-white font-black text-center mb-8 focus:border-orange-500 outline-none uppercase tracking-widest text-lg"
            />

            <div className="flex gap-4">
              <button onClick={() => setShowProfile(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-white/50 font-black uppercase text-sm tracking-widest hover:bg-white/10 hover:text-white transition-all">Cancel</button>
              <button
                onClick={() => {
                  updateUserProfile({ name: editName, avatar: editAvatar });
                  setShowProfile(false);
                  soundEffects.playSuccess();
                }}
                className="flex-1 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase text-sm tracking-widest hover:bg-orange-500 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuButton: React.FC<{ icon: string, label: string, sublabel?: string, onClick: () => void, color?: string, disabled?: boolean }> = ({ icon, label, sublabel, onClick, color = "slate", disabled = false }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-900/40 border-blue-500/20 hover:border-blue-400';
      case 'orange': return 'bg-orange-900/40 border-orange-500/20 hover:border-orange-400';
      case 'red': return 'bg-red-900/40 border-red-500/20 hover:border-red-400';
      case 'purple': return 'bg-purple-900/40 border-purple-500/20 hover:border-purple-400';
      case 'cyan': return 'bg-cyan-900/40 border-cyan-500/20 hover:border-cyan-400';
      default: return 'bg-white/5 border-white/10 hover:border-white/30';
    }
  };

  return (
    <button
      onClick={() => { if (!disabled) { haptics.light(); soundEffects.clickButton(); onClick(); } }}
      disabled={disabled}
      className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all group relative overflow-hidden active:scale-95 ${getColorClasses()} ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-1 shadow-lg'}`}
    >
      <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{icon}</span>
      <div className="text-left">
        <div className="text-sm sm:text-base font-black text-white uppercase tracking-tighter leading-none italic">{label}</div>
        {sublabel && <div className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">{sublabel}</div>}
      </div>
      {disabled && <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"><span className="text-[10px] font-black text-white/50 tracking-widest uppercase rotate-12">Coming Soon</span></div>}
    </button>
  );
};

export default MainMenu;
