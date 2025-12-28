import { create } from 'zustand';
import { GameState, TimeOfDay, IslandTheme, NightEvent, GameSettings, EnemyClass } from './types';

interface GameStore {
  gameState: GameState;
  timeOfDay: TimeOfDay;
  level: number;
  levelTimer: number;
  wave: number;
  lastWave: number;
  bestNight: number;
  resources: import('./types').Resources;
  playerStats: import('./types').PlayerStats;
  nightflareHealth: number;
  maxNightflareHealth: number;
  score: number;
  bestScore: number;
  kills: number;
  tutorialStep: number;
  screenShake: number;
  nodes: import('./types').ResourceNode[];
  structures: import('./types').Structure[];
  isPlayerGrounded: boolean;
  settings: GameSettings;
  islandTheme: IslandTheme;
  currentNightEvent: NightEvent;

  setGameState: (state: GameState) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setNodes: (nodes: import('./types').ResourceNode[]) => void;
  addStructure: (type: 'WALL' | 'PYLON', pos: [number, number, number]) => void;
  damageStructure: (id: string, amount: number) => void;
  removeNode: (id: string) => void;
  addResource: (type: keyof import('./types').Resources, amount: number, pos?: [number, number, number]) => void;
  consumeResource: (type: keyof import('./types').Resources, amount: number) => boolean;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  damageNightflare: (amount: number) => void;
  healNightflare: (amount: number) => void;
  triggerNova: () => void;
  nextWave: () => void;
  decrementTimer: () => void;
  nextLevel: () => void;
  recordEnemyKill: (type: import('./types').EnemyClass) => void;
  resetGame: (isNew?: boolean) => void;
  upgradePlayer: (upgrade: Partial<import('./types').PlayerStats>) => void;
  buyPermanentUpgrade: (stat: 'strength' | 'agility' | 'vitality') => boolean;
  addScore: (points: number) => void;
  triggerScreenShake: (intensity: number) => void;
  completeTutorialStep: () => void;
  saveGame: () => void;
  loadGame: () => void;
  getNightName: (index: number) => string;
  setPlayerGrounded: (grounded: boolean) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  userProfile: import('./types').UserProfile;
  updateUserProfile: (profile: Partial<import('./types').UserProfile>) => void;
  leaderboard: import('./types').LeaderboardEntry[];
  addToLeaderboard: (entry: import('./types').LeaderboardEntry) => void;
  chatMessages: import('./types').ChatMessage[];
  addChatMessage: (msg: Partial<import('./types').ChatMessage>) => void;
  grantRequest: (msgId: string) => void;
  giftLife: (targetId: string, fromChat?: boolean) => boolean;
  upgradeWeapon: (weapon: import('./types').WeaponType) => void;
  equipWeapon: (weapon: import('./types').WeaponType) => void;
  lives: number;
  lastLifeRegen: number;
  useLife: () => boolean;
  checkLifeRegen: () => void;
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
    unlockedAbilities: { shield: false, chargedAttack: false },
    weaponLevels: { STAFF: 1, SWORD: 0, BOW: 0 },
    currentWeapon: 'STAFF'
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
  chatMessages: [],

  lives: Number(localStorage.getItem('nightflare_lives')) || 3,
  lastLifeRegen: Number(localStorage.getItem('nightflare_life_regen')) || Date.now(),

  checkLifeRegen: () => {
    const { lives, lastLifeRegen } = get();
    if (lives >= 3) return;

    // 10 minutes = 600000 ms
    const LIFE_REGEN_MS = 600000;
    const now = Date.now();
    const elapsed = now - lastLifeRegen;

    if (elapsed >= LIFE_REGEN_MS) {
      const livesToGain = Math.floor(elapsed / LIFE_REGEN_MS);
      const newLives = Math.min(3, lives + livesToGain);

      const remainder = elapsed % LIFE_REGEN_MS;
      const newRegenTime = newLives === 3 ? now : now - remainder;

      set({ lives: newLives, lastLifeRegen: newRegenTime });
      localStorage.setItem('nightflare_lives', newLives.toString());
      localStorage.setItem('nightflare_life_regen', newRegenTime.toString());
    }
  },

  useLife: () => {
    const { lives } = get();
    get().checkLifeRegen(); // Sync first
    if (lives > 0) {
      const newLives = lives - 1;
      set({ lives: newLives });
      localStorage.setItem('nightflare_lives', newLives.toString());
      if (lives === 3) {
        const now = Date.now();
        set({ lastLifeRegen: now });
        localStorage.setItem('nightflare_life_regen', now.toString());
      }
      return true;
    }
    return false;
  },

  giftLife: (targetId, fromChat = false) => {
    const { userProfile, addChatMessage } = get();
    console.log(`Sending life to ${targetId}`);

    if (fromChat) {
      addChatMessage({
        senderId: 'system',
        senderName: 'System',
        content: `${userProfile.name} gifted a Life directly to ${targetId}!`,
        type: 'SYSTEM',
        timestamp: Date.now()
      });
    }
    return true; // Sent successfully
  },

  addChatMessage: (msg) => set((state) => {
    const { userProfile } = state;
    const newMsg: import('./types').ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: userProfile.name === msg.senderName ? 'player' : 'other', // logic simplification
      senderName: msg.senderName || userProfile.name,
      senderAvatar: msg.senderAvatar || userProfile.avatar,
      content: msg.content || '',
      timestamp: Date.now(),
      type: msg.type || 'CHAT',
      requestStatus: msg.type?.startsWith('REQUEST') ? 'PENDING' : undefined,
      weaponType: msg.weaponType,
      targetId: msg.senderId
    };
    return { chatMessages: [...state.chatMessages, newMsg].slice(-50) }; // Keep last 50
  }),

  grantRequest: (msgId) => set((state) => {
    const { chatMessages, userProfile } = state;
    const msgIndex = chatMessages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return {};

    const msg = chatMessages[msgIndex];
    if (msg.requestStatus !== 'PENDING') return {};

    // Logic to actually give item could go here (subtract resource from granter?)
    // For now, just mark granted.

    const newMsgs = [...chatMessages];
    newMsgs[msgIndex] = { ...msg, requestStatus: 'GRANTED' };

    // Add system notification
    const systemMsg: import('./types').ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'system',
      senderName: 'Nightflare',
      senderAvatar: '🔥',
      content: `${userProfile.name} granted ${msg.senderName}'s request!`,
      timestamp: Date.now(),
      type: 'SYSTEM'
    };

    return { chatMessages: [...newMsgs, systemMsg].slice(-50) };
  }),

  upgradeWeapon: (weapon) => {
    const { playerStats, bestScore, resources, consumeResource } = get();
    const currentLvl = playerStats.weaponLevels[weapon];
    const cost = (currentLvl + 1) * 25;

    // Unlock Checks based on Score Points
    if (weapon === 'SWORD' && bestScore < 5000) return;
    if (weapon === 'BOW' && bestScore < 15000) return;

    if (resources.lightShards >= cost) {
      consumeResource('lightShards', cost);
      set({
        playerStats: {
          ...playerStats,
          weaponLevels: {
            ...playerStats.weaponLevels,
            [weapon]: currentLvl + 1
          },
          attackDamage: playerStats.attackDamage + (weapon === 'SWORD' ? 30 : 15)
        }
      });
    }
  },

  equipWeapon: (weapon) => set(state => ({
    playerStats: { ...state.playerStats, currentWeapon: weapon }
  })),

  setGameState: (state) => {
    const { wave, bestNight, score, bestScore } = get();
    if (state === GameState.GAME_OVER) {
      localStorage.setItem('nightflare_last_wave', wave.toString());
      set({ lastWave: wave });

      const { userProfile, addToLeaderboard, getNightName } = get();
      if (score > 0) {
        addToLeaderboard({
          id: Date.now().toString(),
          name: userProfile.name,
          score: score,
          wave: getNightName(wave),
          date: new Date().toLocaleDateString(),
          avatar: userProfile.avatar
        });
      }

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
    if (isNew) {
      const canPlay = get().useLife();
      if (!canPlay) {
        alert("No Energy Cores (Lives) remaining! Wait for recharge.");
        return;
      }
    }
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
        unlockedAbilities: { shield: false, chargedAttack: false },
        weaponLevels: { STAFF: 1, SWORD: 0, BOW: 0 },
        currentWeapon: 'STAFF'
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
  }),

  userProfile: (() => {
    const stored = localStorage.getItem('nightflare_user_profile');
    return stored ? JSON.parse(stored) : { name: 'Survivor', email: '', avatar: '🤠' };
  })(),

  leaderboard: (() => {
    const stored = localStorage.getItem('nightflare_leaderboard');
    return stored ? JSON.parse(stored) : [
      { id: '1', name: 'Alpha', score: 25000, wave: 'Night 10', date: '2025-01-01', avatar: '🦁' },
      { id: '2', name: 'Beta', score: 12000, wave: 'Night 5', date: '2025-01-02', avatar: '🦊' },
      { id: '3', name: 'Gamma', score: 5000, wave: 'Night 3', date: '2025-01-03', avatar: '🦉' }
    ];
  })(),

  updateUserProfile: (profile) => set((state) => {
    const updated = { ...state.userProfile, ...profile };
    localStorage.setItem('nightflare_user_profile', JSON.stringify(updated));
    return { userProfile: updated };
  }),

  addToLeaderboard: (entry) => set((state) => {
    const newBoard = [...state.leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem('nightflare_leaderboard', JSON.stringify(newBoard));
    return { leaderboard: newBoard };
  })
}));
