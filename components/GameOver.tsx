import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GameState } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';

// Cinematic background for defeat
const DefeatBackground: React.FC = () => {
  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={6} speed={0.4} opacity={0.3} color="#ff0000" />

      {/* Floating central "Loss" icon/symbol */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[0, 0, -5]}>
          <icosahedronGeometry args={[2, 0]} />
          <meshStandardMaterial
            color="#1a0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#ff0000" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#550000" intensity={1} />
    </group>
  );
};

const GameOver: React.FC = () => {
  const { score, wave, resetGame, setGameState, bestNight, getNightName, kills } = useGameStore();

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#050000] z-[999] pointer-events-auto overflow-hidden font-['Outfit']">

      {/* 3D Cinematic Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
          <color attach="background" args={['#050000']} />
          <Suspense fallback={null}>
            <DefeatBackground />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 max-w-lg w-full p-6 sm:p-12 text-center flex flex-col items-center animate-in zoom-in-95 fade-in duration-1000">
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 px-4 py-1.5 rounded-full mb-6">
          <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Connection Severed</span>
        </div>

        <h2 className="text-6xl sm:text-8xl font-black text-white mb-8 tracking-tighter italic uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
          Night Ended
        </h2>

        <div className="bg-gradient-to-br from-slate-900/90 to-black/95 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-10 mb-10 border-2 border-white/5 w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="mb-8 relative z-10">
            <div className="text-red-500 text-[11px] font-black uppercase tracking-widest mb-1 italic">Last Stand Position</div>
            <div className="text-white text-3xl font-black italic tracking-tighter">
              {wave} – {getNightName(wave)}
            </div>
            <div className="inline-block px-3 py-1 bg-white/5 rounded-lg text-white/40 text-[10px] font-black mt-2 uppercase tracking-widest">
              {kills} Enemies Purged
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-8 relative z-10">
            <div className="text-left">
              <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Total Score</div>
              <div className="text-white text-4xl font-black tabular-nums tracking-tighter">{score.toLocaleString()}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-[#00F2FF] text-[9px] font-black uppercase tracking-widest mb-1 italic">Stardust Earned</div>
              <div className="text-[#00F2FF] text-4xl font-black tabular-nums tracking-tighter">
                +{Math.floor(score / 100) + Math.floor(useGameStore.getState().resources.lightShards / 10)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full relative z-10">
          <button
            onClick={() => resetGame()}
            className="w-full group bg-white text-black py-5 sm:py-6 rounded-[2rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_15px_40px_rgba(255,255,255,0.2)] overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-white transition-colors">INITIATE RE-LINK</span>
          </button>
          <button
            onClick={() => setGameState(GameState.MAIN_MENU)}
            className="w-full bg-white/5 text-white/50 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            Return to Surface
          </button>
        </div>

        <div className="mt-12 opacity-30 hover:opacity-100 transition-opacity">
          <DeeJayLabsLogo />
        </div>
      </div>
    </div>
  );
};

export default GameOver;
