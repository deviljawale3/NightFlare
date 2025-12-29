
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import Trophy from './Trophy';
import DeeJayLabsLogo from './DeeJayLabsLogo';

// Hyper-speed warp tunnel effect
const WarpTunnel: React.FC = () => {
  return (
    <group>
      <Stars radius={80} depth={50} count={8000} factor={4} saturation={0} fade speed={6} />
      <Stars radius={150} depth={50} count={3000} factor={6} saturation={1} fade speed={4} />
      {/* Color streaks */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, -20]} rotation={[0, 0, Math.random() * Math.PI]}>
          <planeGeometry args={[0.2, 50]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#ff6b00" : "#00f2ff"} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Central animated core
const MenuCore: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref} position={[0, 1, -5]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <MeshDistortMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} distort={0.4} speed={3} />
      </mesh>
      <pointLight position={[0, 1, -4]} intensity={5} color="#ff6b00" distance={15} />
    </Float>
  );
};

const LevelClearMenu: React.FC = () => {
  const { score, level, nextLevel, kills } = useGameStore();

  const getNextLevelName = () => {
    const nextL = level + 1;
    if (nextL % 3 === 1) return "Whispering Woods";
    if (nextL % 3 === 2) return "Magma Threshold";
    return "Frozen Void";
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-[150] pointer-events-auto overflow-hidden animate-in fade-in duration-700 font-['Outfit']">

      {/* Background Layer 1: Deep Space Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,5,5,1)_0%,_rgba(0,0,0,1)_100%)]" />

      {/* Composite 3D Layer: Warp Tunnel + Trophy */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[5, 10, 5]} intensity={4} color="#ffffff" />
          <pointLight position={[-5, -10, -5]} intensity={2} color="#ff6b00" />

          <WarpTunnel />

          {/* Trophy closer to camera */}
          <Float speed={2.5} rotationIntensity={1.2} floatIntensity={0.8}>
            <group position={[0, 0, 4]} scale={0.7}>
              <Trophy />
            </group>
          </Float>

          {/* Core in the distance */}
          <MenuCore />

          <Sparkles count={80} scale={12} size={3} speed={0.4} opacity={0.5} color="#ffaa00" />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center h-full justify-center pointer-events-none">

        {/* Victory Header */}
        <div className="mb-4 sm:mb-6 animate-in slide-in-from-top-12 duration-700">
          <h1 className="text-[12vw] sm:text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(255,107,0,0.6)]">
            VICTORY
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-orange-500" />
            <p className="text-orange-500 font-black tracking-[0.4em] text-[10px] sm:text-xs uppercase">
              LEVEL {level} COMPLETE
            </p>
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-orange-500" />
          </div>
        </div>

        {/* Empty space for 3D Trophy visible through UI */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 relative mb-4 sm:mb-8" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="bg-black/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl group hover:bg-white/5 transition-all">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 text-left">Score Acquired</div>
            <div className="text-white text-3xl sm:text-4xl font-black text-left tabular-nums tracking-tighter group-hover:text-orange-400 transition-colors">{score.toLocaleString()}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl group hover:bg-white/5 transition-all">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 text-left">Shadows Purged</div>
            <div className="text-white text-3xl sm:text-4xl font-black text-left tabular-nums tracking-tighter group-hover:text-red-400 transition-colors">{kills}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm animate-in slide-in-from-bottom-12 duration-700 delay-500">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            NEXT ZONE: {getNextLevelName()}
          </div>

          <button
            onClick={nextLevel}
            className="w-full group relative bg-white text-black py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden italic tracking-tighter pointer-events-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              INITIATE WARP <span className="text-lg opacity-40 group-hover:translate-x-1 transition-transform">➔</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 opacity-40 hover:opacity-100 transition-opacity">
          <DeeJayLabsLogo className="scale-110" />
        </div>
      </div>

    </div>
  );
};

export default LevelClearMenu;
