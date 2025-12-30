
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { GameState, TimeOfDay } from '../types';

/**
 * VanguardMusic Component
 * Handles dynamic BGM transitions for Phase 5.
 */
const VanguardMusic: React.FC = () => {
    const { gameState, timeOfDay, bossState } = useGameStore();
    const audioContext = useRef<AudioContext | null>(null);
    const gainNode = useRef<GainNode | null>(null);
    const oscillator = useRef<OscillatorNode | null>(null);
    const filter = useRef<BiquadFilterNode | null>(null);

    useEffect(() => {
        // Initialize simple synth for BGM (since we don't have large MP3 assets)
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.setValueAtTime(0.05, audioContext.current.currentTime);
        gainNode.current.connect(audioContext.current.destination);

        return () => {
            if (audioContext.current) audioContext.current.close();
        };
    }, []);

    useEffect(() => {
        if (!audioContext.current || !gainNode.current) return;

        // Stop previous
        if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
        }

        const now = audioContext.current.currentTime;
        oscillator.current = audioContext.current.createOscillator();
        filter.current = audioContext.current.createBiquadFilter();

        oscillator.current.connect(filter.current);
        filter.current.connect(gainNode.current);

        // Adjust mood based on state
        if (gameState === GameState.MAIN_MENU) {
            oscillator.current.type = 'sine';
            oscillator.current.frequency.setValueAtTime(220, now);
            filter.current.type = 'lowpass';
            filter.current.frequency.setTargetAtTime(1000, now, 0.5);
        } else if (bossState.active) {
            oscillator.current.type = 'sawtooth';
            oscillator.current.frequency.setValueAtTime(110, now);
            filter.current.type = 'lowpass';
            filter.current.frequency.setTargetAtTime(3000, now, 0.5);
            gainNode.current.gain.setTargetAtTime(0.08, now, 1);
        } else if (timeOfDay === TimeOfDay.NIGHT) {
            oscillator.current.type = 'square';
            oscillator.current.frequency.setValueAtTime(165, now);
            filter.current.type = 'lowpass';
            filter.current.frequency.setTargetAtTime(800, now, 0.5);
        } else {
            oscillator.current.type = 'triangle';
            oscillator.current.frequency.setValueAtTime(330, now);
            filter.current.type = 'lowpass';
            filter.current.frequency.setTargetAtTime(2000, now, 0.5);
        }

        oscillator.current.start();

        // Simple arpeggio pattern
        const interval = setInterval(() => {
            if (!oscillator.current || !audioContext.current) return;
            const t = audioContext.current.currentTime;
            const notes = [1, 1.25, 1.5, 1.8]; // Major-ish for day
            const minor = [1, 1.2, 1.4, 1.7]; // Minor for night/boss
            const activeNotes = (timeOfDay === TimeOfDay.NIGHT || bossState.active) ? minor : notes;
            const freq = oscillator.current.frequency.value;
            const nextNote = activeNotes[Math.floor(Math.random() * activeNotes.length)];
            // oscillator.current.frequency.exponentialRampToValueAtTime(freq * nextNote, t + 0.1);
            // Too erratic for synth, let's just keep single drone for now but vary filter
            filter.current!.frequency.setTargetAtTime(800 + Math.random() * 2000, t, 0.2);
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, timeOfDay, bossState.active]);

    return null;
};

export default VanguardMusic;
