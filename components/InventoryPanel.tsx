
import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

const InventoryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { resources, playerStats, score, wave } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[70] pointer-events-auto p-4 animate-in fade-in duration-300 safe-padding" onClick={onClose}>
      <div
        className="bg-black/80 backdrop-blur-2xl border border-white/10 p-5 md:p-8 rounded-[2rem] w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Gradient decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Inventory</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Tactical Storage</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/5"
            aria-label="Close"
          >
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10 space-y-8">

          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Resources collected</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResourceItem label="Lumber" value={resources.wood} icon="🪵" color="text-amber-500" />
              <ResourceItem label="Granite" value={resources.stone} icon="🪨" color="text-slate-400" />
              <ResourceItem label="Shards" value={resources.lightShards} icon="✨" color="text-cyan-400" />
              <ResourceItem label="Rations" value={resources.food} icon="🍎" color="text-red-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Survivor Status</h3>
            <div className="bg-white/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <StatItem label="Health Condition" value={`${Math.ceil(playerStats.currentHealth)}%`} color="text-green-400" />
              <StatItem label="Attack Power" value={playerStats.attackDamage} />
              <StatItem label="Movement Spd" value={playerStats.speed.toFixed(1)} />
              <StatItem label="Armor Class" value={playerStats.hasArmor ? "Heavy" : "None"} />
              <StatItem label="Equipped" value={playerStats.currentWeapon} color="text-orange-400" />
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center shrink-0 relative z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Session Score</span>
            <span className="text-xl font-black text-white tabular-nums tracking-tight">{score.toLocaleString()}</span>
          </div>

          <DeeJayLabsLogo className="scale-75 opacity-50" />
        </div>
      </div>
    </div>
  );
};

const ResourceItem: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
    <span className="text-2xl mb-1">{icon}</span>
    <span className={`text-xl font-black ${color} leading-none`}>{value}</span>
    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-1">{label}</span>
  </div>
);

const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center border-b border-white/5 last:border-0 py-1.5 px-1">
    <span className="text-[10px] opacity-50 uppercase font-bold tracking-wider">{label}</span>
    <span className={`font-bold text-xs ${color}`}>{value}</span>
  </div>
);

export default InventoryPanel;
