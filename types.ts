
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

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export enum NightEvent {
  NONE = 'NONE',
  RUSH = 'RUSH', // High spawn rate, low HP
  SIEGE = 'SIEGE', // Low spawn rate, high HP
  PHANTOM = 'PHANTOM', // Invisible until close
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
  ARCTIC = 'ARCTIC'
}

export interface Resources {
  wood: number;
  stone: number;
  lightShards: number;
  food: number;
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
  };
  currentWeapon: 'STAFF' | 'SWORD' | 'BOW';
}

export enum WeaponType {
  STAFF = 'STAFF', // Starter
  SWORD = 'SWORD', // Unlocked at 5000 score
  BOW = 'BOW',     // Unlocked at 15000 score
}

export type EnemyClass = 'STALKER' | 'BRUTE' | 'WRAITH' | 'VOID_WALKER';
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
  type: 'WALL' | 'PYLON';
  position: [number, number, number];
  health: number;
  maxHealth: number;
  lastActionTime?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // URL or preset ID
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
