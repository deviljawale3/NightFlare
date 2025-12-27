
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
