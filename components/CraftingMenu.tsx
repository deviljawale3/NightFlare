
import React, { useState } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface CraftingMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CraftingMenu: React.FC<CraftingMenuProps> = ({ isOpen, onClose }) => {
  const { resources, consumeResource, upgradePlayer, healNightflare, addStructure, buyPermanentUpgrade, playerStats } = useGameStore();
  const [tab, setTab] = useState<'FORGE' | 'SKILLS'>('FORGE');

  if (!isOpen) return null;

  const recipes = [
    {
      id: 'spear',
      name: 'LIGHT SPEAR',
      description: 'Massive damage for close combat',
      cost: { wood: 10, stone: 6, lightShards: 2 },
      action: () => upgradePlayer({ attackDamage: 85, hasSpear: true })
    },
    {
      id: 'wall',
      name: 'EMBER WALL',
      description: 'Physical barrier to block shadow paths',
      cost: { wood: 12, stone: 18, lightShards: 0 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('WALL', playerPos ? [playerPos.x, 0, playerPos.z] : [6, 0, 6]);
      }
    },
    {
      id: 'pylon',
      name: 'LIGHT PYLON',
      description: 'Homing turret that targets nearest shadow',
      cost: { wood: 6, stone: 6, lightShards: 12 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('PYLON', playerPos ? [playerPos.x, 0, playerPos.z] : [-6, 0, -6]);
      }
    },
    {
      id: 'repair',
      name: 'STOKE FIRE',
      description: 'Heals the Nightflare core (+45HP)',
      cost: { wood: 12, stone: 0, lightShards: 4 },
      action: () => healNightflare(45)
    }
  ];

  const canCraft = (cost: any) =>
    Object.entries(cost).every(([res, amount]) => resources[res as keyof typeof resources] >= (amount as number));

  const handleCraft = (recipe: any) => {
    if (canCraft(recipe.cost)) {
      Object.entries(recipe.cost).forEach(([res, amount]) => consumeResource(res as any, amount as number));
      recipe.action();
      if ('vibrate' in navigator) navigator.vibrate(60);
    }
  };

  const skillTree = [
    { id: 'strength', name: 'STRENGTH', desc: 'Increase base attack damage (+15)', icon: '⚔️' },
    { id: 'agility', name: 'AGILITY', desc: 'Increase movement speed (+1)', icon: '🏃' },
    { id: 'vitality', name: 'VITALITY', desc: 'Increase max health (+50)', icon: '❤️' }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-[100] pointer-events-auto p-3 sm:p-4 md:p-8" onClick={onClose}>
      <div className="bg-[#050505] border-2 border-white/5 p-5 md:p-14 rounded-[1.5rem] md:rounded-[3.5rem] max-w-5xl w-full h-full max-h-[80vh] md:max-h-[85vh] md:h-auto shadow-[0_0_200px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header Branding */}
        <div className="flex justify-between items-start mb-4 md:mb-10 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              {tab === 'FORGE' ? 'TECHNIC FORGE' : 'SKILL ASCENSION'}
            </h2>
            <div className="flex gap-2 md:gap-6 mt-3 md:mt-6">
              <button onClick={() => setTab('FORGE')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all ${tab === 'FORGE' ? 'bg-orange-600 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}>Forging</button>
              <button onClick={() => setTab('SKILLS')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all ${tab === 'SKILLS' ? 'bg-orange-600 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}>Upgrades</button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 md:gap-6">
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:bg-red-600 hover:text-white transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
              aria-label="Close"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <div className="hidden md:block">
              <DeeJayLabsLogo className="scale-125 origin-right" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 overflow-y-auto pr-2 custom-scrollbar pb-6 flex-1">
          {tab === 'FORGE' ? (
            recipes.map(recipe => (
              <div key={recipe.id} className="bg-[#0b0b0b] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-all hover:bg-[#0e0e0e]">
                <div>
                  <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tighter mb-2 group-hover:text-orange-500 transition-colors">{recipe.name}</h3>
                  <p className="text-[10px] md:text-[12px] text-white/40 font-semibold leading-relaxed mb-4 md:mb-8">{recipe.description}</p>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-10">
                    {Object.entries(recipe.cost).map(([res, amount]) => (amount as number) > 0 && (
                      <div key={res} className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[9px] md:text-[11px] font-black uppercase flex items-center gap-1.5 md:gap-2 border ${resources[res as keyof typeof resources] >= (amount as number) ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        <span>{amount} {res.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!canCraft(recipe.cost)}
                  onClick={() => handleCraft(recipe)}
                  className={`w-full py-4 md:py-6 rounded-2xl font-black text-[11px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all shadow-2xl ${canCraft(recipe.cost) ? 'bg-[#151515] text-white/40 border border-white/5 hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95' : 'bg-white/5 text-white/5 cursor-not-allowed opacity-30'}`}
                >
                  ASSEMBLE
                </button>
              </div>
            ))
          ) : (
            skillTree.map(skill => {
              const level = (playerStats.upgradeLevels as any)[skill.id];
              const cost = (level + 1) * 20;
              const canAfford = resources.lightShards >= cost;
              return (
                <div key={skill.id} className="bg-[#0b0b0b] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tighter">{skill.name}</h3>
                      <span className="text-xl md:text-2xl">{skill.icon}</span>
                    </div>
                    <p className="text-[10px] md:text-[12px] text-white/40 font-semibold leading-relaxed mb-4 md:mb-6">{skill.desc}</p>
                    <div className="bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 mb-6 md:mb-8">
                      <div className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Current Mastery</div>
                      <div className="text-white font-black text-base md:text-lg">LEVEL {level}</div>
                    </div>
                  </div>
                  <button
                    disabled={!canAfford}
                    onClick={() => buyPermanentUpgrade(skill.id as any)}
                    className={`w-full py-4 md:py-6 rounded-2xl font-black text-[11px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all ${canAfford ? 'bg-orange-600 text-white hover:scale-[1.02]' : 'bg-white/5 text-white/20 opacity-30 cursor-not-allowed'}`}
                  >
                    {canAfford ? `UPGRADE (${cost} ✨)` : `NEED ${cost} ✨`}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Protocol */}
        <div className="mt-4 md:mt-8 flex justify-center opacity-30 text-center">
          <p className="text-[7px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.2em] md:tracking-[0.5em] italic px-4">DeeJay Labs Secure Protocol v4.5 • Permanent upgrades persist until game reset</p>
        </div>
      </div>
    </div>
  );
};

export default CraftingMenu;
