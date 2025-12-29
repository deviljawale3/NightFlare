import React from 'react';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-[160] pointer-events-auto p-4 sm:p-0">
      <div className="max-w-md w-full p-6 sm:p-8 bg-slate-900 border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter mb-4 sm:mb-6 text-center">
          HOW TO <span className="text-orange-500">PLAY</span>
        </h2>

        <button
          onClick={onBack}
          className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-600 text-white transition-all z-50 border border-white/10 shadow-lg active:scale-90"
          aria-label="Close"
        >
          <span className="text-lg font-bold">✕</span>
        </button>

        <div className="space-y-4 sm:space-y-6 text-white/80 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">

          <section>
            <h3 className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Movement
            </h3>
            <div className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-2xl">🕹️</span>
              <span className="text-[10px] sm:text-xs leading-relaxed">
                <strong className="text-white block mb-1">Two Control Modes:</strong>
                1. <span className="text-white font-bold">Joystick</span> (Classic bottom-left)<br />
                2. <span className="text-white font-bold">Direct Touch</span> (Left side movement)
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Combat
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-red-500 text-[10px] mb-1 uppercase">⚔️ Strike</div>
                <p className="text-[9px]">Tap to attack enemies or nodes.</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-yellow-500 text-[10px] mb-1 uppercase">⚡ Charged</div>
                <p className="text-[9px]">Check upgrades for power hits.</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-cyan-400 text-[10px] mb-1 uppercase">🛡️ Shield</div>
                <p className="text-[9px]">Block incoming damage (Unlockable).</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="font-bold text-purple-400 text-[10px] mb-1 uppercase">🌀 Nova</div>
                <p className="text-[9px]">Screen-wipe blast when fully charged.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 p-3 sm:p-4 rounded-xl border border-orange-500/20">
              <h3 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest mb-1">🔥 Protect the Fire</h3>
              <p className="text-[10px] sm:text-xs leading-relaxed text-orange-200">
                Guard the central Nightflare. Use <span className="text-yellow-400 font-bold">Light Shards</span> to heal it. If it dies, the run ends.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="font-bold text-yellow-400 text-[10px] sm:text-xs mb-1 italic">☀️ DAY PHASE</div>
              <p className="text-[10px] leading-relaxed text-white/70">Gather resources and build defenses.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="font-bold text-purple-400 text-[10px] sm:text-xs mb-1 italic">🌙 NIGHT PHASE</div>
              <p className="text-[10px] leading-relaxed text-white/70">Defend against endless shadow waves.</p>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Quick Tips
            </h3>
            <ul className="text-[10px] sm:text-xs space-y-1 list-none ml-1 text-white/70">
              <li className="flex gap-2">✅ <span className="flex-1">Eat <span className="text-red-400 font-bold">Food</span> to recover health.</span></li>
              <li className="flex gap-2">✅ <span className="flex-1">Build <span className="text-blue-300 font-bold">Structures</span> early.</span></li>
            </ul>
          </section>
        </div>

        <button
          onClick={onBack}
          className="mt-6 sm:mt-8 w-full bg-white text-slate-950 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl active:scale-95 transition-all shadow-xl"
        >
          GOT IT
        </button>

        <div className="mt-6 flex justify-center opacity-50 scale-75">
          <DeeJayLabsLogo />
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
