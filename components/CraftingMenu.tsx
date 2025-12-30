
import React, { useState } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface CraftingMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CraftingMenu: React.FC<CraftingMenuProps> = ({ isOpen, onClose }) => {
  const { resources, consumeResource, upgradePlayer, healNightflare, addStructure, buyPermanentUpgrade, playerStats } = useGameStore();
  const [tab, setTab] = useState<'FORGE' | 'SKILLS' | 'DEFENSE'>('FORGE');

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
      id: 'repair',
      name: 'STOKE FIRE',
      description: 'Heals the Nightflare core (+45HP)',
      cost: { wood: 12, stone: 0, lightShards: 4 },
      action: () => healNightflare(45)
    },
    {
      id: 'titan_armor',
      name: 'TITAN ARMOR',
      description: 'Reduces all damage by 50% (Legendary)',
      cost: { wood: 50, stone: 100, lightShards: 50, titanCores: 2 },
      action: () => upgradePlayer({ hasArmor: true })
    },
    {
      id: 'void_blade',
      name: 'VOID BLADE',
      description: 'Unlocks the Void Blade (Requires 5 Cores)',
      cost: { wood: 0, stone: 0, lightShards: 200, titanCores: 5 },
      action: () => {
        upgradePlayer({ attackDamage: 150 });
        (window as any).soundEffects?.play('legendary_unlock');
      }
    }
  ];

  const defenseRecipes = [
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
      description: 'Standard Light Turret',
      cost: { wood: 6, stone: 6, lightShards: 12 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('PYLON', playerPos ? [playerPos.x, 0, playerPos.z] : [-6, 0, -6]);
      }
    },
    {
      id: 'sentry',
      name: 'SENTRY TURRET',
      description: 'Rapid-fire Machine Gun Turret',
      cost: { wood: 20, stone: 15, lightShards: 5 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('SENTRY_TURRET', playerPos ? [playerPos.x, 0, playerPos.z] : [0, 0, 0]);
      }
    },
    {
      id: 'prism',
      name: 'PRISM TOWER',
      description: 'Chaining Laser Defense',
      cost: { wood: 10, stone: 30, lightShards: 25 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('PRISM_TOWER', playerPos ? [playerPos.x, 0, playerPos.z] : [0, 0, 0]);
      }
    },
    {
      id: 'stasis',
      name: 'STASIS TRAP',
      description: 'Slows enemies by 80%',
      cost: { wood: 5, stone: 10, lightShards: 5 },
      action: () => {
        const playerPos = (window as any).playerPos;
        addStructure('STASIS_TRAP', playerPos ? [playerPos.x, 0, playerPos.z] : [0, 0, 0]);
      }
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
              <button onClick={() => setTab('DEFENSE')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all ${tab === 'DEFENSE' ? 'bg-orange-600 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}>Defense</button>
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
        <div className="flex-1 overflow-y-auto px-1 scrollbar-hide">
          {tab === 'FORGE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              {recipes.map(recipe => (
                // Recipe Item rendering logic... reusing UI for brevity but normally would extract
                <div key={recipe.id} className="relative group p-4 md:p-6 rounded-[2rem] bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer" onClick={() => handleCraft(recipe)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white italic tracking-tighter">{recipe.name}</h3>
                    {canCraft(recipe.cost) ? <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">READY</span> : <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LOCKED</span>}
                  </div>
                  <p className="text-white/40 text-xs mb-4 max-w-[80%]">{recipe.description}</p>
                  <div className="flex gap-3 mt-auto">
                    {Object.entries(recipe.cost).map(([res, amount]) => (
                      <div key={res} className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${resources[res as keyof typeof resources] >= (amount as number) ? 'bg-white/10 text-white/70' : 'bg-red-500/20 text-red-500'}`}>{res}: {amount as any}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'DEFENSE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              {defenseRecipes.map(recipe => (
                <div key={recipe.id} className="relative group p-4 md:p-6 rounded-[2rem] bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => handleCraft(recipe)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white italic tracking-tighter">{recipe.name}</h3>
                    {canCraft(recipe.cost) ? <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">READY</span> : <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LOCKED</span>}
                  </div>
                  <p className="text-white/40 text-xs mb-4 max-w-[80%]">{recipe.description}</p>
                  <div className="flex gap-3 mt-auto">
                    {Object.entries(recipe.cost).map(([res, amount]) => (
                      <div key={res} className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${resources[res as keyof typeof resources] >= (amount as number) ? 'bg-white/10 text-white/70' : 'bg-red-500/20 text-red-500'}`}>{res}: {amount as any}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'SKILLS' && (
            <div className="space-y-4">
              {skillTree.map(skill => {
                const level = (playerStats.upgradeLevels as any)[skill.id];
                const cost = (level + 1) * 20;
                const canAfford = resources.lightShards >= cost;
                return (
                  <div key={skill.id} className="relative group p-6 rounded-[2.5rem] bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer flex items-center gap-6" onClick={() => { if (canAfford) { buyPermanentUpgrade(skill.id as any); if ('vibrate' in navigator) navigator.vibrate(60); } }}>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner">{skill.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white italic tracking-tighter">{skill.name}</h3>
                      <p className="text-white/40 text-sm">{skill.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Current Level</div>
                      <div className="text-4xl font-black text-white/20 group-hover:text-white transition-colors">
                        {playerStats.upgradeLevels[skill.id as keyof typeof playerStats.upgradeLevels] || 0}
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => buyPermanentUpgrade(skill.id as any)}
                      className={`absolute bottom-4 right-4 py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${canAfford ? 'bg-orange-600 text-white hover:scale-[1.02]' : 'bg-white/5 text-white/20 opacity-30 cursor-not-allowed'}`}
                    >
                      {canAfford ? `UPGRADE (${cost} ✨)` : `NEED ${cost} ✨`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Protocol */}
          <div className="mt-4 md:mt-8 flex justify-center opacity-30 text-center">
            <p className="text-[7px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.2em] md:tracking-[0.5em] italic px-4">DeeJay Labs Secure Protocol v4.5 • Permanent upgrades persist until game reset</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingMenu;
