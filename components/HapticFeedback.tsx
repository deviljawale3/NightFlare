import { useEffect } from 'react';
import { useGameStore } from '../store';

/**
 * Haptic Feedback Manager
 * Provides vibration feedback for mobile devices
 * Uses Vibration API for tactile responses
 */

class HapticManager {
    private enabled: boolean = true;
    private isSupported: boolean = false;

    constructor() {
        // Check if Vibration API is supported
        this.isSupported = 'vibrate' in navigator;

        if (!this.isSupported) {
            console.log('Vibration API not supported on this device');
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    private vibrate(pattern: number | number[]) {
        if (!this.enabled || !this.isSupported) return;

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn('Vibration failed:', e);
        }
    }

    // Light tap (UI interactions)
    light() {
        this.vibrate(10);
    }

    // Medium impact (button press)
    medium() {
        this.vibrate(20);
    }

    // Heavy impact (important actions)
    heavy() {
        this.vibrate(40);
    }

    // Attack vibration (sword swing)
    attack() {
        this.vibrate([0, 30]); // Single strong pulse
    }

    // Hit vibration (successful hit)
    hit() {
        this.vibrate([0, 15, 10, 15]); // Double tap pattern
    }

    // Kill vibration (enemy defeated)
    kill() {
        this.vibrate([0, 50, 30, 70]); // Escalating pattern
    }

    // Damage vibration (player hit)
    damage() {
        this.vibrate([0, 100]); // Long strong pulse
    }

    // Critical hit vibration
    critical() {
        this.vibrate([0, 20, 20, 40, 20, 60]); // Intense pattern
    }

    // Collect vibration (pickup item)
    collect() {
        this.vibrate([0, 10, 5, 10]); // Quick double tap
    }

    // Achievement vibration
    achievement() {
        this.vibrate([0, 30, 50, 30, 50, 30, 50]); // Celebration pattern
    }

    // Level up vibration
    levelUp() {
        this.vibrate([0, 50, 100, 50, 100, 50, 150]); // Triumphant pattern
    }

    // Error vibration
    error() {
        this.vibrate([0, 100, 50, 100]); // Warning pattern
    }

    // Success vibration
    success() {
        this.vibrate([0, 20, 10, 30]); // Positive feedback
    }

    // Nova ability vibration
    nova() {
        this.vibrate([0, 100, 50, 100, 50, 150]); // Powerful explosion
    }

    // Jump vibration
    jump() {
        this.vibrate([0, 15]); // Quick pulse
    }

    // Stop all vibrations
    stop() {
        if (this.isSupported) {
            navigator.vibrate(0);
        }
    }
}

// Singleton instance
let hapticManager: HapticManager | null = null;

export const getHapticManager = () => {
    if (!hapticManager) {
        hapticManager = new HapticManager();
    }
    return hapticManager;
};

// React component to handle haptic events
const HapticFeedback: React.FC = () => {
    const settings = useGameStore(state => state.settings);

    useEffect(() => {
        const manager = getHapticManager();
        manager.setEnabled(settings.vibrationEnabled);
    }, [settings.vibrationEnabled]);

    useEffect(() => {
        const manager = getHapticManager();

        // Game event listeners
        const handleAttack = () => manager.attack();
        const handleImpact = () => manager.hit();
        const handleEnemyKilled = () => manager.kill();
        const handlePlayerDamage = () => manager.damage();
        const handleCollect = () => manager.collect();
        const handleJump = () => manager.jump();
        const handleNova = () => manager.nova();

        window.addEventListener('player-attack', handleAttack);
        window.addEventListener('attack-impact', handleImpact);
        window.addEventListener('enemy-killed', handleEnemyKilled);
        window.addEventListener('player-damage', handlePlayerDamage);
        window.addEventListener('resource-collected', handleCollect);
        window.addEventListener('player-jump', handleJump);
        window.addEventListener('nightflare-nova', handleNova);

        return () => {
            window.removeEventListener('player-attack', handleAttack);
            window.removeEventListener('attack-impact', handleImpact);
            window.removeEventListener('enemy-killed', handleEnemyKilled);
            window.removeEventListener('player-damage', handlePlayerDamage);
            window.removeEventListener('resource-collected', handleCollect);
            window.removeEventListener('player-jump', handleJump);
            window.removeEventListener('nightflare-nova', handleNova);
        };
    }, []);

    return null;
};

export default HapticFeedback;
