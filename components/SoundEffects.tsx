import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

/**
 * Sound Effects Manager
 * Handles all game sound effects with Web Audio API
 * Generates sounds procedurally for lightweight performance
 */

class SoundEffectsManager {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private enabled: boolean = true;

    constructor() {
        this.init();
    }

    private init() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3; // Master volume

            // Resume on user interaction
            const resume = () => {
                if (this.audioContext?.state === 'suspended') {
                    this.audioContext.resume();
                }
            };
            window.addEventListener('click', resume);
            window.addEventListener('touchstart', resume);
        } catch (e) {
            console.warn('Audio context not available:', e);
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = enabled ? 0.3 : 0;
        }
    }

    // Sword Swing Sound
    playSwordSwing() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Whoosh sound (swept noise)
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            const envelope = Math.sin(progress * Math.PI);
            data[i] = (Math.random() * 2 - 1) * envelope * 0.5;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(now);
        source.stop(now + 0.3);
    }

    // Impact Hit Sound
    playImpactHit() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Thud sound (low frequency punch)
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        // Noise layer for texture
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
        noise.start(now);
        noise.stop(now + 0.1);
    }

    // Enemy Death Sound
    playEnemyDeath() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Descending pitch death sound
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(300, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(150, now);
        osc2.frequency.exponentialRampToValueAtTime(25, now + 0.5);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // Distortion for dramatic effect
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc1.stop(now + 0.5);
        osc2.start(now);
        osc2.stop(now + 0.5);
    }

    // UI Click Sound
    playUIClick() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Short click sound
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // UI Hover Sound
    playUIHover() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // Collect/Pickup Sound
    playCollect() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Rising pitch collection sound
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Achievement/Level Up Sound
    playAchievement() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        // Triumphant arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.audioContext!.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            const gain = this.audioContext!.createGain();
            gain.gain.setValueAtTime(0.2, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain!);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }

    // Error/Negative Sound
    playError() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Singleton instance
let soundManager: SoundEffectsManager | null = null;

export const getSoundManager = () => {
    if (!soundManager) {
        soundManager = new SoundEffectsManager();
    }
    return soundManager;
};

// React component to handle sound events
const SoundEffects: React.FC = () => {
    const settings = useGameStore(state => state.settings);
    const managerRef = useRef<SoundEffectsManager | null>(null);

    useEffect(() => {
        managerRef.current = getSoundManager();
        managerRef.current.setEnabled(settings.soundEnabled);

        return () => {
            // Don't cleanup on unmount, keep singleton alive
        };
    }, []);

    useEffect(() => {
        if (managerRef.current) {
            managerRef.current.setEnabled(settings.soundEnabled);
        }
    }, [settings.soundEnabled]);

    useEffect(() => {
        const manager = managerRef.current;
        if (!manager) return;

        // Event listeners for game sounds
        const handleAttack = () => manager.playSwordSwing();
        const handleImpact = () => manager.playImpactHit();
        const handleEnemyKilled = () => manager.playEnemyDeath();
        const handleCollect = () => manager.playCollect();

        window.addEventListener('player-attack', handleAttack);
        window.addEventListener('attack-impact', handleImpact);
        window.addEventListener('enemy-killed', handleEnemyKilled);
        window.addEventListener('resource-collected', handleCollect);

        return () => {
            window.removeEventListener('player-attack', handleAttack);
            window.removeEventListener('attack-impact', handleImpact);
            window.removeEventListener('enemy-killed', handleEnemyKilled);
            window.removeEventListener('resource-collected', handleCollect);
        };
    }, []);

    return null;
};

export default SoundEffects;
