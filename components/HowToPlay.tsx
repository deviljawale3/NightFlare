import React from 'react';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl z-[60] pointer-events-auto">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl">
        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-6 text-center">
          HOW TO <span className="text-orange-500">PLAY</span>
        </h2>

        <button
          onClick={onBack}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-600 text-white/50 hover:text-white transition-all z-50 border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
          aria-label="Close"
        >
          <span className="text-xl font-bold">✕</span>
        </button>

        <div className="space-y-6 text-white/80 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Movement
            </h3>
            <ul className="text-sm space-y-2 list-none ml-2">
              <li className="flex gap-2">
                <span className="text-lg">🕹️</span>
                <span className="text-xs">
                  <strong className="text-white block">Two Modes (Check Settings):</strong>
                  1. <span className="text-white font-bold">Fixed Joystick</span>: Classic bottom-left control.<br />
                  2. <span className="text-white font-bold">Direct Touch</span>: Touch ANYWHERE on the left side to move.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Combat & Skills
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-red-500 text-[10px] mb-1 italic uppercase">⚔️ Attack</div>
                <p className="text-[9px]">Tap to strike nearby enemies or resources.</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-yellow-400 text-[10px] mb-1 italic uppercase">⚡ Charged Hit</div>
                <p className="text-[9px]">Check upgrades to unlock powerful charge attacks.</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-cyan-400 text-[10px] mb-1 italic uppercase">🛡️ Shield</div>
                <p className="text-[9px]">Unlock shield to block incoming damage.</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-purple-400 text-[10px] mb-1 italic uppercase">🌀 Nova</div>
                <p className="text-[9px]">Charge your Nova meter to unleash a screen-wipe blast.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 p-4 rounded-xl border border-orange-500/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">🔥 The Nightflare</h3>
              <p className="text-[10px] sm:text-xs leading-relaxed text-orange-200">
                Your primary goal is to protect the central fire. If its health reaches zero, your run ends.
                <br /><br />
                <strong className="text-white">Tip:</strong> Stoke the fire with <span className="text-yellow-400">Light Shards</span> to heal it!
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Phases
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20 text-4xl group-hover:scale-110 transition-transform">☀️</div>
                <div className="font-bold text-yellow-400 text-xs mb-1 italic relative z-10">DAY PHASE</div>
                <p className="text-[10px] leading-relaxed text-white/70 relative z-10">Safe to explore. Gather Wood, Stone, and Food. Build structures and upgrade gear.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20 text-4xl group-hover:scale-110 transition-transform">🌙</div>
                <div className="font-bold text-purple-400 text-xs mb-1 italic relative z-10">NIGHT PHASE</div>
                <p className="text-[10px] leading-relaxed text-white/70 relative z-10">Enemies spawn endlessly. Defend yourself and the Nightflare at all costs.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Survival Tips
            </h3>
            <ul className="text-[10px] sm:text-xs space-y-2 list-disc list-inside ml-2 text-white/70">
              <li>Keep an eye on your <span className="text-red-400 font-bold">Health</span>. Eat Food to recover.</li>
              <li>You have <span className="text-red-500 font-bold">3 Lives</span> (Energy Cores) that regenerate over time.</li>
              <li>Build <span className="text-blue-300 font-bold">Towers</span> & <span className="text-amber-600 font-bold">Walls</span> to create defenses.</li>
              <li>Claim <span className="text-green-400 font-bold">Daily Rewards</span> to get free resources!</li>
            </ul>
          </section>
        </div>

        <button
          onClick={onBack}
          className="mt-10 w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          BACK TO MENU
        </button>

        <div className="mt-8 flex justify-center opacity-70">
          <DeeJayLabsLogo />
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
