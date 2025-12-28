
import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

const InventoryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { resources, playerStats, score, wave } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[70] pointer-events-auto p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Inventory</h2>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Current Session Data</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:bg-red-600 hover:text-white transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
              aria-label="Close"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <DeeJayLabsLogo className="mt-1 scale-90 origin-right" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 overflow-y-auto max-h-[50vh] pr-2">
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest border-b border-orange-500/20 pb-2">Stored Resources</h3>
            <div className="space-y-4">
              <ResourceItem label="Lumber" value={resources.wood} icon="🪵" color="text-amber-500" />
              <ResourceItem label="Granite" value={resources.stone} icon="🪨" color="text-slate-400" />
              <ResourceItem label="Star Shards" value={resources.lightShards} icon="✨" color="text-cyan-400" />
              <ResourceItem label="Food" value={resources.food} icon="🍎" color="text-red-500" />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-2">Survivor Metrics</h3>
            <div className="space-y-3 text-white/70">
              <StatItem label="Health" value={`${playerStats.currentHealth}/${playerStats.maxHealth}`} />
              <StatItem label="Damage" value={playerStats.attackDamage} />
              <StatItem label="Agility" value={playerStats.speed} />
              <StatItem label="Armor" value={playerStats.hasArmor ? "Reinforced" : "Basic"} />
              <StatItem label="Weapon" value={playerStats.hasSpear ? "Light Spear" : "Basic Staff"} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-6">
            <div>
              <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Active Wave</div>
              <div className="text-white font-bold text-lg">{wave}</div>
            </div>
            <div className="border-l border-white/10 pl-6">
              <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Current Score</div>
              <div className="text-white font-bold text-lg">{score.toLocaleString()}</div>
            </div>
          </div>
          <button
            className="px-8 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-black text-xs uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            onClick={onClose}
          >
            Return to Action
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourceItem: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold text-white/70 uppercase tracking-tight">{label}</span>
    </div>
    <span className={`text-lg font-black ${color}`}>{value}</span>
  </div>
);

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
    <span className="text-[10px] opacity-40 uppercase font-black tracking-widest">{label}</span>
    <span className="font-bold text-white text-xs">{value}</span>
  </div>
);

export default InventoryPanel;
