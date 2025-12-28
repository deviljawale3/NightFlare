
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import HowToPlay from './HowToPlay';
import SettingsPanel from './SettingsPanel';
import ChatPanel from './ChatPanel';
import ArenaHub from './ArenaHub';
import BattleHistory from './BattleHistory';
import MultiplayerToggle from './MultiplayerToggle';

interface MainMenuProps {
  showTournament?: () => void;
  showFriends?: () => void;
  showAnalytics?: () => void;
  showSeason?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ showTournament, showFriends, showAnalytics, showSeason }) => {
  const {
    resetGame, loadGame, lastWave, bestScore, userProfile,
    updateUserProfile, leaderboard, getNightName,
    lives, lastLifeRegen, checkLifeRegen, giftLife
  } = useGameStore();

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);
  const hasSave = !!localStorage.getItem('nightflare_save_v7');

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      checkLifeRegen();
      const now = Date.now();
      const elapsed = now - lastLifeRegen;
      const LIFE_REGEN_MS = 10 * 60 * 1000;

      if (lives < 3) {
        const remaining = Math.max(0, LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS));
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('MAX');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lives, lastLifeRegen, checkLifeRegen]);

  const avatarOptions = ['🤠', '🦁', '🦊', '🦉', '💀', '🤖', '👽', '👑'];

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-gradient-to-b from-black/10 via-black/30 to-black/90 backdrop-blur-[1px] pointer-events-auto overflow-y-auto px-6 custom-scrollbar z-[100] safe-padding">

      {/* Life Counter (Top Left) - MOBILE OPTIMIZED */}
      <div className="fixed top-3 sm:top-6 left-3 sm:left-6 z-[120]">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-xl group hover:scale-105 transition-all">
          <div className="flex -space-x-0.5 sm:-space-x-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-lg sm:text-2xl transition-all duration-500 ${i < lives ? 'text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] scale-100' : 'text-white/10 scale-90 grayscale'}`}>
                ♥
              </span>
            ))}
          </div>
          {lives < 3 && (
            <span className="text-[9px] sm:text-[10px] font-black text-white/50 tracking-widest tabular-nums animate-pulse w-10 sm:w-12 text-center">
              {timeLeft}
            </span>
          )}
        </div>
      </div>

      {/* Profile Header - MOBILE OPTIMIZED */}
      <div className="fixed top-3 sm:top-6 right-3 sm:right-6 z-[120]">
        <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-all group">
          <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-wider text-right hidden sm:block">
            {userProfile.name}<br />
            <span className="text-[#3a86ff] text-[9px]">{bestScore.toLocaleString()} PTS</span>
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:rotate-12 transition-transform">
            {userProfile.avatar}
          </div>
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col items-center justify-start pt-24 sm:pt-12 pb-8 min-h-full animate-in fade-in zoom-in duration-700">

        {/* Main Logo Section */}
        <div className="mb-6 sm:mb-10 text-center w-full px-4">
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

          {/* COMPACT ICON-BASED MENU */}
          <div className="flex flex-col gap-4 w-full max-w-[280px] mt-2 sm:mt-6">

            {/* Main Action Icons - Grid Layout */}
            <div className="grid grid-cols-5 gap-2">
              {/* Leaderboard */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="group aspect-square bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg"
                title="Leaderboard"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🏆</span>
                <span className="text-[7px] text-white/50 font-bold uppercase tracking-wider">Board</span>
              </button>

              {/* Shadow Arena */}
              <button
                onClick={() => setShowArena(true)}
                className="group aspect-square bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-md rounded-xl border border-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                title="Shadow Arena"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">⚔️</span>
                <span className="text-[7px] text-orange-400/70 font-bold uppercase tracking-wider">Arena</span>
              </button>

              {/* Battle History */}
              <button
                onClick={() => setShowHistory(true)}
                className="group aspect-square bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-xl border border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                title="Battle History"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📜</span>
                <span className="text-[7px] text-purple-400/70 font-bold uppercase tracking-wider">History</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="group aspect-square bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg"
                title="Settings"
              >
                <span className="text-2xl group-hover:scale-110 group-hover:rotate-90 transition-all">⚙️</span>
                <span className="text-[7px] text-white/50 font-bold uppercase tracking-wider">Settings</span>
              </button>

              {/* Guide */}
              <button
                onClick={() => setShowHowToPlay(true)}
                className="group aspect-square bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg"
                title="How to Play"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📖</span>
                <span className="text-[7px] text-white/50 font-bold uppercase tracking-wider">Guide</span>
              </button>
            </div>

            {/* Secondary Icons - 4 Column Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Tournaments */}
              <button
                onClick={showTournament}
                className="group aspect-square bg-gradient-to-br from-yellow-900/30 to-yellow-600/30 backdrop-blur-md rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                title="Tournaments"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
                <span className="text-[6px] text-yellow-400/70 font-bold uppercase tracking-wider">Tourney</span>
              </button>

              {/* Friends */}
              <button
                onClick={showFriends}
                className="group aspect-square bg-gradient-to-br from-blue-900/30 to-cyan-600/30 backdrop-blur-md rounded-xl border border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                title="Friends"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
                <span className="text-[6px] text-blue-400/70 font-bold uppercase tracking-wider">Friends</span>
              </button>

              {/* Analytics */}
              <button
                onClick={showAnalytics}
                className="group aspect-square bg-gradient-to-br from-purple-900/30 to-pink-600/30 backdrop-blur-md rounded-xl border border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                title="Analytics"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📈</span>
                <span className="text-[6px] text-purple-400/70 font-bold uppercase tracking-wider">Stats</span>
              </button>

              {/* Season */}
              <button
                onClick={showSeason}
                className="group aspect-square bg-gradient-to-br from-indigo-900/30 to-indigo-600/30 backdrop-blur-md rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                title="Season"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🎪</span>
                <span className="text-[6px] text-indigo-400/70 font-bold uppercase tracking-wider">Season</span>
              </button>
            </div>

            {/* Compact Multiplayer Toggle */}
            <div className="mt-2">
              <MultiplayerToggle />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 w-full flex flex-col items-center">
          <div className="flex gap-12 sm:gap-16 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-[#ff6b00] text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-80">Last Attempt</div>
              <div className="text-white text-lg sm:text-xl font-black tabular-nums">{lastWave ? getNightName(lastWave) : '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-[#3a86ff] text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-80">High Score</div>
              <div className="text-white text-lg sm:text-xl font-black tabular-nums">{bestScore.toLocaleString()}</div>
            </div>
          </div>
          <div className="opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_20px_rgba(255,107,0,0.5)] pb-4 sm:pb-6">
            <DeeJayLabsLogo className="scale-[1.2] sm:scale-[1.6]" />
          </div>
        </div>
      </div>

      {showHowToPlay && <HowToPlay onBack={() => setShowHowToPlay(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* PROFILE SETTINGS MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-3xl w-full max-w-sm animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 text-center">Survivor Profile</h2>

            <div className="flex justify-center mb-6 relative group">
              <div className="w-24 h-24 rounded-full bg-orange-600 border-4 border-[#222] flex items-center justify-center text-5xl shadow-2xl relative overflow-hidden">
                {userProfile.avatar.startsWith('data:') ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  editAvatar
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-bold text-white uppercase">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const size = 128; // Max size
                            canvas.width = size;
                            canvas.height = size;
                            if (ctx) {
                              const scale = Math.max(size / img.width, size / img.height);
                              const x = (size / 2) - (img.width / 2) * scale;
                              const y = (size / 2) - (img.height / 2) * scale;
                              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                              setEditAvatar(canvas.toDataURL('image/jpeg', 0.8));
                            }
                          };
                          img.src = ev.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {avatarOptions.map(emoji => (
                <button key={emoji} onClick={() => setEditAvatar(emoji)} className={`h-10 rounded-lg text-xl flex items-center justify-center ${editAvatar === emoji ? 'bg-orange-600' : 'bg-white/5 hover:bg-white/10'}`}>
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="ENTER NAME"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold text-center mb-3 focus:outline-none focus:border-orange-500 uppercase tracking-widest placeholder:text-white/20"
            />
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              placeholder="LINK EMAIL (OPTIONAL)"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white/70 font-bold text-center mb-6 focus:outline-none focus:border-[#3a86ff] text-xs uppercase tracking-widest placeholder:text-white/20"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowProfile(false)} className="flex-1 bg-white/5 py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-white/10">Back</button>
              <button onClick={() => { updateUserProfile({ name: editName, email: editEmail, avatar: editAvatar }); setShowProfile(false); }} className="flex-1 bg-orange-600 py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-orange-500">Save Profile</button>
            </div>

            <div className="mt-6 flex justify-center opacity-50">
              <DeeJayLabsLogo className="scale-75" />
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD & CHAT MODAL */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-5xl h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">

            {/* LEFT: LEADERBOARD */}
            <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#111]">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-900/10 to-transparent">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Global Elite</h2>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Top Survivors • Season 1</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 ${idx === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-transparent border-white/5'}`}>
                    <div className="flex-shrink-0 w-6 text-center font-black text-white/30 text-xs">#{idx + 1}</div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl relative">
                      {entry.avatar}
                      {idx < 3 && <div className="absolute -top-1 -right-1 text-xs">👑</div>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-white font-black uppercase text-xs truncate">{entry.name}</div>
                      <div className="text-white/40 text-[9px] uppercase tracking-wider">{entry.wave}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#3a86ff] font-black text-[10px] sm:text-xs tabular-nums">{entry.score.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/5 flex justify-center opacity-40">
                <DeeJayLabsLogo className="scale-75" />
              </div>
            </div>

            {/* RIGHT: GLOBAL CHAT */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setShowLeaderboard(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">✕</button>
              </div>

              <div className="p-6 border-b border-white/5 bg-gradient-to-l from-blue-900/10 to-transparent">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Comms
                </h2>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Request Supplies & Chat</div>
              </div>

              <ChatPanel />

            </div>
          </div>
        </div>
      )}

      {showArena && <ArenaHub onBack={() => setShowArena(false)} />}
      {showHistory && <BattleHistory onBack={() => setShowHistory(false)} />}
    </div>
  );
};

export default MainMenu;
