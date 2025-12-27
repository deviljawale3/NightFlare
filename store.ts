
import { create } from 'zustand';
import { GameState, TimeOfDay, Resources, PlayerStats, ResourceNode, Structure, EnemyClass, IslandTheme, NightEvent } from './types';

interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface GameStore {
  gameState: GameState;
  timeOfDay: TimeOfDay;
  level: number;
  levelTimer: number; // Seconds remaining in current level
  wave: number;
  lastWave: number;
  bestNight: number;
  resources: Resources;
  playerStats: PlayerStats;
  nightflareHealth: number;
  maxNightflareHealth: number;
  score: number;
  bestScore: number;
  kills: number;
  tutorialStep: number;
  screenShake: number;
  nodes: ResourceNode[];
  structures: Structure[];
  isPlayerGrounded: boolean;
  settings: GameSettings;
  islandTheme: IslandTheme;
  currentNightEvent: NightEvent;

  setGameState: (state: GameState) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setNodes: (nodes: ResourceNode[]) => void;
  addStructure: (type: 'WALL' | 'PYLON', pos: [number, number, number]) => void;
  damageStructure: (id: string, amount: number) => void;
  removeNode: (id: string) => void;
  addResource: (type: keyof Resources, amount: number, pos?: [number, number, number]) => void;
  consumeResource: (type: keyof Resources, amount: number) => boolean;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  damageNightflare: (amount: number) => void;
  healNightflare: (amount: number) => void;
  triggerNova: () => void;
  nextWave: () => void;
  nextLevel: () => void;
  decrementTimer: () => void;
  resetGame: (isNew?: boolean) => void;
  upgradePlayer: (upgrade: Partial<PlayerStats>) => void;
  buyPermanentUpgrade: (stat: 'strength' | 'agility' | 'vitality') => boolean;
  addScore: (points: number) => void;
  recordEnemyKill: (type: EnemyClass) => void;
  triggerScreenShake: (intensity: number) => void;
  completeTutorialStep: () => void;
  saveGame: () => void;
  loadGame: () => void;
  getNightName: (index: number) => string;
  setPlayerGrounded: (grounded: boolean) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

const STORAGE_KEY = 'nightflare_save_v7';
const SETTINGS_KEY = 'nightflare_settings';

const loadSettings = (): GameSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return { soundEnabled: true, vibrationEnabled: true };
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: GameState.MAIN_MENU,
  timeOfDay: TimeOfDay.DAY,
  level: 1,
  levelTimer: 300,
  wave: 1,
  lastWave: Number(localStorage.getItem('nightflare_last_wave')) || 0,
  bestNight: Number(localStorage.getItem('nightflare_best_night')) || 1,
  resources: { wood: 0, stone: 0, lightShards: 0, food: 0 },
  playerStats: {
    maxHealth: 100,
    currentHealth: 100,
    attackDamage: 25,
    attackRange: 2.5,
    speed: 7,
    hasArmor: false,
    hasSpear: false,
    novaCharge: 0,
    upgradeLevels: { strength: 0, agility: 0, vitality: 0 },
    unlockedAbilities: { shield: false, chargedAttack: false }
  },
  nightflareHealth: 100,
  maxNightflareHealth: 100,
  score: 0,
  bestScore: Number(localStorage.getItem('nightflare_best_score')) || 0,
  kills: 0,
  tutorialStep: 0,
  screenShake: 0,
  nodes: [],
  structures: [],
  isPlayerGrounded: true,
  settings: loadSettings(),
  islandTheme: IslandTheme.FOREST,
  currentNightEvent: NightEvent.NONE,

  setGameState: (state) => {
    const { wave, bestNight, score, bestScore } = get();
    if (state === GameState.GAME_OVER) {
      localStorage.setItem('nightflare_last_wave', wave.toString());
      set({ lastWave: wave });
      if (wave > bestNight) {
        set({ bestNight: wave });
        localStorage.setItem('nightflare_best_night', wave.toString());
      }
      if (score > bestScore) {
        set({ bestScore: score });
        localStorage.setItem('nightflare_best_score', score.toString());
      }
    }
    set({ gameState: state });
  },

  setTimeOfDay: (time) => {
    let event = NightEvent.NONE;
    if (time === TimeOfDay.NIGHT) {
      const { wave } = get();
      if (wave >= 3) {
        const rand = Math.random();
        if (rand < 0.3) event = NightEvent.RUSH;
        else if (rand < 0.5) event = NightEvent.SIEGE;
        else if (rand < 0.65) event = NightEvent.PHANTOM;
      }
    }
    set({ timeOfDay: time, currentNightEvent: event });
  },
  setNodes: (nodes) => set({ nodes }),

  addStructure: (type, pos) => set((state) => ({
    structures: [...state.structures, {
      id: `struct-${Date.now()}`,
      type,
      position: pos,
      health: type === 'WALL' ? 300 : 100,
      maxHealth: type === 'WALL' ? 300 : 100,
    }]
  })),

  damageStructure: (id, amount) => set((state) => ({
    structures: state.structures.map(s => s.id === id ? { ...s, health: s.health - amount } : s).filter(s => s.health > 0)
  })),

  removeNode: (id) => set((state) => ({ nodes: state.nodes.filter(n => n.id !== id) })),

  addResource: (type, amount, pos) => {
    if (pos) {
      window.dispatchEvent(new CustomEvent('resource-collected', { detail: { position: pos, type } }));
    }
    set((state) => {
      let novaBoost = 0;
      if (type === 'lightShards') novaBoost = amount * 4;
      const gatheringPoints = 25 * state.level;
      return {
        resources: { ...state.resources, [type]: state.resources[type] + amount },
        score: state.score + gatheringPoints,
        playerStats: { ...state.playerStats, novaCharge: Math.min(100, state.playerStats.novaCharge + novaBoost) }
      };
    });
  },

  consumeResource: (type, amount) => {
    const { resources } = get();
    if (resources[type] >= amount) {
      set({ resources: { ...resources, [type]: resources[type] - amount } });
      return true;
    }
    return false;
  },

  damagePlayer: (amount) => {
    get().triggerScreenShake(0.5);
    window.dispatchEvent(new CustomEvent('player-damaged'));
    const { settings } = get();
    if (settings.vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(50);

    set((state) => {
      const newHealth = Math.max(0, state.playerStats.currentHealth - amount);
      if (newHealth <= 0) return { gameState: GameState.GAME_OVER, playerStats: { ...state.playerStats, currentHealth: 0 } };
      return { playerStats: { ...state.playerStats, currentHealth: newHealth } };
    });
  },

  healPlayer: (amount) => set((state) => ({
    playerStats: { ...state.playerStats, currentHealth: Math.min(state.playerStats.maxHealth, state.playerStats.currentHealth + amount) }
  })),

  damageNightflare: (amount) => {
    if (amount > 0.1) {
      get().triggerScreenShake(0.5);
      const { settings } = get();
      if (settings.vibrationEnabled && 'vibrate' in navigator) navigator.vibrate([30, 30, 30]);
    }
    set((state) => {
      const newHealth = Math.max(0, state.nightflareHealth - amount);
      if (newHealth <= 0) return { gameState: GameState.GAME_OVER, nightflareHealth: 0 };
      return { nightflareHealth: newHealth };
    });
  },

  healNightflare: (amount) => set((state) => ({
    nightflareHealth: Math.min(state.maxNightflareHealth, state.nightflareHealth + amount)
  })),

  triggerNova: () => {
    const { playerStats, settings } = get();
    if (playerStats.novaCharge >= 100) {
      get().triggerScreenShake(1.5);
      if (settings.vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(200);
      window.dispatchEvent(new CustomEvent('nightflare-nova'));
      set({ playerStats: { ...playerStats, novaCharge: 0 } });
    }
  },

  nextWave: () => set((state) => {
    const nextW = state.wave + 1;
    return {
      wave: nextW,
      score: state.score + 2500
    };
  }),

  decrementTimer: () => set((state) => {
    if (state.levelTimer <= 0) return {};
    const nextTimer = state.levelTimer - 1;
    if (nextTimer <= 0) {
      return { levelTimer: 0, gameState: GameState.LEVEL_CLEAR };
    }
    return { levelTimer: nextTimer };
  }),

  nextLevel: () => set((state) => {
    const nextL = state.level + 1;
    const themes = [IslandTheme.FOREST, IslandTheme.VOLCANO, IslandTheme.ARCTIC];
    return {
      level: nextL,
      levelTimer: 300,
      islandTheme: themes[(nextL - 1) % themes.length],
      gameState: GameState.PLAYING,
      nodes: [],
      structures: [],
      nightflareHealth: 100,
      score: state.score + 10000 // Big level clear bonus
    };
  }),

  recordEnemyKill: (type: EnemyClass) => set((state) => {
    const pointsMap: Record<EnemyClass, number> = {
      STALKER: 150,
      BRUTE: 800,
      WRAITH: 300,
      VOID_WALKER: 5000
    };
    return {
      kills: state.kills + 1,
      score: state.score + (pointsMap[type] * state.level)
    };
  }),

  resetGame: (isNew = true) => {
    set({
      gameState: isNew ? GameState.TUTORIAL : GameState.PLAYING,
      timeOfDay: TimeOfDay.DAY,
      wave: 1,
      level: 1,
      levelTimer: 300,
      islandTheme: IslandTheme.FOREST,
      resources: { wood: 0, stone: 0, lightShards: 0, food: 0 },
      playerStats: {
        maxHealth: 100,
        currentHealth: 100,
        attackDamage: 25,
        attackRange: 2.5,
        speed: 7,
        hasArmor: false,
        hasSpear: false,
        novaCharge: 0,
        upgradeLevels: { strength: 0, agility: 0, vitality: 0 },
        unlockedAbilities: { shield: false, chargedAttack: false }
      },
      nightflareHealth: 100,
      score: 0,
      kills: 0,
      tutorialStep: isNew ? 0 : 999,
      nodes: [],
      structures: [],
    });
  },

  upgradePlayer: (upgrade) => set((state) => ({
    playerStats: { ...state.playerStats, ...upgrade }
  })),

  buyPermanentUpgrade: (stat) => {
    const { playerStats, resources, consumeResource } = get();
    const currentLevel = playerStats.upgradeLevels[stat];
    const cost = (currentLevel + 1) * 20;
    if (resources.lightShards >= cost) {
      consumeResource('lightShards', cost);
      const newLevels = { ...playerStats.upgradeLevels, [stat]: currentLevel + 1 };

      let newStats = { ...playerStats, upgradeLevels: newLevels };
      if (stat === 'strength') newStats.attackDamage += 15;
      if (stat === 'agility') newStats.speed += 1;
      if (stat === 'vitality') {
        newStats.maxHealth += 50;
        newStats.currentHealth += 50;
      }

      set({ playerStats: newStats });
      return true;
    }
    return false;
  },

  addScore: (points) => set((state) => ({ score: state.score + points })),

  triggerScreenShake: (intensity) => {
    set({ screenShake: intensity });
    setTimeout(() => set({ screenShake: 0 }), 200);
  },

  completeTutorialStep: () => {
    const next = get().tutorialStep + 1;
    set({ tutorialStep: next });
    if (next >= 4) set({ gameState: GameState.PLAYING });
  },

  saveGame: () => {
    const data = {
      resources: get().resources,
      playerStats: get().playerStats,
      wave: get().wave,
      level: get().level,
      score: get().score,
      kills: get().kills,
      nightflareHealth: get().nightflareHealth,
      tutorialStep: get().tutorialStep,
      structures: get().structures
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadGame: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        set({ ...data, gameState: GameState.PLAYING });
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  },

  getNightName: (index: number) => {
    const prefixes = ["Pale", "Cold", "Blood", "Silent", "Void", "Crimson", "Dark", "Shattered", "Eternal", "Feral"];
    const suffixes = ["Moon", "Wind", "Ember", "Shadow", "Scream", "Eclipse", "Tide", "Walker", "Storm", "Night"];
    const fixed: Record<number, string> = {
      1: "Pale Moon", 2: "Cold Wind", 3: "Blood Ember",
      4: "Silent Shadow", 5: "Void Scream", 10: "Final Eclipse"
    };
    if (fixed[index]) return fixed[index];
    const pIndex = (index * 7) % prefixes.length;
    const sIndex = (index * 3) % suffixes.length;
    return `${prefixes[pIndex]} ${suffixes[sIndex]} ${index}`;
  },

  setPlayerGrounded: (grounded: boolean) => set({ isPlayerGrounded: grounded }),

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return { settings: updated };
  })
}));
