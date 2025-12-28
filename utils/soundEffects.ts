// Sound Effects Manager for Premium Audio Feedback
// Manages all game sound effects with volume control and pooling

type SoundEffect =
    // UI Sounds
    | 'button_click' | 'button_hover' | 'menu_open' | 'menu_close'
    | 'tab_switch' | 'error' | 'success' | 'notification'
    // Gameplay Sounds
    | 'attack_swing' | 'attack_hit' | 'enemy_hit' | 'enemy_death'
    | 'player_damage' | 'player_death' | 'jump' | 'land'
    // Special Actions
    | 'nova_charge' | 'nova_release' | 'resource_collect' | 'level_up'
    | 'achievement' | 'wave_start' | 'wave_complete' | 'victory' | 'defeat'
    // Ambient
    | 'footstep' | 'fire_crackle' | 'wind' | 'night_ambient';

class SoundEffectsManager {
    private sounds: Map<SoundEffect, HTMLAudioElement[]> = new Map();
    private masterVolume: number = 0.7;
    private sfxVolume: number = 0.8;
    private enabled: boolean = true;
    private poolSize: number = 3; // Number of instances per sound for overlapping

    constructor() {
        this.initializeSounds();
    }

    /**
     * Initialize sound pools
     * Note: In production, replace data URLs with actual audio files
     */
    private initializeSounds(): void {
        // For now, we'll use the Web Audio API to generate simple sounds
        // In production, replace with actual audio files

        const soundEffects: SoundEffect[] = [
            'button_click', 'button_hover', 'menu_open', 'menu_close',
            'tab_switch', 'error', 'success', 'notification',
            'attack_swing', 'attack_hit', 'enemy_hit', 'enemy_death',
            'player_damage', 'player_death', 'jump', 'land',
            'nova_charge', 'nova_release', 'resource_collect', 'level_up',
            'achievement', 'wave_start', 'wave_complete', 'victory', 'defeat',
            'footstep', 'fire_crackle', 'wind', 'night_ambient'
        ];

        // Create audio pools for each sound
        soundEffects.forEach(effect => {
            const pool: HTMLAudioElement[] = [];
            for (let i = 0; i < this.poolSize; i++) {
                const audio = this.createSoundEffect(effect);
                if (audio) pool.push(audio);
            }
            if (pool.length > 0) {
                this.sounds.set(effect, pool);
            }
        });
    }

    /**
     * Create a sound effect using Web Audio API
     * This generates simple tones - replace with actual audio files in production
     */
    private createSoundEffect(effect: SoundEffect): HTMLAudioElement | null {
        // For demo purposes, we'll create silent audio elements
        // In production, load actual audio files:
        // const audio = new Audio(`/sounds/${effect}.mp3`);

        const audio = new Audio();
        audio.volume = this.masterVolume * this.sfxVolume;

        // Placeholder - in production, set audio.src to actual file
        // audio.src = `/sounds/${effect}.mp3`;

        return audio;
    }

    /**
     * Play a sound effect
     */
    play(effect: SoundEffect, volumeMultiplier: number = 1): void {
        if (!this.enabled) return;

        const pool = this.sounds.get(effect);
        if (!pool || pool.length === 0) {
            console.warn(`Sound effect "${effect}" not found`);
            return;
        }

        // Find an available audio element (not currently playing)
        let audio = pool.find(a => a.paused);

        // If all are playing, use the first one (will restart it)
        if (!audio) audio = pool[0];

        audio.volume = this.masterVolume * this.sfxVolume * volumeMultiplier;
        audio.currentTime = 0;

        // Play with error handling
        audio.play().catch(err => {
            // Silently fail if autoplay is blocked
            console.debug('Audio play failed:', err);
        });
    }

    /**
     * Play with random pitch variation for variety
     */
    playWithVariation(effect: SoundEffect, pitchVariation: number = 0.1): void {
        if (!this.enabled) return;

        const pool = this.sounds.get(effect);
        if (!pool || pool.length === 0) return;

        let audio = pool.find(a => a.paused) || pool[0];

        // Random pitch variation
        const pitch = 1 + (Math.random() - 0.5) * pitchVariation;
        audio.playbackRate = pitch;

        audio.volume = this.masterVolume * this.sfxVolume;
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Set SFX volume (0-1)
     */
    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Update volumes for all audio elements
     */
    private updateAllVolumes(): void {
        this.sounds.forEach(pool => {
            pool.forEach(audio => {
                audio.volume = this.masterVolume * this.sfxVolume;
            });
        });
    }

    /**
     * Enable/disable sound effects
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    /**
     * Stop all currently playing sounds
     */
    stopAll(): void {
        this.sounds.forEach(pool => {
            pool.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        });
    }

    /**
     * Preload a specific sound
     */
    preload(effect: SoundEffect): void {
        const pool = this.sounds.get(effect);
        if (pool) {
            pool.forEach(audio => audio.load());
        }
    }

    /**
     * Preload all sounds
     */
    preloadAll(): void {
        this.sounds.forEach(pool => {
            pool.forEach(audio => audio.load());
        });
    }

    // Convenience methods for common sounds

    // UI
    clickButton(): void { this.play('button_click'); }
    hoverButton(): void { this.play('button_hover', 0.5); }
    openMenu(): void { this.play('menu_open'); }
    closeMenu(): void { this.play('menu_close'); }
    switchTab(): void { this.play('tab_switch'); }
    playError(): void { this.play('error'); }
    playSuccess(): void { this.play('success'); }
    playNotification(): void { this.play('notification'); }

    // Gameplay
    attackSwing(): void { this.playWithVariation('attack_swing', 0.2); }
    attackHit(): void { this.play('attack_hit'); }
    enemyHit(): void { this.playWithVariation('enemy_hit', 0.15); }
    enemyDeath(): void { this.play('enemy_death'); }
    playerDamage(): void { this.play('player_damage'); }
    playerDeath(): void { this.play('player_death'); }
    playerJump(): void { this.play('jump'); }
    playerLand(): void { this.play('land', 0.7); }

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

    // Ambient
    footstep(): void { this.playWithVariation('footstep', 0.4); }
    fireCrackle(): void { this.play('fire_crackle', 0.3); }
}

// Export singleton instance
export const soundEffects = new SoundEffectsManager();

// React hook
export const useSoundEffects = () => {
    return soundEffects;
};

export default soundEffects;
