
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
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("AudioContext check failed", e);
        return;
      }
    }
    const ctx = audioCtxRef.current;

    if (!bgmRef.current) {
      bgmRef.current = ctx.createGain();
      bgmRef.current.connect(ctx.destination);
      bgmRef.current.gain.setValueAtTime(0.12, ctx.currentTime); // Slightly louder for presence

      // RICH ATMOSPHERIC SOUNDTRACK SYSTEM
      const createLayeredSynth = (freq: number, type: OscillatorType, detune: number = 0) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime(detune, ctx.currentTime);
        osc.connect(g);
        g.connect(bgmRef.current!);
        osc.start();
        return { osc, gain: g };
      };

      // Create rich layered soundtrack
      const layers = [
        // Deep sub-bass drone (foundation)
        createLayeredSynth(55, 'sine', 0),           // A1 - Deep rumble
        createLayeredSynth(55, 'sine', 5),           // Slightly detuned for width

        // Mid-bass pad (atmosphere)
        createLayeredSynth(110, 'triangle', 0),      // A2 - Warm pad
        createLayeredSynth(165, 'triangle', -8),     // E3 - Fifth harmony

        // Ethereal high layer (mystery)
        createLayeredSynth(440, 'sine', 0),          // A4 - Clear tone
        createLayeredSynth(659.25, 'sine', 12),      // E5 - Ethereal high

        // Tension layer (subtle dissonance)
        createLayeredSynth(466.16, 'sine', -15),     // A#4 - Tension note

        // Shimmer layer (magic/mystery)
        createLayeredSynth(1318.51, 'sine', 20),     // E6 - Shimmer
      ];

      // Set individual layer volumes for balance
      layers[0].gain.gain.setValueAtTime(0.15, ctx.currentTime);  // Sub-bass
      layers[1].gain.gain.setValueAtTime(0.12, ctx.currentTime);  // Sub-bass detune
      layers[2].gain.gain.setValueAtTime(0.10, ctx.currentTime);  // Mid pad
      layers[3].gain.gain.setValueAtTime(0.08, ctx.currentTime);  // Fifth
      layers[4].gain.gain.setValueAtTime(0.06, ctx.currentTime);  // Ethereal
      layers[5].gain.gain.setValueAtTime(0.05, ctx.currentTime);  // High ethereal
      layers[6].gain.gain.setValueAtTime(0.03, ctx.currentTime);  // Tension
      layers[7].gain.gain.setValueAtTime(0.04, ctx.currentTime);  // Shimmer

      bgmOscRef.current = layers.map(l => l.osc);
    } else {
      // Double check connections
      try {
        bgmRef.current.connect(ctx.destination);
      } catch (e) { }
    }

    // Dynamic music based on day/night with smooth transitions
    const isNight = timeOfDay === TimeOfDay.NIGHT;

    // Adjust all layers for day/night atmosphere
    bgmOscRef.current.forEach((osc, idx) => {
      let targetFreq = 0;

      if (isNight) {
        // NIGHT: Lower, darker, more ominous
        const nightFreqs = [
          41.20,    // E1 - Deeper sub-bass
          41.20,    // E1 detuned
          82.41,    // E2 - Dark pad
          123.47,   // B2 - Minor third (darker)
          329.63,   // E4 - Lower ethereal
          493.88,   // B4 - Darker high
          369.99,   // F#4 - More tension
          987.77    // B5 - Dark shimmer
        ];
        targetFreq = nightFreqs[idx];
      } else {
        // DAY: Brighter, hopeful, more energetic
        const dayFreqs = [
          55.00,    // A1 - Warm sub-bass
          55.00,    // A1 detuned
          110.00,   // A2 - Bright pad
          165.00,   // E3 - Perfect fifth (hopeful)
          440.00,   // A4 - Clear ethereal
          659.25,   // E5 - Bright high
          466.16,   // A#4 - Subtle tension
          1318.51   // E6 - Bright shimmer
        ];
        targetFreq = dayFreqs[idx];
      }

      // Smooth frequency transition (10 seconds)
      osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 10);
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
