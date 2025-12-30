import { create } from 'zustand';
import { GameState, TimeOfDay, IslandTheme, NightEvent, GameSettings, EnemyClass, WeatherType, HeroClass } from './types';
import {
  createTournamentBracket,
  advanceTournamentRound,
  calculateWinRate,
  calculatePeakTime,
  createNewSeason,
  checkSeasonEnd,
  mockWebSocketConnection
} from './phase3Logic';
import useAchievementStore from './components/AchievementSystem';

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
  isTransitioning: boolean;
  setTransitioning: (val: boolean) => void;

  setGameState: (state: GameState) => void;

  // UI Notifications
  notification: { visible: boolean; text: string; subtext?: string; type: 'night' | 'wave' | 'unlock' | 'day' } | null;
  showNotification: (text: string, subtext?: string, type?: 'night' | 'wave' | 'unlock' | 'day') => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setNodes: (nodes: import('./types').ResourceNode[]) => void;
  addStructure: (type: 'WALL' | 'PYLON' | 'SENTRY_TURRET' | 'PRISM_TOWER' | 'STASIS_TRAP', pos: [number, number, number]) => void;
  damageStructure: (id: string, amount: number) => void;
  removeNode: (id: string) => void;
  addResource: (type: keyof import('./types').Resources, amount: number, pos?: [number, number, number]) => void;
  trackAchievementProgress: (id: string, progress: number) => void;
  consumeResource: (type: keyof import('./types').Resources, amount: number) => boolean;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  damageNightflare: (amount: number) => void;
  healNightflare: (amount: number) => void;
  triggerNova: () => void;
  nextWave: () => void;
  decrementTimer: () => void;
  nextLevel: () => void;
  unlockConstellationNode: (id: string) => boolean;
  convertScoreToStardust: () => void;
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

  // Constellation System (Meta-Progression)
  stardust: number;
  constellation: import('./types').ConstellationNode[];
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
  isTimeSlowed: boolean;
  combo: number;
  lastHitTime: number;
  registerHit: () => void;
  transmute: (type: 'wood' | 'stone', amount: number) => boolean;
  // Titan Protocol
  bossState: {
    active: boolean;
    type: 'OBSIDIAN_GOLEM' | 'VOID_WEAVER' | 'NONE';
    health: number;
    maxHealth: number;
    armorHealth: number;
    maxArmor: number;
    name: string
  };
  damageBoss: (amount: number) => void;
  // Astral Dominion
  isRaidMode: boolean;
  raidTarget?: { name: string; avatar: string; defenseLayout: import('./types').BaseLayout };
  saveDefenseLayout: () => void;
  startRaid: (targetId: string) => void;
  endRaid: (success: boolean) => void;
  applyConstellationBonuses: () => void;
  // Phase 3: Skin System
  ownedSkins: string[];
  activeSkin: string;
  purchaseSkin: (skinId: string, cost: number) => boolean;
  equipSkin: (skinId: string) => void;
  purchaseWeapon: (weaponId: string, cost: number) => boolean;
  // Phase 4: Bestiary
  bestiary: Record<string, { identified: boolean, kills: number }>;
  recordBestiaryDiscovery: (type: string) => void;
  // Phase 5: The Vanguard Update
  setHeroClass: (choice: import('./types').HeroClass) => void;
  updateMissionProgress: (task: 'KILL' | 'COLLECT' | 'SURVIVE' | 'BUILD', amount?: number) => void;
  claimMissionReward: (missionId: string) => void;
  updateTemperature: (delta: number) => void;
  purchaseDrone: (type: import('./types').DroneType, cost: number) => void;
  ghostData: { path: [number, number, number][], time: number }[];
  saveGhostData: () => void;
  // Phase 6: Omni-Update
  addXP: (amount: number) => void;
  triggerUltimate: () => void;
  setWeather: (type: import('./types').WeatherType) => void;
  unlockBlueprint: (itemId: string) => void;
  weather: import('./types').WeatherType;
}

const STORAGE_KEY = 'nightflare_save_v7';
const SETTINGS_KEY = 'nightflare_settings';

const loadSettings = (): GameSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Ensure all fields exist (for backward compatibility)
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      vibrationEnabled: parsed.vibrationEnabled ?? true,
      cameraAngle: parsed.cameraAngle ?? 45,
      cameraDistance: parsed.cameraDistance ?? 25,
      cameraPreset: parsed.cameraPreset ?? 'DEFAULT'
    };
  }
  return {
    soundEnabled: true,
    vibrationEnabled: true,
    cameraAngle: 35,
    cameraDistance: 22,
    cameraPreset: 'ISOMETRIC'
  };
};

export const useGameStore = create<GameStore>((set, get) => {
  const savedStardust = localStorage.getItem('nightflare_stardust');
  const savedConstellation = localStorage.getItem('nightflare_constellation');
  const savedBestNight = localStorage.getItem('nightflare_best_night');
  const savedBestScore = localStorage.getItem('nightflare_best_score');
  const savedOwnedSkins = localStorage.getItem('nightflare_owned_skins');
  const savedActiveSkin = localStorage.getItem('nightflare_active_skin');

  // Default Constellation Tree
  const defaultConstellation: import('./types').ConstellationNode[] = [
    { id: 'vitality_core', name: 'Vitality Core', description: 'Increases Max Health', cost: 100, maxLevel: 5, currentLevel: 0, effectType: 'MAX_HEALTH', effectValue: 10, position: { x: 50, y: 90 }, requiredNodes: [], icon: '❤️' },
    { id: 'swift_step', name: 'Swift Step', description: 'Increases Movement Speed', cost: 150, maxLevel: 3, currentLevel: 0, effectType: 'SPEED', effectValue: 0.05, position: { x: 30, y: 70 }, requiredNodes: ['vitality_core'], icon: '⚡' },
    { id: 'force_strike', name: 'Force Strike', description: 'Increases Attack Damage', cost: 200, maxLevel: 5, currentLevel: 0, effectType: 'DAMAGE', effectValue: 2, position: { x: 70, y: 70 }, requiredNodes: ['vitality_core'], icon: '⚔️' },
    { id: 'shard_magnet', name: 'Shard Magnet', description: 'Start with Light Shards', cost: 300, maxLevel: 3, currentLevel: 0, effectType: 'STARTING_SHARDS', effectValue: 50, position: { x: 50, y: 50 }, requiredNodes: ['swift_step', 'force_strike'], icon: '✨' },
    { id: 'nova_engine', name: 'Nova Engine', description: 'Faster Nova Recharge', cost: 500, maxLevel: 3, currentLevel: 0, effectType: 'NOVA_RECHARGE', effectValue: 0.1, position: { x: 50, y: 30 }, requiredNodes: ['shard_magnet'], icon: '🔥' },
    // Sentinel Protocol Nodes
    { id: 'tech_wing', name: 'Tech Wing', description: 'Unlocks Drone Slot 1', cost: 1000, maxLevel: 1, currentLevel: 0, effectType: 'UNLOCK_DRONE', effectValue: 1, position: { x: 80, y: 40 }, requiredNodes: ['force_strike'], icon: '🛰️' },
    { id: 'vortex_protocol', name: 'Vortex Protocol', description: 'Unlocks Vortex Drone (Collector)', cost: 1500, maxLevel: 1, currentLevel: 0, effectType: 'UNLOCK_DRONE', effectValue: 0, position: { x: 90, y: 30 }, requiredNodes: ['tech_wing'], icon: '🧲' },
    { id: 'orbital_strike', name: 'Orbital Ray', description: 'Unlocks the Orbital Strike ability', cost: 5000, maxLevel: 1, currentLevel: 0, effectType: 'UNLOCK_ORBITAL_STRIKE', effectValue: 1, position: { x: 50, y: 10 }, requiredNodes: ['nova_engine'], icon: '🛰️' },
  ];

  return {
    gameState: GameState.MAIN_MENU,
    timeOfDay: TimeOfDay.DAY,
    level: 1,
    levelTimer: 300,
    wave: 1,
    lastWave: Number(localStorage.getItem('nightflare_last_wave')) || 0,
    bestNight: parseInt(savedBestNight || '1'),
    resources: { wood: 0, stone: 0, lightShards: 0, food: 0, titanCores: 0 },
    playerStats: {
      maxHealth: 100,
      currentHealth: 100,
      attackDamage: 25,
      attackRange: 8.2,
      speed: 3.5,
      hasArmor: false,
      hasSpear: false,
      novaCharge: 0,
      upgradeLevels: { strength: 0, agility: 0, vitality: 0 },
      unlockedAbilities: { shield: false, chargedAttack: false },
      weaponLevels: { STAFF: 1, SWORD: 0, BOW: 0, LIGHTNING_STAFF: 0 },
      activeDrones: [],
      currentWeapon: 'STAFF',
      novaMultiplier: 1.0,
      heroClass: 'NONE',
      titanCredits: 0,
      blueprints: [],
      unlockedStructures: ['WALL', 'PYLON'],
      temperature: 100,
      missions: [
        { id: 'm1', title: 'Alpha Strike', description: 'Eliminate 15 enemies', task: 'KILL', goal: 15, current: 0, reward: 50, type: 'SHARDS', completed: false, claimed: false },
        { id: 'm2', title: 'Scrap Metal', description: 'Find 1 Blueprint', task: 'COLLECT', goal: 1, current: 0, reward: 250, type: 'TITAN_CREDITS', completed: false, claimed: false },
        { id: 'm3', title: 'Sovereign', description: 'Build 5 structures', task: 'BUILD', goal: 5, current: 0, reward: 100, type: 'STARDUST', completed: false, claimed: false }
      ],
      xp: 0,
      level: 1,
      ultimateCharge: 0,
      weatherEffectActive: false
    },
    weather: WeatherType.CLEAR,
    nightflareHealth: 100,
    maxNightflareHealth: 100,
    score: 0,
    bestScore: parseInt(savedBestScore || '0'),
    kills: 0,
    tutorialStep: 0,
    screenShake: 0,
    nodes: [],
    structures: [],
    isPlayerGrounded: true,
    isTransitioning: false,
    ghostData: [],
    setTransitioning: (val) => set({ isTransitioning: val }),
    setPlayerGrounded: (grounded) => set({ isPlayerGrounded: grounded }),
    settings: loadSettings(),
    islandTheme: IslandTheme.FOREST,
    currentNightEvent: NightEvent.NONE,
    isTimeSlowed: false,
    chatMessages: [],
    notification: null,

    showNotification: (text, subtext, type = 'night') => {
      set({ notification: { visible: true, text, subtext, type } });
      setTimeout(() => {
        set(state => (state.notification?.text === text ? { notification: null } : {}));
      }, 4000); // Auto-hide after 4s
    },

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
    // Titan Protocol
    bossState: { active: false, type: 'NONE', health: 1000, maxHealth: 1000, armorHealth: 0, maxArmor: 0, name: '' },
    damageBoss: (amount) => set(state => {
      if (!state.bossState.active) return {};

      let newArmor = state.bossState.armorHealth;
      let newHp = state.bossState.health;

      if (newArmor > 0) {
        newArmor = Math.max(0, newArmor - amount);
        if (newArmor === 0) get().showNotification('ARMOR BROKEN', 'Weak point exposed!', 'unlock');
      } else {
        newHp = Math.max(0, newHp - amount);
      }

      if (newHp <= 0) {
        // Boss Defeated Logic
        const rewardCores = state.bossState.type === 'VOID_WEAVER' ? 2 : 1;
        get().addResource('titanCores', rewardCores);
        get().showNotification('TITAN FALLEN', `Earned ${rewardCores} Titan Cores`, 'unlock');
        return { bossState: { ...state.bossState, active: false, health: 0, armorHealth: 0 } };
      }
      return { bossState: { ...state.bossState, health: newHp, armorHealth: newArmor } };
    }),

    // Astral Dominion
    isRaidMode: false,
    raidTarget: undefined,
    saveDefenseLayout: () => set(state => {
      const layout: import('./types').BaseLayout = {
        structures: state.structures.map(s => ({ type: s.type, position: s.position })),
        lastUpdated: Date.now()
      };
      const updatedProfile = { ...state.userProfile, defenseLayout: layout };
      return { userProfile: updatedProfile };
    }),
    startRaid: (targetId) => {
      // Mock fetching opponent layout
      const mockLayout: import('./types').BaseLayout = {
        structures: [
          { type: 'WALL', position: [5, 0, 5] },
          { type: 'PYLON', position: [-5, 0, -5] },
          { type: 'SENTRY_TURRET', position: [8, 0, 0] }
        ],
        lastUpdated: Date.now()
      };

      // Clear current scene structures and load raid target
      set({
        isRaidMode: true,
        gameState: GameState.PLAYING,
        structures: mockLayout.structures.map((s, i) => ({
          id: `raid_${i}`,
          type: s.type,
          position: s.position,
          health: 100, // Default hp
          maxHealth: 100
        })),
        raidTarget: { name: 'Player_' + targetId, avatar: '', defenseLayout: mockLayout }
      });
    },
    endRaid: (success) => {
      set({ isRaidMode: false, currentNightEvent: NightEvent.NONE });
      if (success) {
        get().showNotification('RAID SUCCESS', 'Base Destroyed', 'unlock');
        get().addResource('titanCores', 1); // Reward
      } else {
        get().showNotification('RAID FAILED', 'Your assault was repelled', 'night');
      }
      // Reload player's own base? Need to store local base separately if we overwrite structures.
      // For simplicity, we just reset game or load save.
      get().loadGame();
    },

    // Constellation System
    stardust: savedStardust ? parseInt(savedStardust) : 0,
    constellation: savedConstellation ? JSON.parse(savedConstellation) : defaultConstellation,

    applyConstellationBonuses: () => {
      const { constellation, playerStats } = get();
      let newStats = { ...playerStats };

      // Base values
      newStats.maxHealth = 100;
      newStats.attackDamage = 25;
      newStats.speed = 3.5;
      newStats.novaMultiplier = 1.0;

      // Apply Constellation Node effects
      constellation.forEach(node => {
        if (node.currentLevel > 0) {
          const totalBonus = node.effectValue * node.currentLevel;
          switch (node.effectType) {
            case 'MAX_HEALTH':
              newStats.maxHealth += totalBonus;
              break;
            case 'DAMAGE':
              newStats.attackDamage += totalBonus;
              break;
            case 'SPEED':
              newStats.speed += totalBonus;
              break;
            case 'NOVA_RECHARGE':
              newStats.novaMultiplier += totalBonus;
              break;
            case 'UNLOCK_DRONE':
              // Just mark as unlocked for current session
              // (Logic depends on DroneController handling)
              break;
          }
        }
      });

      // Apply permanent shop upgrades on top
      newStats.maxHealth += playerStats.upgradeLevels.vitality * 50;
      newStats.attackDamage += playerStats.upgradeLevels.strength * 15;
      newStats.speed += playerStats.upgradeLevels.agility * 1;

      newStats.currentHealth = Math.min(newStats.currentHealth, newStats.maxHealth);

      set({ playerStats: newStats });
    },

    // Phase 3: Skin System
    ownedSkins: savedOwnedSkins ? JSON.parse(savedOwnedSkins) : ['DEFAULT'],
    bestiary: {
      'SHADOW_STALKER': { identified: true, kills: 0 },
      'VOID_WRAITH': { identified: false, kills: 0 },
      'BRUTE': { identified: false, kills: 0 },
      'OBSIDIAN_GOLEM': { identified: false, kills: 0 },
      'VOID_WEAVER': { identified: false, kills: 0 }
    },
    activeSkin: savedActiveSkin || 'DEFAULT',
    purchaseSkin: (skinId, cost) => {
      const { stardust, ownedSkins } = get();
      if (ownedSkins.includes(skinId)) return true;
      if (stardust >= cost) {
        set(state => ({
          stardust: state.stardust - cost,
          ownedSkins: [...state.ownedSkins, skinId]
        }));
        localStorage.setItem('nightflare_stardust', get().stardust.toString());
        localStorage.setItem('nightflare_owned_skins', JSON.stringify(get().ownedSkins));
        return true;
      }
      return false;
    },
    equipSkin: (skinId) => {
      set({ activeSkin: skinId });
      localStorage.setItem('nightflare_active_skin', skinId);
    },
    purchaseWeapon: (weaponId, cost) => {
      const { stardust, playerStats } = get();
      if (playerStats.weaponLevels[weaponId as any] > 0) return true;
      if (stardust >= cost) {
        set(state => ({
          stardust: state.stardust - cost,
          playerStats: {
            ...state.playerStats,
            weaponLevels: {
              ...state.playerStats.weaponLevels,
              [weaponId]: 1
            },
            currentWeapon: weaponId as any
          }
        }));
        localStorage.setItem('nightflare_stardust', get().stardust.toString());
        // Save logic usually in loadGame/saveGame but for critical items we can force a sync or wait for auto-save.
        return true;
      }
      return false;
    },

    resetGame: (isNew = false) => {
      if (isNew) {
        if (!get().useLife()) {
          alert("Out of lives! Wait for regeneration.");
          return;
        }
      }

      const { constellation } = get();
      const shardNode = constellation.find(n => n.id === 'shard_magnet');
      const startShards = shardNode ? Math.floor(shardNode.effectValue * shardNode.currentLevel) : 0;

      set({
        gameState: GameState.PLAYING,
        timeOfDay: TimeOfDay.DAY,
        level: 1,
        wave: 1,
        score: 0,
        kills: 0,
        levelTimer: 300,
        resources: { wood: 0, stone: 0, lightShards: startShards, food: 0, titanCores: 0 },
        nightflareHealth: 100,
        nodes: [],
        structures: [],
        currentNightEvent: NightEvent.NONE,
        bossState: { active: false, type: 'NONE', health: 1000, maxHealth: 1000, name: '' }
      });

      get().applyConstellationBonuses();
      get().showNotification('MISSION START', 'Protect the Nightflare', 'night');
    },

    nextWave: () => {
      set(state => {
        const nextW = state.wave + 1;
        get().showNotification(`NIGHT ${nextW}`, 'The shadows grow stronger...', 'night');
        return {
          wave: nextW,
          timeOfDay: TimeOfDay.NIGHT,
          levelTimer: 300 + (nextW * 30)
        };
      });
    },

    nextLevel: () => {
      set(state => ({
        level: state.level + 1,
        gameState: GameState.LEVEL_CLEAR
      }));
    },

    decrementTimer: () => {
      set(state => {
        if (state.levelTimer <= 0) {
          if (state.timeOfDay === TimeOfDay.DAY) {
            get().setTimeOfDay(TimeOfDay.NIGHT);
            return { levelTimer: 300 + (state.wave * 20) };
          } else {
            get().nextLevel();
            return { levelTimer: 180 };
          }
        }

        // Random Weather Logic (5% chance per second)
        if (Math.random() < 0.05 && state.weather === import('./types').WeatherType.CLEAR) {
          const types = [import('./types').WeatherType.BLIZZARD, import('./types').WeatherType.SANDSTORM, import('./types').WeatherType.VOID_MIASMA];
          const chosen = types[Math.floor(Math.random() * types.length)];
          get().setWeather(chosen as any);
          get().showNotification('WEATHER ALERT', chosen as string, 'night');
          setTimeout(() => get().setWeather(import('./types').WeatherType.CLEAR), 15000); // 15s duration
        }

        return { levelTimer: state.levelTimer - 1 };
      });
      get().updateMissionProgress('SURVIVE', 1);
    },

    recordBestiaryDiscovery: (type: string) => set(state => {
      if (state.bestiary[type]?.identified) return {};
      return {
        bestiary: {
          ...state.bestiary,
          [type]: { ...state.bestiary[type] || { kills: 0 }, identified: true }
        }
      };
    }),

    recordEnemyKill: (type: import('./types').EnemyClass) => {
      set(state => {
        const isBoss = type === 'VOID_WALKER' || type === 'SHADOW_LORD' || type === 'OBSIDIAN_GOLEM' || type === 'VOID_WEAVER';
        const killPoints = isBoss ? 2500 : (type === 'BRUTE' ? 500 : 100);
        const novaBoost = (isBoss ? 25 : 2) * state.playerStats.novaMultiplier;

        const enemyKey = type.toString();
        const currentEntry = state.bestiary[enemyKey] || { identified: true, kills: 0 };
        const newBestiary = {
          ...state.bestiary,
          [enemyKey]: { ...currentEntry, kills: currentEntry.kills + 1 }
        };

        const xpGained = isBoss ? 500 : 25;
        const ultGained = isBoss ? 20 : 5;

        return {
          kills: state.kills + 1,
          score: state.score + killPoints,
          bestiary: newBestiary,
          playerStats: {
            ...state.playerStats,
            novaCharge: Math.min(100, state.playerStats.novaCharge + novaBoost),
            xp: state.playerStats.xp + xpGained,
            ultimateCharge: Math.min(100, state.playerStats.ultimateCharge + ultGained)
          }
        };
      });
      get().trackAchievementProgress('slayer', get().kills);
      get().updateMissionProgress('KILL', 1);
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
        get().convertScoreToStardust();
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
      if (state === GameState.GAME_OVER) {
        set({ isTransitioning: true });
        setTimeout(() => {
          set({ gameState: state, isTransitioning: false });
        }, 2500);
        return;
      }
      set({ gameState: state });
    },

    setTimeOfDay: (time) => {
      let event = NightEvent.NONE;
      if (time === TimeOfDay.NIGHT) {
        const { wave } = get();
        if (wave >= 3) {
          const rand = Math.random();
          if (rand < 0.2) event = NightEvent.RUSH;
          else if (rand < 0.35) event = NightEvent.SIEGE;
          else if (rand < 0.5) event = NightEvent.PHANTOM;
          else if (rand < 0.65) event = NightEvent.DENSE_FOG;
          else if (rand < 0.8) event = NightEvent.ION_STORM;
          else if (rand < 0.9) event = NightEvent.STARFALL;
        }
      }
      set({ timeOfDay: time, currentNightEvent: event });
    },
    setNodes: (nodes) => set({ nodes }),

    addStructure: (type, pos) => {
      const { playerStats, showNotification } = get();
      if (!playerStats.unlockedStructures.includes(type)) {
        showNotification('LOCKED', `Find Blueprint for ${type}`, 'unlock');
        return;
      }

      set((state) => ({
        structures: [...state.structures, {
          id: `struct-${Date.now()}`,
          type,
          position: pos,
          health: type === 'WALL' ? 300 : 100,
          maxHealth: type === 'WALL' ? 300 : 100,
        }]
      }));
      get().updateMissionProgress('BUILD', 1);
    },

    damageStructure: (id, amount) => set((state) => ({
      structures: state.structures.map(s => s.id === id ? { ...s, health: s.health - amount } : s).filter(s => s.health > 0)
    })),

    removeNode: (id) => set((state) => ({ nodes: state.nodes.filter(n => n.id !== id) })),

    addResource: (type, amount, pos) => {
      if (pos) {
        window.dispatchEvent(new CustomEvent('resource-collected', { detail: { position: pos, type } }));
      }
      if (type === ('blueprint' as any)) {
        const bpNames = ['Ion Pylon', 'Gravity Trap', 'Tesla Wall', 'Pulse Sentry', 'Vortex Drive'];
        const name = bpNames[Math.floor(Math.random() * bpNames.length)];
        get().showNotification('BLUEPRINT FOUND', name, 'unlock');
        set(state => ({
          playerStats: {
            ...state.playerStats,
            titanCredits: state.playerStats.titanCredits + 100, // Reward for finding bp
            blueprints: [...state.playerStats.blueprints, name]
          }
        }));
        return;
      }

      set((state) => {
        let novaBoost = 0;
        if (type === 'lightShards') novaBoost = amount * 4 * state.playerStats.novaMultiplier;
        const gatheringPoints = 25 * state.level;

        const newResources = { ...state.resources, [type]: state.resources[type] + amount };

        // Track Achievements
        const { updateProgress } = useAchievementStore.getState();
        const totalRes = Object.values(newResources).reduce((a, b) => a + b, 0);
        updateProgress('gatherer', totalRes);
        updateProgress('hoarder', totalRes);
        if (type === 'lightShards') updateProgress('treasure_hunter', newResources.lightShards);

        // Tutorial progression check
        if (state.tutorialStep === 1) {
          // Gathering step
          setTimeout(() => get().completeTutorialStep(), 1500);
        }

        if (type === 'wood') get().updateMissionProgress('COLLECT', amount);

        return {
          resources: newResources,
          score: state.score + gatheringPoints,
          playerStats: { ...state.playerStats, novaCharge: Math.min(100, state.playerStats.novaCharge + novaBoost) }
        };
      });
    },

    trackAchievementProgress: (id, progress) => {
      const { updateProgress } = useAchievementStore.getState();
      updateProgress(id, progress);
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
      const { isTimeSlowed, bossState } = get();
      if (bossState.active && bossState.type === 'OBSIDIAN_GOLEM') amount *= 2; // Golem does double siege damage
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
        get().triggerScreenShake(2.0);
        if (settings.vibrationEnabled && 'vibrate' in navigator) navigator.vibrate([100, 50, 100]);

        window.dispatchEvent(new CustomEvent('nightflare-nova'));

        set({ isTimeSlowed: true, playerStats: { ...playerStats, novaCharge: 0 } });

        setTimeout(() => {
          set({ isTimeSlowed: false });
        }, 5000);
      }
    },

    // Constellation System Actions
    unlockConstellationNode: (id) => {
      const { stardust, constellation } = get();
      const nodeIndex = constellation.findIndex(n => n.id === id);
      if (nodeIndex === -1) return false;

      const node = constellation[nodeIndex];

      // Calculate dynamic cost
      let actualCost = node.cost;
      if (node.currentLevel >= node.maxLevel) {
        // Ascension formula: base cost * 1.5 ^ (excess levels)
        const excess = node.currentLevel - node.maxLevel + 1;
        actualCost = Math.floor(node.cost * Math.pow(1.5, excess));
      }

      if (stardust < actualCost) return false;

      if (node.requiredNodes.length > 0) {
        const allReqsMet = node.requiredNodes.every(reqId => {
          const reqNode = constellation.find(n => n.id === reqId);
          return reqNode && reqNode.currentLevel > 0;
        });
        if (!allReqsMet) return false;
      }

      const updatedNode = { ...node, currentLevel: node.currentLevel + 1 };
      const newConstellation = [...constellation];
      newConstellation[nodeIndex] = updatedNode;

      const newStardust = stardust - actualCost;

      set({ stardust: newStardust, constellation: newConstellation });
      get().applyConstellationBonuses();
      localStorage.setItem('nightflare_stardust', newStardust.toString());
      localStorage.setItem('nightflare_constellation', JSON.stringify(newConstellation));

      // If ascended, show a special notification
      if (updatedNode.currentLevel > node.maxLevel) {
        get().showNotification('ASCENSION COMPLETE', `New Level: ${updatedNode.currentLevel}`, 'unlock');
      }

      return true;
    },

    convertScoreToStardust: () => {
      const { score, resources } = get();
      const earnedStardust = Math.floor(score / 100) + Math.floor(resources.lightShards / 10);
      if (earnedStardust > 0) {
        set(state => {
          const newTotal = state.stardust + earnedStardust;
          localStorage.setItem('nightflare_stardust', newTotal.toString());
          return { stardust: newTotal };
        });
        console.log(`The Constellation grows brighter. +${earnedStardust} Stardust Earned`);
      }
    },

    upgradePlayer: (upgrade) => set((state) => ({
      playerStats: { ...state.playerStats, ...upgrade }
    })),

    cycleWeapon: () => set((state) => {
      const allWeapons: ('STAFF' | 'SWORD' | 'BOW' | 'LIGHTNING_STAFF')[] = ['STAFF', 'SWORD', 'BOW', 'LIGHTNING_STAFF'];
      const ownedWeapons = allWeapons.filter(w => state.playerStats.weaponLevels[w] > 0);

      if (ownedWeapons.length <= 1) return state;

      const currentIndex = ownedWeapons.indexOf(state.playerStats.currentWeapon);
      const nextIndex = (currentIndex + 1) % ownedWeapons.length;
      return {
        playerStats: { ...state.playerStats, currentWeapon: ownedWeapons[nextIndex] }
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

    getLevelName: (level: number) => {
      const prefixes = [
        "Alpha", "Zion", "Neo", "Void", "Crimson", "Shadow", "Stellar", "Quantum", "Obsidian", "Prime",
        "Apex", "Delta", "Lost", "Ghost", "Blood", "Hyper", "Cyber", "Dark", "Holy", "Abyssal",
        "Solar", "Lunar", "Nova", "Plasma", "Aether", "Core", "Iron", "Gold", "Diamond", "Titan", "Ender"
      ]; // 31 prefixes (Prime)
      const suffixes = [
        "Outpost", "Descent", "Sector", "Horizon", "Singularity", "Core", "Rift", "Bastion", "Gateway", "Revelation",
        "Labyrinth", "Foundry", "Sanctum", "Nexus", "Vertex", "Tomb", "Peak", "Valley", "Domain", "End",
        "Spire", "Citadel", "Fortress", "Keep", "Palace", "Temple", "Vault", "Crater", "Plain"
      ]; // 29 suffixes (Prime)

      // Hardcoded milestones
      if (level === 1) return "The Awakening";
      if (level === 100) return "Centurion's Reach";
      if (level === 300) return "Halfway to Infinity";
      if (level === 500) return "Ascendant God";
      if (level === 600) return "The Eternal Nightflare";

      // Period of (31 * 29) = 899 levels before repeating combinations
      const pIdx = level % prefixes.length;
      const sIdx = level % suffixes.length;
      return `${prefixes[pIdx]} ${suffixes[sIdx]} ${level}`;
    },

    combo: 0,
    lastHitTime: 0,

    registerHit: () => {
      const now = Date.now();
      set(state => {
        const isQuickEnough = now - state.lastHitTime < 2500;
        const newCombo = isQuickEnough ? state.combo + 1 : 1;
        return { combo: newCombo, lastHitTime: now };
      })
    },

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

    setHeroClass: (choice) => set(state => {
      let stats = { ...state.playerStats, heroClass: choice };
      // Immediate bonuses
      if (choice === 'WARDEN') {
        stats.maxHealth += 50;
        stats.currentHealth += 50;
      } else if (choice === 'WRAITH') {
        stats.speed *= 1.25;
      } else if (choice === 'NOVA') {
        stats.novaMultiplier = 1.5;
      }
      return { playerStats: stats };
    }),

    updateMissionProgress: (task, amount = 1) => set(state => {
      const newMissions = state.playerStats.missions.map(m => {
        if (m.task === task && !m.completed) {
          const newCurrent = m.current + amount;
          const completed = newCurrent >= m.goal;
          if (completed) get().showNotification('MISSION COMPLETE', m.title, 'unlock');
          return { ...m, current: Math.min(m.goal, newCurrent), completed };
        }
        return m;
      });
      return { playerStats: { ...state.playerStats, missions: newMissions } };
    }),

    claimMissionReward: (missionId) => set(state => {
      const mission = state.playerStats.missions.find(m => m.id === missionId);
      if (!mission || !mission.completed || mission.claimed) return {};

      const newMissions = state.playerStats.missions.map(m =>
        m.id === missionId ? { ...m, claimed: true } : m
      );

      // Distribute rewards
      if (mission.type === 'SHARDS') get().addResource('lightShards', mission.reward);
      if (mission.type === 'STARDUST') set({ stardust: state.stardust + mission.reward });
      if (mission.type === 'TITAN_CREDITS') {
        return {
          playerStats: {
            ...state.playerStats,
            missions: newMissions,
            titanCredits: state.playerStats.titanCredits + mission.reward
          }
        };
      }

      return { playerStats: { ...state.playerStats, missions: newMissions } };
    }),

    updateTemperature: (delta) => set(state => ({
      playerStats: {
        ...state.playerStats,
        temperature: Math.max(0, Math.min(100, state.playerStats.temperature + delta))
      }
    })),

    purchaseDrone: (type, cost) => set(state => {
      if (state.playerStats.titanCredits < cost) return {};
      if (state.playerStats.activeDrones.includes(type)) return {};

      return {
        playerStats: {
          ...state.playerStats,
          titanCredits: state.playerStats.titanCredits - cost,
          activeDrones: [...state.playerStats.activeDrones, type]
        }
      };
    }),

    saveGhostData: () => set(state => {
      // In a real app we'd save this to a server. Here we just store it in state.
      // Ghost data is recorded at the end of a run if it's the best score.
      const newGhost = { path: (window as any).playerPathRecord || [], time: state.levelTimer };
      return { ghostData: [...state.ghostData, newGhost] };
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

    transmute: (type, amount) => {
      const { resources, addResource, consumeResource } = get();
      if (type === 'wood' && resources.wood >= amount) {
        consumeResource('wood', amount);
        addResource('stone', Math.floor(amount * 0.5));
        return true;
      } else if (type === 'stone' && resources.stone >= amount) {
        consumeResource('stone', amount);
        addResource('wood', Math.floor(amount * 1.5));
        return true;
      }
      return false;
    },

    // PHASE 6: THE TITAN AWAKENING
    addXP: (amount) => set(state => {
      const newXP = state.playerStats.xp + amount;
      const xpToNextLevel = state.playerStats.level * 1000;
      if (newXP >= xpToNextLevel) {
        const newLevel = state.playerStats.level + 1;
        get().showNotification('LEVEL UP', `Vanguard Level ${newLevel}`, 'unlock');
        // Bonus on level up
        let stats = { ...state.playerStats, level: newLevel, xp: newXP - xpToNextLevel, maxHealth: state.playerStats.maxHealth + 10 };
        return { playerStats: stats };
      }
      return { playerStats: { ...state.playerStats, xp: newXP } };
    }),

    triggerUltimate: () => {
      const { playerStats, heroClass, showNotification } = get();
      if (playerStats.ultimateCharge < 100) return;

      set(state => ({ playerStats: { ...state.playerStats, ultimateCharge: 0 } }));
      showNotification('ULTIMATE ACTIVATED', playerStats.heroClass, 'unlock');

      // Visual Trigger
      window.dispatchEvent(new CustomEvent('vanguard-ultimate', { detail: { type: playerStats.heroClass } }));

      // Temporary Buff Logic
      const originalStats = { ...playerStats };
      if (playerStats.heroClass === 'WARDEN') {
        set(state => ({ playerStats: { ...state.playerStats, attackDamage: state.playerStats.attackDamage * 2, maxHealth: state.playerStats.maxHealth + 1000 } }));
      } else if (playerStats.heroClass === 'WRAITH') {
        set(state => ({ playerStats: { ...state.playerStats, speed: state.playerStats.speed * 2, attackDamage: state.playerStats.attackDamage * 1.5 } }));
      } else if (playerStats.heroClass === 'NOVA') {
        set(state => ({ playerStats: { ...state.playerStats, novaMultiplier: 5, attackDamage: state.playerStats.attackDamage * 3 } }));
      }

      // Revert after 15 seconds
      setTimeout(() => {
        set(state => ({
          playerStats: {
            ...state.playerStats,
            attackDamage: originalStats.attackDamage,
            speed: originalStats.speed,
            maxHealth: originalStats.maxHealth,
            novaMultiplier: originalStats.novaMultiplier
          }
        }));
        get().showNotification('ULTIMATE EXPIRED', 'Returning to normal state', 'night');
      }, 15000);
    },

    setWeather: (type) => set({ weather: type, playerStats: { ...get().playerStats, weatherEffectActive: type !== 'CLEAR' } }),

    unlockBlueprint: (itemId) => set(state => ({
      playerStats: {
        ...state.playerStats,
        unlockedStructures: [...state.playerStats.unlockedStructures, itemId]
      }
    }))
  };
});
