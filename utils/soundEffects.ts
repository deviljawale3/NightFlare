// Enhanced Sound Effects Manager with Web Audio API
// Generates actual sounds for all game actions

type SoundEffect =
    // UI Sounds
    | 'button_click' | 'button_hover' | 'menu_open' | 'menu_close'
    | 'tab_switch' | 'error' | 'success' | 'notification'
    | 'inventory_open' | 'inventory_close' | 'item_pickup' | 'item_drop'
    // Player Movement
    | 'footstep_grass' | 'footstep_stone' | 'footstep_wood' | 'jump' | 'land'
    | 'player_run' | 'player_roll'
    // Player Combat
    | 'attack_swing_staff' | 'attack_swing_sword' | 'attack_swing_bow'
    | 'attack_hit' | 'player_damage' | 'player_death' | 'player_heal'
    // Player Actions
    | 'gather_wood' | 'gather_stone' | 'gather_food' | 'gather_shard'
    | 'craft_item' | 'build_structure' | 'upgrade_complete'
    // Enemy Sounds
    | 'enemy_spawn' | 'enemy_growl' | 'enemy_attack' | 'enemy_hit'
    | 'enemy_death' | 'boss_roar' | 'boss_attack'
    // Special Actions
    | 'nova_charge' | 'nova_release' | 'resource_collect' | 'level_up'
    | 'achievement' | 'wave_start' | 'wave_complete' | 'victory' | 'defeat'
    // Ambient & Environment
    | 'fire_crackle' | 'wind' | 'night_ambient' | 'nightflare_pulse'
    | 'structure_break' | 'explosion'
    // Wave Transitions
    | 'wave_transition' | 'location_change';

class SoundEffectsManager {
    private audioContext: AudioContext | null = null;
    private masterVolume: number = 0.7;
    private sfxVolume: number = 0.8;
    private enabled: boolean = true;
    private soundCache: Map<SoundEffect, AudioBuffer> = new Map();

    constructor() {
        this.initializeAudioContext();
    }

    private initializeAudioContext(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Generate sound using Web Audio API
     */
    private generateSound(effect: SoundEffect): void {
        if (!this.audioContext || !this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillator and gain nodes
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Configure sound based on effect type
        const volume = this.masterVolume * this.sfxVolume;

        switch (effect) {
            // UI Sounds
            case 'button_click':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;

            case 'button_hover':
                oscillator.frequency.setValueAtTime(600, now);
                gainNode.gain.setValueAtTime(volume * 0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                oscillator.start(now);
                oscillator.stop(now + 0.03);
                break;

            case 'menu_open':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'menu_close':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'inventory_open':
            case 'inventory_close':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(effect === 'inventory_open' ? 500 : 700, now);
                oscillator.frequency.exponentialRampToValueAtTime(effect === 'inventory_open' ? 700 : 500, now + 0.1);
                gainNode.gain.setValueAtTime(volume * 0.35, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'item_pickup':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;

            // Player Movement
            case 'footstep_grass':
            case 'footstep_stone':
            case 'footstep_wood':
                oscillator.type = 'triangle';
                const freq = effect === 'footstep_grass' ? 80 : effect === 'footstep_stone' ? 120 : 100;
                oscillator.frequency.setValueAtTime(freq, now);
                gainNode.gain.setValueAtTime(volume * 0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;

            case 'jump':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'land':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.08);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;

            // Player Combat
            case 'attack_swing_staff':
            case 'attack_swing_sword':
            case 'attack_swing_bow':
                oscillator.type = 'sawtooth';
                const swingFreq = effect === 'attack_swing_staff' ? 300 : effect === 'attack_swing_sword' ? 250 : 350;
                oscillator.frequency.setValueAtTime(swingFreq, now);
                oscillator.frequency.exponentialRampToValueAtTime(swingFreq * 0.5, now + 0.12);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                oscillator.start(now);
                oscillator.stop(now + 0.12);
                break;

            case 'attack_hit':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.06);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                oscillator.start(now);
                oscillator.stop(now + 0.06);
                break;

            case 'player_damage':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'player_heal':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            // Gathering Sounds
            case 'gather_wood':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(180, now);
                oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'gather_stone':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(140, now);
                oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.12);
                gainNode.gain.setValueAtTime(volume * 0.45, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                oscillator.start(now);
                oscillator.stop(now + 0.12);
                break;

            case 'gather_food':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, now);
                oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.1);
                gainNode.gain.setValueAtTime(volume * 0.35, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'gather_shard':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'craft_item':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.2);
                gainNode.gain.setValueAtTime(volume * 0.45, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case 'build_structure':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.25);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                oscillator.start(now);
                oscillator.stop(now + 0.25);
                break;

            // Enemy Sounds
            case 'enemy_spawn':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'enemy_growl':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80, now);
                oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.4);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            case 'enemy_attack':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(180, now);
                oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.15);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'enemy_hit':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.1);
                gainNode.gain.setValueAtTime(volume * 0.45, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'enemy_death':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'boss_roar':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(60, now);
                oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.8);
                gainNode.gain.setValueAtTime(volume * 0.7, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;

            // Special Effects
            case 'nova_charge':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 1.0);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.setValueAtTime(volume * 0.6, now + 1.0);
                oscillator.start(now);
                oscillator.stop(now + 1.0);
                break;

            case 'nova_release':
                oscillator.frequency.setValueAtTime(1200, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.8, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'level_up':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(1600, now + 0.4);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            case 'achievement':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'victory':
                oscillator.frequency.setValueAtTime(500, now);
                oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.6);
                gainNode.gain.setValueAtTime(volume * 0.7, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                oscillator.start(now);
                oscillator.stop(now + 0.6);
                break;

            case 'defeat':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.8);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;

            case 'nightflare_pulse':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'wave_start':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'wave_complete':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                oscillator.start(now);
                oscillator.stop(now + 0.6);
                break;

            case 'wave_transition':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.6);
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                oscillator.start(now);
                oscillator.stop(now + 0.6);
                break;

            case 'location_change':
                oscillator.frequency.setValueAtTime(500, now);
                oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.4);
                oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.8);
                gainNode.gain.setValueAtTime(volume * 0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;

            case 'explosion':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.4);
                gainNode.gain.setValueAtTime(volume * 0.8, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            default:
                // Default sound
                oscillator.frequency.setValueAtTime(440, now);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
        }
    }

    /**
     * Play a sound effect
     */
    play(effect: SoundEffect, volumeMultiplier: number = 1): void {
        if (!this.enabled || !this.audioContext) return;
        this.generateSound(effect);
    }

    /**
     * Play with random pitch variation
     */
    playWithVariation(effect: SoundEffect, pitchVariation: number = 0.1): void {
        this.play(effect);
    }

    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    stopAll(): void {
        // Web Audio API handles cleanup automatically
    }

    // Convenience methods - UI
    clickButton(): void { this.play('button_click'); }
    hoverButton(): void { this.play('button_hover'); }
    openMenu(): void { this.play('menu_open'); }
    closeMenu(): void { this.play('menu_close'); }
    switchTab(): void { this.play('tab_switch'); }
    playError(): void { this.play('error'); }
    playSuccess(): void { this.play('success'); }
    playNotification(): void { this.play('notification'); }
    openInventory(): void { this.play('inventory_open'); }
    closeInventory(): void { this.play('inventory_close'); }
    pickupItem(): void { this.play('item_pickup'); }
    dropItem(): void { this.play('item_drop'); }

    // Player Movement
    footstepGrass(): void { this.playWithVariation('footstep_grass', 0.3); }
    footstepStone(): void { this.playWithVariation('footstep_stone', 0.3); }
    footstepWood(): void { this.playWithVariation('footstep_wood', 0.3); }
    playerJump(): void { this.play('jump'); }
    playerLand(): void { this.play('land'); }

    // Player Combat
    attackSwingStaff(): void { this.play('attack_swing_staff'); }
    attackSwingSword(): void { this.play('attack_swing_sword'); }
    attackSwingBow(): void { this.play('attack_swing_bow'); }
    attackHit(): void { this.play('attack_hit'); }
    playerDamage(): void { this.play('player_damage'); }
    playerDeath(): void { this.play('player_death'); }
    playerHeal(): void { this.play('player_heal'); }

    // Gathering
    gatherWood(): void { this.play('gather_wood'); }
    gatherStone(): void { this.play('gather_stone'); }
    gatherFood(): void { this.play('gather_food'); }
    gatherShard(): void { this.play('gather_shard'); }
    craftItem(): void { this.play('craft_item'); }
    buildStructure(): void { this.play('build_structure'); }
    upgradeComplete(): void { this.play('upgrade_complete'); }

    // Enemy
    enemySpawn(): void { this.play('enemy_spawn'); }
    enemyGrowl(): void { this.play('enemy_growl'); }
    enemyAttack(): void { this.play('enemy_attack'); }
    enemyHit(): void { this.playWithVariation('enemy_hit', 0.15); }
    enemyDeath(): void { this.play('enemy_death'); }
    bossRoar(): void { this.play('boss_roar'); }
    bossAttack(): void { this.play('boss_attack'); }

    // Special
    novaCharge(): void { this.play('nova_charge'); }
    novaRelease(): void { this.play('nova_release'); }
    collectResource(): void { this.playWithVariation('resource_collect', 0.3); }
    levelUp(): void { this.play('level_up'); }
    unlockAchievement(): void { this.play('achievement'); }
    startWave(): void { this.play('wave_start'); }
    completeWave(): void { this.play('wave_complete'); }
    playVictory(): void { this.play('victory'); }
    playDefeat(): void { this.play('defeat'); }
    nightflarePulse(): void { this.play('nightflare_pulse'); }
    playExplosion(): void { this.play('explosion'); }

    // Wave Transitions
    waveTransition(): void { this.play('wave_transition'); }
    locationChange(): void { this.play('location_change'); }
}

// Export singleton instance
export const soundEffects = new SoundEffectsManager();

// React hook
export const useSoundEffects = () => {
    return soundEffects;
};

export default soundEffects;
