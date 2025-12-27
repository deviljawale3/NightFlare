
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { GameState, TimeOfDay } from '../types';

const AmbientSounds: React.FC = () => {
  const { gameState, timeOfDay, settings } = useGameStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const footstepIntervalRef = useRef<any>(null);
  const bgmRef = useRef<GainNode | null>(null);
  const bgmOscRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    const resumeAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  useEffect(() => {
    if (!settings.soundEnabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    if (gameState !== GameState.PLAYING && gameState !== GameState.TUTORIAL) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    if (!bgmRef.current) {
      bgmRef.current = ctx.createGain();
      bgmRef.current.connect(ctx.destination);
      bgmRef.current.gain.setValueAtTime(0.08, ctx.currentTime);
      
      const createSynth = (freq: number, type: OscillatorType) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(g);
        g.connect(bgmRef.current!);
        osc.start();
        return osc;
      };
      
      bgmOscRef.current = [
        createSynth(440, 'sine'),   // Ethereal Mid
        createSynth(110, 'triangle') // Deep Bass
      ];
    }

    const isNight = timeOfDay === TimeOfDay.NIGHT;
    bgmOscRef.current.forEach((osc, idx) => {
      const baseFreq = idx === 0 ? (isNight ? 280 : 440) : (isNight ? 70 : 110);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 5);
    });

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(isNight ? 300 : 800, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(isNight ? 0.7 : 0.2, ctx.currentTime);

    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ctx.destination);
    whiteNoise.start();

    let howlInterval: any;
    const playHowl = () => {
      if (timeOfDay === TimeOfDay.NIGHT) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 + Math.random() * 60, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 4);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 8);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 4);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 8);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 8);
      }
      howlInterval = setTimeout(playHowl, 8000 + Math.random() * 12000);
    };
    if (isNight) playHowl();

    let rustleInterval: any;
    const playRustle = () => {
      if (timeOfDay === TimeOfDay.DAY) {
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.4);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        source.connect(f);
        f.connect(g);
        g.connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + 2);
      }
      rustleInterval = setTimeout(playRustle, 5000 + Math.random() * 7000);
    };
    if (!isNight) playRustle();

    let fireInterval: any;
    const playCrackle = () => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(20 + Math.random() * 50, ctx.currentTime);
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      fireInterval = setTimeout(playCrackle, 30 + Math.random() * 350);
    };
    playCrackle();

    const runFootsteps = () => {
      const isMoving = Math.abs((window as any).joystickX || 0) > 0.1 || Math.abs((window as any).joystickY || 0) > 0.1;
      if (isMoving && (gameState === GameState.PLAYING || gameState === GameState.TUTORIAL)) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90 + Math.random() * 20, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
      footstepIntervalRef.current = setTimeout(runFootsteps, 350 + Math.random() * 100);
    };
    runFootsteps();

    return () => {
      whiteNoise.stop();
      clearTimeout(fireInterval);
      clearTimeout(howlInterval);
      clearTimeout(rustleInterval);
      clearTimeout(footstepIntervalRef.current);
      if (ctx.state !== 'closed') {
        bgmOscRef.current.forEach(osc => osc.stop());
        ctx.close();
      }
      audioCtxRef.current = null;
      bgmRef.current = null;
    };
  }, [gameState, timeOfDay, settings.soundEnabled]);

  return null;
};

export default AmbientSounds;
