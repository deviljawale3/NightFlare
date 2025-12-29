import { create } from 'zustand';
import { GameState, TimeOfDay, IslandTheme, NightEvent, GameSettings, EnemyClass } from './types';
import {
  createTournamentBracket,
  advanceTournamentRound,
  calculateWinRate,
  calculatePeakTime,
  createNewSeason,
  checkSeasonEnd,
  mockWebSocketConnection
} from './phase3Logic';

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
  giftItem: (targetId: string, itemType: 'LIFE' | 'WOOD' | 'STONE' | 'SHARD', amount?: number) => boolean;
  giftLife: (targetId: string, fromChat?: boolean) => boolean;
  upgradeWeapon: (weapon: import('./types').WeaponType) => void;
  equipWeapon: (weapon: import('./types').WeaponType) => void;
  cycleWeapon: () => void;
  lives: number;
  lastLifeRegen: number;
  useLife: () => boolean;
  checkLifeRegen: () => void;
  // Challenge Mode
  challengeState?: import('./types').ChallengeState;
  startChallenge: (opponentId: string, wager: number, mode?: import('./types').ChallengeMode) => void;
  updateChallenge: () => void;
  endChallenge: (victory: boolean) => void;
  // Phase 2: Battle History & Stats
  battleHistory: import('./types').BattleRecord[];
  arenaStats: import('./types').ArenaStats;
  addBattleRecord: (record: import('./types').BattleRecord) => void;
  updateArenaStats: (result: 'VICTORY' | 'DEFEAT' | 'DRAW', winnings: number) => void;
  calculateRank: () => import('./types').PlayerRank;
  // Phase 3: Tournament System
  tournaments: import('./types').Tournament[];
  activeTournament?: import('./types').Tournament;
  createTournament: (name: string, entryFee: number, maxPlayers: number) => void;
  joinTournament: (tournamentId: string) => boolean;
  advanceTournament: (tournamentId: string) => void;
  // Phase 3: Friend System
  friends: import('./types').Friend[];
  friendRequests: import('./types').FriendRequest[];
  directChallenges: import('./types').DirectChallenge[];
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  sendFriendRequest: (targetId: string, targetName: string, targetAvatar: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  sendDirectChallenge: (friendId: string, wager: number, mode: import('./types').ChallengeMode) => void;
  acceptDirectChallenge: (challengeId: string) => void;
  // Phase 3: Seasonal System
  currentSeason?: import('./types').Season;
  seasonHistory: import('./types').Season[];
  initializeSeason: () => void;
  endSeason: () => void;
  claimSeasonRewards: () => void;
  // Phase 3: Analytics
  analytics: import('./types').PlayerAnalytics;
  updateAnalytics: () => void;
  // Phase 3: Multiplayer
  multiplayerState: import('./types').MultiplayerState;
  toggleMultiplayer: (enabled: boolean) => void;
  connectToServer: () => Promise<void>;
  disconnectFromServer: () => void;
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
    speed: 3.5,
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

  // Phase 2: Battle History & Stats
  battleHistory: (() => {
    const stored = localStorage.getItem('nightflare_battle_history');
    return stored ? JSON.parse(stored) : [];
  })(),

  arenaStats: (() => {
    const stored = localStorage.getItem('nightflare_arena_stats');
    return stored ? JSON.parse(stored) : {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalWagered: 0,
      totalWinnings: 0,
      netProfit: 0,
      winStreak: 0,
      bestStreak: 0,
      rank: 'BRONZE' as import('./types').PlayerRank,
      rankPoints: 0,
      titles: []
    };
  })(),

  // Phase 3: Tournaments
  tournaments: (() => {
    const stored = localStorage.getItem('nightflare_tournaments');
    return stored ? JSON.parse(stored) : [];
  })(),

  // Phase 3: Friends
  friends: (() => {
    const stored = localStorage.getItem('nightflare_friends');
    return stored ? JSON.parse(stored) : [];
  })(),

  friendRequests: (() => {
    const stored = localStorage.getItem('nightflare_friend_requests');
    return stored ? JSON.parse(stored) : [];
  })(),

  directChallenges: (() => {
    const stored = localStorage.getItem('nightflare_direct_challenges');
    return stored ? JSON.parse(stored) : [];
  })(),

  // Phase 3: Seasons
  currentSeason: (() => {
    const stored = localStorage.getItem('nightflare_current_season');
    if (stored) return JSON.parse(stored);
    return createNewSeason(1);
  })(),

  seasonHistory: (() => {
    const stored = localStorage.getItem('nightflare_season_history');
    return stored ? JSON.parse(stored) : [];
  })(),

  // Phase 3: Analytics
  analytics: (() => {
    const stored = localStorage.getItem('nightflare_analytics');
    return stored ? JSON.parse(stored) : {
      winRateByMode: { SCORE_RUSH: 0, SUDDEN_DEATH: 0 },
      averageScore: 0,
      averageDuration: 0,
      bestOpponent: '',
      worstOpponent: '',
      peakPerformanceTime: 'Unknown',
      recentForm: [],
      scoreHistory: [],
      rankHistory: []
    };
  })(),

  // Phase 3: Multiplayer
  multiplayerState: {
    enabled: false,
    connectionStatus: 'DISCONNECTED' as const,
    opponentConnected: false
  },

  checkLifeRegen: () => {
    const { lives, lastLifeRegen } = get();
    if (lives >= 3) return;

    // 12 minutes = 720000 ms
    const LIFE_REGEN_MS = 720000;
    const now = Date.now();
    const elapsed = now - lastLifeRegen;

    if (elapsed >= LIFE_REGEN_MS) {
      const livesToGain = Math.floor(elapsed / LIFE_REGEN_MS);
      const newLives = Math.min(3, lives + livesToGain);

      const remainder = elapsed % LIFE_REGEN_MS;
      // If full, reset timer to now, else keep the progress
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
      // If we dropped below max, and weren't already regenerating, start timer
      // Actually strictly: if we were at max, we start timer now.
      if (lives === 3) {
        const now = Date.now();
        set({ lastLifeRegen: now });
        localStorage.setItem('nightflare_life_regen', now.toString());
      }
      return true;
    }
    return false;
  },

  giftItem: (targetId: string, itemType: 'LIFE' | 'WOOD' | 'STONE' | 'SHARD', amount: number = 1) => {
    const { userProfile, addChatMessage, resources, consumeResource, lives } = get();

    // Check cost
    if (itemType === 'LIFE') {
      if (lives < 1) return false;
      // consume life? Usually gifting life costs a life or a specialized item. 
      // Let's assume it costs 500 shards to buy a gift life, or costs user's life.
      // User request says "allow user to gift inventory". 
      // Let's assume it costs shards to send a life gift.
      if (resources.lightShards < 100) return false;
      consumeResource('lightShards', 100);
    } else if (itemType === 'WOOD') {
      if (!consumeResource('wood', amount)) return false;
    } else if (itemType === 'STONE') {
      if (!consumeResource('stone', amount)) return false;
    }

    addChatMessage({
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '🎁',
      content: `${userProfile.name} gifted ${amount} ${itemType} to ${targetId}!`,
      type: 'SYSTEM',
      timestamp: Date.now()
    });
    return true;
  },

  giftLife: (targetId, fromChat = false) => {
    // Legacy wrapper
    return get().giftItem(targetId, 'LIFE', 1);
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

  cycleWeapon: () => set((state) => {
    const weapons: ('STAFF' | 'SWORD' | 'BOW')[] = ['STAFF', 'SWORD'];
    // Only allow switching to SWORD if leveled up
    if (state.playerStats.weaponLevels.SWORD <= 0) return state;

    const currentIndex = weapons.indexOf(state.playerStats.currentWeapon);
    const nextIndex = (currentIndex + 1) % weapons.length;
    return {
      playerStats: { ...state.playerStats, currentWeapon: weapons[nextIndex] }
    };
  }),

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
  }),

  // CHALLENGE LOGIC
  startChallenge: (opponentId, wager, mode = 'SCORE_RUSH') => {
    const { resources, leaderboard, consumeResource } = get();
    // 1. Check Funds
    if (resources.lightShards < wager) {
      alert("Insufficient Light Shards for this wager!");
      return;
    }

    // 2. Find opponent details (Mock logic)
    const opponent = leaderboard.find(l => l.id === opponentId) || { id: opponentId, name: 'Unknown', avatar: '💀', score: 0 };

    if (consumeResource('lightShards', wager)) {
      const duration = mode === 'SCORE_RUSH' ? 180 : 0; // 3 min for Score Rush, unlimited for Sudden Death

      set({
        challengeState: {
          isActive: true,
          mode,
          opponent: {
            id: opponent.id,
            name: opponent.name,
            avatar: opponent.avatar,
            score: 0,
            health: 100,
            difficultyMultiplier: 1.0 + (Math.random() * 0.5) // Random skill level 1.0 - 1.5x
          },
          wager,
          startTime: Date.now(),
          duration,
        },
        // Start Game Immediately
        gameState: GameState.PLAYING,
        score: 0,
        levelTimer: duration,
        wave: 5, // Start at higher intensity
        timeOfDay: TimeOfDay.NIGHT
      });
    }
  },

  updateChallenge: () => set((state) => {
    if (!state.challengeState || !state.challengeState.isActive) return {};

    const now = Date.now();
    const elapsed = (now - state.challengeState.startTime) / 1000;

    // Check Time Limit (Score Rush only)
    if (state.challengeState.mode === 'SCORE_RUSH' && elapsed >= state.challengeState.duration) {
      get().endChallenge(state.score > state.challengeState.opponent.score);
      return { gameState: GameState.GAME_OVER };
    }

    // Simulate Opponent Score
    const currentOppScore = state.challengeState.opponent.score;
    const pointsGain = (Math.random() * 50) * state.challengeState.opponent.difficultyMultiplier;

    // Occasional big kill
    const bigKill = Math.random() < 0.05 ? 500 : 0;

    // Simulate opponent health loss in Sudden Death
    let oppHealth = state.challengeState.opponent.health;
    if (state.challengeState.mode === 'SUDDEN_DEATH') {
      // Opponent takes damage randomly
      if (Math.random() < 0.02) { // 2% chance per second
        oppHealth = Math.max(0, oppHealth - (Math.random() * 15));
        if (oppHealth <= 0) {
          get().endChallenge(true); // Player wins if opponent dies
          return { gameState: GameState.GAME_OVER };
        }
      }
    }

    return {
      challengeState: {
        ...state.challengeState,
        opponent: {
          ...state.challengeState.opponent,
          score: currentOppScore + pointsGain + bigKill,
          health: oppHealth
        }
      }
    };
  }),

  endChallenge: (victory) => {
    const { challengeState, addResource, addBattleRecord, updateArenaStats } = get();
    if (!challengeState) return;

    const now = Date.now();
    const battleDuration = Math.floor((now - challengeState.startTime) / 1000);

    if (victory) {
      const totalPot = challengeState.wager * 2;
      const tax = totalPot * 0.10; // 10% House Cut
      const winnings = totalPot - tax;
      const netProfit = winnings - challengeState.wager;

      addResource('lightShards', winnings);

      // Record battle
      addBattleRecord({
        id: now.toString(),
        date: now,
        mode: challengeState.mode,
        opponentName: challengeState.opponent.name,
        opponentAvatar: challengeState.opponent.avatar,
        playerScore: get().score,
        opponentScore: Math.floor(challengeState.opponent.score),
        wager: challengeState.wager,
        result: 'VICTORY',
        winnings: netProfit,
        duration: battleDuration
      });

      updateArenaStats('VICTORY', netProfit);

      alert(`🏆 VICTORY!\n\nTotal Pot: ${totalPot}\nHouse Tax (10%): -${tax}\nNet Profit: +${netProfit} Shards`);

      set((state) => ({
        challengeState: { ...state.challengeState!, isActive: false, result: 'VICTORY' }
      }));
    } else {
      const netLoss = -challengeState.wager;

      // Record battle
      addBattleRecord({
        id: now.toString(),
        date: now,
        mode: challengeState.mode,
        opponentName: challengeState.opponent.name,
        opponentAvatar: challengeState.opponent.avatar,
        playerScore: get().score,
        opponentScore: Math.floor(challengeState.opponent.score),
        wager: challengeState.wager,
        result: 'DEFEAT',
        winnings: netLoss,
        duration: battleDuration
      });

      updateArenaStats('DEFEAT', netLoss);

      alert(`💀 DEFEAT\n\n${challengeState.opponent.name} scored higher.\nYou lost ${challengeState.wager} Shards.`);

      set((state) => ({
        challengeState: { ...state.challengeState!, isActive: false, result: 'DEFEAT' }
      }));
    }
  },

  // PHASE 2 METHODS
  addBattleRecord: (record) => set((state) => {
    const newHistory = [record, ...state.battleHistory].slice(0, 50); // Keep last 50
    localStorage.setItem('nightflare_battle_history', JSON.stringify(newHistory));
    return { battleHistory: newHistory };
  }),

  updateArenaStats: (result, winnings) => set((state) => {
    const stats = { ...state.arenaStats };

    stats.totalBattles++;
    if (result === 'VICTORY') {
      stats.wins++;
      stats.winStreak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak);
    } else if (result === 'DEFEAT') {
      stats.losses++;
      stats.winStreak = 0;
    } else {
      stats.draws++;
    }

    stats.totalWinnings += Math.max(0, winnings);
    stats.totalWagered += Math.abs(winnings);
    stats.netProfit += winnings;

    // Update rank points (ELO-style)
    const pointChange = result === 'VICTORY' ? 25 : (result === 'DEFEAT' ? -15 : 0);
    stats.rankPoints = Math.max(0, stats.rankPoints + pointChange);

    // Calculate new rank
    stats.rank = get().calculateRank();

    // Award titles
    if (stats.wins >= 10 && !stats.titles.includes('Veteran')) stats.titles.push('Veteran');
    if (stats.bestStreak >= 5 && !stats.titles.includes('Unstoppable')) stats.titles.push('Unstoppable');
    if (stats.netProfit >= 10000 && !stats.titles.includes('High Roller')) stats.titles.push('High Roller');
    if (stats.wins >= 50 && !stats.titles.includes('Champion')) stats.titles.push('Champion');

    localStorage.setItem('nightflare_arena_stats', JSON.stringify(stats));
    return { arenaStats: stats };
  }),

  calculateRank: () => {
    const { arenaStats } = get();
    const points = arenaStats.rankPoints;

    if (points >= 1000) return 'LEGEND';
    if (points >= 750) return 'DIAMOND';
    if (points >= 500) return 'PLATINUM';
    if (points >= 250) return 'GOLD';
    if (points >= 100) return 'SILVER';
    return 'BRONZE';
  },

  // PHASE 3 METHODS
  createTournament: (name, entryFee, maxPlayers) => set((state) => {
    const newTournament: import('./types').Tournament = {
      id: `tournament-${Date.now()}`,
      name,
      status: 'UPCOMING',
      entryFee,
      prizePool: 0,
      maxPlayers,
      currentPlayers: 0,
      startTime: Date.now() + 300000,
      bracket: [],
      participants: [],
      rewards: [
        { placement: 1, shards: entryFee * maxPlayers * 0.5, title: `${name} Champion` },
        { placement: 2, shards: entryFee * maxPlayers * 0.3 },
        { placement: 3, shards: entryFee * maxPlayers * 0.2 }
      ]
    };
    const newTournaments = [...state.tournaments, newTournament];
    localStorage.setItem('nightflare_tournaments', JSON.stringify(newTournaments));
    return { tournaments: newTournaments };
  }),

  joinTournament: (tournamentId) => {
    const { tournaments, resources, consumeResource, userProfile } = get();
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament || tournament.currentPlayers >= tournament.maxPlayers || resources.lightShards < tournament.entryFee) return false;
    if (consumeResource('lightShards', tournament.entryFee)) {
      const participant: import('./types').TournamentParticipant = {
        id: 'player',
        name: userProfile.name,
        avatar: userProfile.avatar,
        seed: tournament.currentPlayers + 1,
        eliminated: false
      };
      const updatedTournament = {
        ...tournament,
        currentPlayers: tournament.currentPlayers + 1,
        prizePool: tournament.prizePool + tournament.entryFee,
        participants: [...tournament.participants, participant]
      };
      if (updatedTournament.currentPlayers === updatedTournament.maxPlayers) {
        updatedTournament.status = 'ACTIVE';
        updatedTournament.bracket = createTournamentBracket(updatedTournament.participants);
      }
      set((state) => {
        const newTournaments = state.tournaments.map(t => t.id === tournamentId ? updatedTournament : t);
        localStorage.setItem('nightflare_tournaments', JSON.stringify(newTournaments));
        return { tournaments: newTournaments };
      });
      return true;
    }
    return false;
  },

  advanceTournament: (tournamentId) => set((state) => {
    const tournament = state.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return {};
    const advanced = advanceTournamentRound(tournament);
    const newTournaments = state.tournaments.map(t => t.id === tournamentId ? advanced : t);
    localStorage.setItem('nightflare_tournaments', JSON.stringify(newTournaments));
    return { tournaments: newTournaments };
  }),

  addFriend: (friendId) => set((state) => {
    const newFriend: import('./types').Friend = {
      id: friendId,
      name: `Player ${friendId.slice(0, 4)}`,
      avatar: '🎮',
      status: Math.random() > 0.5 ? 'ONLINE' : 'OFFLINE',
      rank: 'SILVER',
      lastSeen: Date.now(),
      wins: Math.floor(Math.random() * 50),
      losses: Math.floor(Math.random() * 30)
    };
    const newFriends = [...state.friends, newFriend];
    localStorage.setItem('nightflare_friends', JSON.stringify(newFriends));
    return { friends: newFriends };
  }),

  removeFriend: (friendId) => set((state) => {
    const newFriends = state.friends.filter(f => f.id !== friendId);
    localStorage.setItem('nightflare_friends', JSON.stringify(newFriends));
    return { friends: newFriends };
  }),

  sendFriendRequest: (targetId, targetName, targetAvatar) => set((state) => {
    const request: import('./types').FriendRequest = {
      id: `req-${Date.now()}`,
      fromId: 'player',
      fromName: state.userProfile.name,
      fromAvatar: state.userProfile.avatar,
      timestamp: Date.now(),
      status: 'PENDING'
    };
    const newRequests = [...state.friendRequests, request];
    localStorage.setItem('nightflare_friend_requests', JSON.stringify(newRequests));
    return { friendRequests: newRequests };
  }),

  acceptFriendRequest: (requestId) => {
    const { friendRequests, addFriend } = get();
    const request = friendRequests.find(r => r.id === requestId);
    if (request && request.status === 'PENDING') {
      addFriend(request.fromId);
      set((state) => {
        const newRequests = state.friendRequests.map(r => r.id === requestId ? { ...r, status: 'ACCEPTED' as const } : r);
        localStorage.setItem('nightflare_friend_requests', JSON.stringify(newRequests));
        return { friendRequests: newRequests };
      });
    }
  },

  sendDirectChallenge: (friendId, wager, mode) => set((state) => {
    const friend = state.friends.find(f => f.id === friendId);
    if (!friend) return {};
    const challenge: import('./types').DirectChallenge = {
      id: `challenge-${Date.now()}`,
      fromId: 'player',
      fromName: state.userProfile.name,
      fromAvatar: state.userProfile.avatar,
      toId: friendId,
      toName: friend.name,
      wager,
      mode,
      timestamp: Date.now(),
      status: 'PENDING',
      expiresAt: Date.now() + 300000
    };
    const newChallenges = [...state.directChallenges, challenge];
    localStorage.setItem('nightflare_direct_challenges', JSON.stringify(newChallenges));
    return { directChallenges: newChallenges };
  }),

  acceptDirectChallenge: (challengeId) => {
    const { directChallenges, startChallenge } = get();
    const challenge = directChallenges.find(c => c.id === challengeId);
    if (challenge && challenge.status === 'PENDING') {
      startChallenge(challenge.fromId, challenge.wager, challenge.mode);
      set((state) => {
        const newChallenges = state.directChallenges.map(c => c.id === challengeId ? { ...c, status: 'ACCEPTED' as const } : c);
        localStorage.setItem('nightflare_direct_challenges', JSON.stringify(newChallenges));
        return { directChallenges: newChallenges };
      });
    }
  },

  initializeSeason: () => {
    const { currentSeason, seasonHistory } = get();
    if (currentSeason && checkSeasonEnd(currentSeason)) {
      get().endSeason();
    }
    const newSeasonNumber = seasonHistory.length + 1;
    const newSeason = createNewSeason(newSeasonNumber);
    set({ currentSeason: newSeason });
    localStorage.setItem('nightflare_current_season', JSON.stringify(newSeason));
  },

  endSeason: () => {
    const { currentSeason } = get();
    if (!currentSeason) return;
    const endedSeason = { ...currentSeason, status: 'ENDED' as const, endDate: Date.now() };
    set((state) => {
      const newHistory = [...state.seasonHistory, endedSeason];
      localStorage.setItem('nightflare_season_history', JSON.stringify(newHistory));
      return { seasonHistory: newHistory, currentSeason: undefined };
    });
    setTimeout(() => get().initializeSeason(), 1000);
  },

  claimSeasonRewards: () => {
    const { currentSeason, arenaStats, addResource } = get();
    if (!currentSeason || currentSeason.status !== 'ENDED') return;
    const reward = currentSeason.rewards.find(r => r.rankThreshold === arenaStats.rank);
    if (reward) {
      addResource('lightShards', reward.shards);
      if (reward.title && !arenaStats.titles.includes(reward.title)) {
        set((state) => ({
          arenaStats: { ...state.arenaStats, titles: [...state.arenaStats.titles, reward.title!] }
        }));
      }
      alert(`Season Rewards Claimed!\n+${reward.shards} Light Shards\n${reward.title ? `Title: ${reward.title}` : ''}`);
    }
  },

  updateAnalytics: () => set((state) => {
    const { battleHistory, arenaStats } = state;
    if (battleHistory.length === 0) return {};
    const scoreRushBattles = battleHistory.filter(b => b.mode === 'SCORE_RUSH');
    const suddenDeathBattles = battleHistory.filter(b => b.mode === 'SUDDEN_DEATH');
    const scoreRushWins = scoreRushBattles.filter(b => b.result === 'VICTORY').length;
    const suddenDeathWins = suddenDeathBattles.filter(b => b.result === 'VICTORY').length;
    const winRateByMode = {
      SCORE_RUSH: calculateWinRate(scoreRushWins, scoreRushBattles.length),
      SUDDEN_DEATH: calculateWinRate(suddenDeathWins, suddenDeathBattles.length)
    };
    const totalScore = battleHistory.reduce((sum, b) => sum + b.playerScore, 0);
    const totalDuration = battleHistory.reduce((sum, b) => sum + b.duration, 0);
    const averageScore = Math.floor(totalScore / battleHistory.length);
    const averageDuration = Math.floor(totalDuration / battleHistory.length);
    const opponentStats = new Map<string, { wins: number; total: number }>();
    battleHistory.forEach(b => {
      const current = opponentStats.get(b.opponentName) || { wins: 0, total: 0 };
      opponentStats.set(b.opponentName, { wins: current.wins + (b.result === 'VICTORY' ? 1 : 0), total: current.total + 1 });
    });
    let bestOpponent = '', worstOpponent = '';
    let bestWinRate = 0, worstWinRate = 1;
    opponentStats.forEach((stats, name) => {
      const winRate = stats.wins / stats.total;
      if (winRate > bestWinRate) { bestWinRate = winRate; bestOpponent = name; }
      if (winRate < worstWinRate) { worstWinRate = winRate; worstOpponent = name; }
    });
    const recentForm = battleHistory.slice(0, 10).map(b => b.result === 'VICTORY' ? 'W' as const : b.result === 'DEFEAT' ? 'L' as const : 'D' as const);
    const scoreHistory = battleHistory.slice(0, 20).reverse().map(b => ({ date: b.date, score: b.playerScore }));
    const rankHistory = [{ date: Date.now() - 7 * 24 * 60 * 60 * 1000, rank: 'BRONZE' as const, points: 0 }, { date: Date.now(), rank: arenaStats.rank, points: arenaStats.rankPoints }];
    const newAnalytics = { winRateByMode, averageScore, averageDuration, bestOpponent, worstOpponent, peakPerformanceTime: calculatePeakTime(battleHistory), recentForm, scoreHistory, rankHistory };
    localStorage.setItem('nightflare_analytics', JSON.stringify(newAnalytics));
    return { analytics: newAnalytics };
  }),

  toggleMultiplayer: (enabled) => set((state) => ({ multiplayerState: { ...state.multiplayerState, enabled } })),

  connectToServer: async () => {
    set((state) => ({ multiplayerState: { ...state.multiplayerState, connectionStatus: 'CONNECTING' } }));
    try {
      await mockWebSocketConnection();
      set((state) => ({ multiplayerState: { ...state.multiplayerState, connectionStatus: 'CONNECTED', playerId: `player-${Date.now()}` } }));
      alert('Connected to multiplayer server!');
    } catch (error) {
      set((state) => ({ multiplayerState: { ...state.multiplayerState, connectionStatus: 'ERROR' } }));
      alert('Failed to connect to server. Please try again.');
    }
  },

  disconnectFromServer: () => set((state) => ({ multiplayerState: { enabled: state.multiplayerState.enabled, connectionStatus: 'DISCONNECTED', opponentConnected: false } })),
}));
