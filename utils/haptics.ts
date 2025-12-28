// Haptic Feedback Utility for Premium Game Feel
// Provides vibration feedback for various game actions

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'impact' | 'notification';

class HapticFeedback {
    private isSupported: boolean;

    constructor() {
        this.isSupported = 'vibrate' in navigator;
    }

    /**
     * Trigger haptic feedback with a specific pattern
     */
    trigger(pattern: HapticPattern): void {
        if (!this.isSupported) return;

        switch (pattern) {
            case 'light':
                navigator.vibrate(10);
                break;

            case 'medium':
                navigator.vibrate(20);
                break;

            case 'heavy':
                navigator.vibrate(50);
                break;

            case 'success':
                navigator.vibrate([10, 50, 10]); // Double tap
                break;

            case 'warning':
                navigator.vibrate([20, 100, 20, 100, 20]); // Triple pulse
                break;

            case 'error':
                navigator.vibrate([50, 100, 50]); // Strong double
                break;

            case 'selection':
                navigator.vibrate(5); // Very light
                break;

            case 'impact':
                navigator.vibrate(30);
                break;

            case 'notification':
                navigator.vibrate([10, 50, 10, 50, 10]); // Gentle pattern
                break;

            default:
                navigator.vibrate(10);
        }
    }

    /**
     * Custom vibration pattern
     */
    custom(pattern: number | number[]): void {
        if (!this.isSupported) return;
        navigator.vibrate(pattern);
    }

    /**
     * Stop all vibrations
     */
    stop(): void {
        if (!this.isSupported) return;
        navigator.vibrate(0);
    }

    /**
     * Game-specific haptic patterns
     */

    // UI Interactions
    buttonTap(): void {
        this.trigger('light');
    }

    buttonPress(): void {
        this.trigger('medium');
    }

    menuOpen(): void {
        this.trigger('selection');
    }

    menuClose(): void {
        this.trigger('selection');
    }

    tabSwitch(): void {
        this.trigger('light');
    }

    // Gameplay Actions
    attack(): void {
        this.trigger('medium');
    }

    enemyHit(): void {
        this.trigger('impact');
    }

    playerDamage(): void {
        this.trigger('heavy');
    }

    playerDeath(): void {
        this.custom([100, 50, 100, 50, 200]); // Dramatic pattern
    }

    jump(): void {
        this.trigger('light');
    }

    land(): void {
        this.trigger('medium');
    }

    // Special Actions
    novaActivation(): void {
        this.custom([50, 30, 50, 30, 100]); // Epic burst pattern
    }

    resourceCollect(): void {
        this.trigger('light');
    }

    levelUp(): void {
        this.trigger('success');
    }

    achievement(): void {
        this.custom([20, 50, 20, 50, 20, 100, 50]); // Celebration
    }

    // Game Events
    waveStart(): void {
        this.trigger('notification');
    }

    waveComplete(): void {
        this.trigger('success');
    }

    bossAppear(): void {
        this.custom([100, 100, 100]); // Warning rumble
    }

    victory(): void {
        this.custom([30, 50, 30, 50, 30, 50, 100]); // Victory fanfare
    }

    defeat(): void {
        this.custom([200]); // Long sad vibration
    }

    // Social
    challengeReceived(): void {
        this.trigger('notification');
    }

    messageReceived(): void {
        this.trigger('light');
    }

    // Errors
    invalidAction(): void {
        this.trigger('error');
    }

    insufficientResources(): void {
        this.trigger('warning');
    }
}

// Export singleton instance
export const haptics = new HapticFeedback();

// React hook for easy usage
export const useHaptics = () => {
    return haptics;
};

export default haptics;
