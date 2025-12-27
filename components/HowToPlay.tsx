
import React from 'react';

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
        
        <div className="space-y-6 text-white/80">
          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Controls
            </h3>
            <ul className="text-sm space-y-1 list-disc list-inside ml-2">
              <li>Use the <span className="text-white font-bold">Joystick</span> (bottom left) to move.</li>
              <li>Tap <span className="text-red-500 font-bold italic">⚔️ Attack</span> to harvest and fight.</li>
              <li>Tap <span className="text-cyan-400 font-bold italic">🌀 Light-Burst</span> for area defense.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Phases
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="font-bold text-yellow-400 text-xs mb-1 italic">☀️ DAY</div>
                <p className="text-[10px] leading-relaxed">Gather Wood, Stone, Food, and Light Shards from the environment.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="font-bold text-purple-400 text-xs mb-1 italic">🌙 NIGHT</div>
                <p className="text-[10px] leading-relaxed">Defend the Nightflare from shadow enemies. If the fire dies, the run ends.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Crafting
            </h3>
            <p className="text-xs leading-relaxed ml-4">
              Tap the <span className="text-white font-bold italic">🛠️ Workbench</span> during the day to upgrade weapons, armor, or stoke the central fire.
            </p>
          </section>
        </div>

        <button 
          onClick={onBack}
          className="mt-10 w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;
