
export enum GameState {
  MAIN_MENU = 'MAIN_MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED',
  TUTORIAL = 'TUTORIAL',
  LEVEL_CLEAR = 'LEVEL_CLEAR'
}

export enum TimeOfDay {
  DAY = 'DAY',
  NIGHT = 'NIGHT'
}

export type HeroClass = 'WARDEN' | 'WRAITH' | 'NOVA' | 'NONE';

export interface DailyOperation {
  id: string;
  title: string;
  description: string;
  task: 'KILL' | 'COLLECT' | 'SURVIVE' | 'BUILD';
  goal: number;
  current: number;
  reward: number;
  type: 'SHARDS' | 'TITAN_CREDITS' | 'STARDUST';
  completed: boolean;
  claimed: boolean;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  type: 'STRUCTURE' | 'WEAPON' | 'UTILITY';
}

export type ConstellationEffectType =
  | 'MAX_HEALTH'
  | 'DAMAGE'
  | 'SPEED'
  | 'NOVA_RECHARGE'
  | 'STARTING_SHARDS'
  | 'CRIT_CHANCE'
  | 'DASH_COOLDOWN'
  | 'RESOURCE_GAIN'
  | 'UNLOCK_DRONE'
  | 'UNLOCK_ORBITAL_STRIKE';

export type DroneType = 'VORTEX' | 'STINGER' | 'AEGIS';

export interface DroneConfig {
  type: DroneType;
  unlocked: boolean;
  level: number;
}

export interface ConstellationNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effectType: ConstellationEffectType;
  effectValue: number; // Value per level
  position: { x: number; y: number }; // Percentage 0-100 for responsive UI
  requiredNodes: string[]; // IDs of prerequisite nodes
  icon: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  cameraAngle: number; // 0-360 degrees
  cameraDistance: number; // Zoom level 15-40
  cameraPreset: 'DEFAULT' | 'CLOSE' | 'TOP_DOWN' | 'SIDE' | 'ISOMETRIC' | 'FREE' | 'CINEMATIC';
}

export enum NightEvent {
  NONE = 'NONE',
  RUSH = 'RUSH', // High spawn rate, low HP
  SIEGE = 'SIEGE', // Low spawn rate, high HP
  PHANTOM = 'PHANTOM', // Invisible until close
  ION_STORM = 'ION_STORM', // Lightning strikes
  DENSE_FOG = 'DENSE_FOG', // Low visibility
  STARFALL = 'STARFALL', // Shards rain
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  BLIZZARD = 'BLIZZARD',
  SANDSTORM = 'SANDSTORM',
  VOID_MIASMA = 'VOID_MIASMA',
  ION_TEMPEST = 'ION_TEMPEST'
}

export enum EnemyBehavior {
  PATROL = 'PATROL',
  SUSPICIOUS = 'SUSPICIOUS',
  ALERTED = 'ALERTED',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK'
}

export enum IslandTheme {
  FOREST = 'FOREST',
  VOLCANO = 'VOLCANO',
  ARCTIC = 'ARCTIC',
  DESERT = 'DESERT',
  VOID = 'VOID',
  CELESTIAL = 'CELESTIAL',
  CRYSTAL = 'CRYSTAL',
  CORRUPTION = 'CORRUPTION',
  ABYSS = 'ABYSS',
  ETERNAL_SHADOW = 'ETERNAL_SHADOW'
}

export interface Resources {
  wood: number;
  stone: number;
  lightShards: number;
  food: number;
  titanCores: number;
}

export interface PlayerStats {
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  attackRange: number;
  speed: number;
  hasArmor: boolean;
  hasSpear: boolean;
  novaCharge: number; // 0 to 100
  novaMultiplier: number;
  upgradeLevels: {
    strength: number;
    agility: number;
    vitality: number;
  };
  unlockedAbilities: {
    shield: boolean;
    chargedAttack: boolean;
  };
  weaponLevels: {
    STAFF: number;
    SWORD: number;
    BOW: number;
    LIGHTNING_STAFF: number;
  };
  activeDrones: DroneType[];
  currentWeapon: 'STAFF' | 'SWORD' | 'BOW' | 'LIGHTNING_STAFF';
  heroClass: HeroClass;
  titanCredits: number;
  blueprints: string[];
  unlockedStructures: string[];
  temperature: number; // For Arctic Biome
  missions: DailyOperation[];
  xp: number;
  level: number;
  ultimateCharge: number; // 0 to 100
  weatherEffectActive: boolean;
}

export enum WeaponType {
  STAFF = 'STAFF', // Starter
  SWORD = 'SWORD', // Unlocked at 5000 score
  BOW = 'BOW',     // Unlocked at 15000 score
  LIGHTNING_STAFF = 'LIGHTNING_STAFF', // Unlocked at Phase 4
}

export type EnemyClass =
  | 'STALKER'
  | 'BRUTE'
  | 'WRAITH'
  | 'VOID_WALKER'
  | 'FOREST_WOLF'
  | 'FIRE_ELEMENTAL'
  | 'ICE_WRAITH'
  | 'SAND_RAVAGER'
  | 'VOID_SPECTER'
  | 'STAR_REAVER'
  | 'CRYSTAL_GOLEM'
  | 'CORRUPTED_STALKER'
  | 'DEEP_DWELLER'
  | 'SHADOW_LORD'
  | 'OBSIDIAN_GOLEM'
  | 'VOID_WEAVER'
  | 'TITAN_YMIR'      // Frost Titan
  | 'TITAN_PROMETHEUS' // Fire Titan
  | 'TITAN_KRAKEN';    // Abyss Titan

export type EnemyTarget = 'NIGHTFLARE' | 'PLAYER' | 'STRUCTURE';

export interface EnemyType {
  id: string;
  type: EnemyClass;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  target: EnemyTarget;
  isDead?: boolean;
  behavior: EnemyBehavior;
  patrolPoint?: [number, number, number];
  attackCooldown?: number;
  lastAttackTime?: number;
}

export interface ResourceNode {
  id: string;
  type: 'TREE' | 'ROCK' | 'CRYSTAL' | 'FOOD';
  position: [number, number, number];
  health: number;
}

export interface Structure {
  id: string;
  type: 'WALL' | 'PYLON' | 'SENTRY_TURRET' | 'PRISM_TOWER' | 'STASIS_TRAP';
  position: [number, number, number];
  health: number;
  maxHealth: number;
  lastActionTime?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // URL or preset ID
  bio?: string;
  defenseLayout: BaseLayout;
  defensePoints: number;
  defenseRank: PlayerRank;
}

export interface SavedStructure {
  type: 'WALL' | 'PYLON' | 'SENTRY_TURRET' | 'PRISM_TOWER' | 'STASIS_TRAP';
  position: [number, number, number];
}

export interface BaseLayout {
  structures: SavedStructure[];
  lastUpdated: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  wave: string;
  date: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  type: 'CHAT' | 'REQUEST_LIFE' | 'REQUEST_WEAPON' | 'SYSTEM' | 'GIFT';
  targetId?: string; // For direct gifts/requests
  requestStatus?: 'PENDING' | 'GRANTED' | 'EXPIRED';
  weaponType?: WeaponType;
}

export type ChallengeMode = 'SCORE_RUSH' | 'SUDDEN_DEATH';
export type PlayerRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND';

export interface ChallengeState {
  isActive: boolean;
  mode: ChallengeMode;
  opponent: {
    id: string;
    name: string;
    avatar: string;
    score: number;
    health: number; // For sudden death
    difficultyMultiplier: number; // 1.0 = Normal, 1.5 = Elite
  };
  wager: number; // The bet amount
  startTime: number;
  duration: number; // For Score Rush (e.g. 180 sec)
  result?: 'VICTORY' | 'DEFEAT' | 'DRAW';
}

export interface BattleRecord {
  id: string;
  date: number;
  mode: ChallengeMode;
  opponentName: string;
  opponentAvatar: string;
  playerScore: number;
  opponentScore: number;
  wager: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  winnings: number; // Net gain/loss
  duration: number; // How long the battle lasted
  kills?: number;
  wave?: number;
}

export interface ArenaStats {
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  totalWagered: number;
  totalWinnings: number;
  netProfit: number;
  winStreak: number;
  bestStreak: number;
  rank: PlayerRank;
  rankPoints: number; // ELO-style points
  titles: string[]; // Earned titles like "Undefeated", "High Roller"
}

export interface Tournament {
  id: string;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: number;
  endTime?: number;
  bracket: TournamentMatch[];
  participants: TournamentParticipant[];
  rewards: TournamentReward[];
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1: { id: string; name: string; avatar: string; score?: number };
  player2: { id: string; name: string; avatar: string; score?: number };
  winner?: string;
  completed: boolean;
  scheduledTime?: number;
}

export interface TournamentParticipant {
  id: string;
  name: string;
  avatar: string;
  seed: number;
  eliminated: boolean;
  placement?: number;
}

export interface TournamentReward {
  placement: number;
  shards: number;
  title?: string;
}

// Friend System
export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
  rank: PlayerRank;
  lastSeen: number;
  wins: number;
  losses: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  timestamp: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface DirectChallenge {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  toName: string;
  wager: number;
  mode: ChallengeMode;
  timestamp: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: number;
}

// Seasonal System
export interface Season {
  id: string;
  name: string;
  number: number;
  startDate: number;
  endDate: number;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  rewards: SeasonReward[];
  topPlayers: SeasonLeaderboardEntry[];
}

export interface SeasonReward {
  rankThreshold: PlayerRank;
  shards: number;
  title: string;
  badge?: string;
}

export interface SeasonLeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  rank: PlayerRank;
  rankPoints: number;
  wins: number;
  losses: number;
  placement: number;
}

// Analytics
export interface PlayerAnalytics {
  winRateByMode: {
    SCORE_RUSH: number;
    SUDDEN_DEATH: number;
  };
  averageScore: number;
  averageDuration: number;
  bestOpponent: string;
  worstOpponent: string;
  peakPerformanceTime: string; // e.g., "Evening"
  recentForm: ('W' | 'L' | 'D')[]; // Last 10 matches
  scoreHistory: { date: number; score: number }[];
  rankHistory: { date: number; rank: PlayerRank; points: number }[];
}

// Multiplayer
export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface MultiplayerState {
  enabled: boolean;
  connectionStatus: ConnectionStatus;
  playerId?: string;
  roomId?: string;
  opponentConnected: boolean;
}
