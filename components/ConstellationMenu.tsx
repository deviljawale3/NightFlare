import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { ConstellationNode } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface ConstellationMenuProps {
    onClose: () => void;
}

const SphereNode: React.FC<{
    node: ConstellationNode;
    isSelected: boolean;
    isUnlocked: boolean;
    canUnlock: boolean;
    onClick: () => void;
    position: [number, number, number];
}> = ({ node, isSelected, isUnlocked, canUnlock, onClick, position }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            if (isSelected) {
                const s = 1.0 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
                meshRef.current.scale.setScalar(s);
            } else {
                meshRef.current.scale.setScalar(hovered ? 1.2 : 1.0);
            }
        }
    });

    const color = isUnlocked ? '#8b5cf6' : (canUnlock ? '#f59e0b' : '#334155');
    const emissive = isUnlocked ? '#8b5cf6' : (canUnlock ? '#f59e0b' : '#000000');

    return (
        <group position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => { setHovered(true); soundEffects.hoverButton(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            ref={meshRef}
        >
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={isSelected ? 5 : (isUnlocked ? 2 : 0)}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
            {/* Ring for selection */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.45, 32]} />
                    <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
                </mesh>
            )}
            {/* Label */}
            {hovered && !isSelected && (
                <Html distanceFactor={10}>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap backdrop-blur-md border border-white/10">
                        {node.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

const ConnectionLine: React.FC<{ start: [number, number, number], end: [number, number, number], active: boolean }> = ({ start, end, active }) => {
    return (
        <Line
            points={[start, end]}
            color={active ? "#8b5cf6" : "#334155"}
            lineWidth={active ? 2 : 1}
            transparent
            opacity={active ? 0.8 : 0.3}
        />
    );
};

const ConstellationScene: React.FC<{ onNodeSelect: (id: string) => void, selectedId: string | null }> = ({ onNodeSelect, selectedId }) => {
    const { constellation, stardust } = useGameStore();

    // Helper to map 2D percentages to 3D Sphere Surface
    const getPos = (pos: { x: number, y: number }): [number, number, number] => {
        // Map X (0-100) to Longitude (-180 to 180)
        // Map Y (0-100) to Latitude (90 to -90)
        const radius = 8;
        const lon = ((pos.x / 100) * 360) - 180;
        const lat = 90 - ((pos.y / 100) * 180);

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 90) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return [x, y, z];
    };

    return (
        <group>
            {/* Central Core */}
            <mesh>
                <sphereGeometry args={[3, 32, 32]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh>
                <sphereGeometry args={[3.05, 32, 32]} />
                <meshBasicMaterial color="#4c1d95" wireframe transparent opacity={0.1} />
            </mesh>

            {/* Nodes */}
            {constellation.map(node => {
                const pos = getPos(node.position);
                const isUnlocked = node.currentLevel > 0;
                const reqMet = node.requiredNodes.length === 0 || node.requiredNodes.every(id => constellation.find(n => n.id === id)?.currentLevel! > 0);
                const canUnlock = !isUnlocked && stardust >= node.cost && reqMet && node.currentLevel < node.maxLevel;

                return (
                    <group key={node.id}>
                        <SphereNode
                            node={node}
                            isSelected={selectedId === node.id}
                            isUnlocked={isUnlocked}
                            canUnlock={canUnlock}
                            onClick={() => onNodeSelect(node.id)}
                            position={pos}
                        />
                        {/* Connections */}
                        {node.requiredNodes.map(reqId => {
                            const reqNode = constellation.find(n => n.id === reqId);
                            if (reqNode) {
                                return (
                                    <ConnectionLine
                                        key={`${node.id}-${reqId}`}
                                        start={pos}
                                        end={getPos(reqNode.position)}
                                        active={isUnlocked}
                                    />
                                );
                            }
                            return null;
                        })}
                    </group>
                );
            })}
        </group>
    );
};

const ConstellationMenu: React.FC<ConstellationMenuProps> = ({ onClose }) => {
    const { constellation, stardust, unlockConstellationNode } = useGameStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedNode = constellation.find(n => n.id === selectedId);

    const handleUnlock = () => {
        if (selectedNode) {
            const success = unlockConstellationNode(selectedNode.id);
            if (success) {
                soundEffects.levelUp();
                // Particle burst?
            } else {
                soundEffects.playError();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-500">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-10 pointer-events-none">
                <div>
                    <h1 className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 font-orbitron drop-shadow-lg leading-tight">
                        ASTRAL NEXUS
                    </h1>
                    <p className="text-white/60 font-mono text-[10px] sm:text-sm mt-1">CONSTELLATION MAP // <span className="text-cyan-400">UNLOCKED: {constellation.filter(n => n.currentLevel > 0).length}/{constellation.length}</span></p>
                </div>
                <div className="flex flex-col items-end pointer-events-auto gap-2">
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full backdrop-blur-md transition-all border border-white/10 text-xs sm:text-base">
                        EXIT VISUALIZER
                    </button>
                    <div className="bg-slate-900/80 p-2 sm:p-4 rounded-2xl border border-yellow-500/30 flex items-center gap-2 sm:gap-3 backdrop-blur-xl">
                        <span className="text-xl sm:text-3xl">✨</span>
                        <div>
                            <div className="text-[8px] sm:text-xs text-yellow-500/80 font-bold uppercase tracking-wider">Stardust Available</div>
                            <div className="text-lg sm:text-2xl font-black text-white leading-none">{stardust.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#4c1d95" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />

                <ConstellationScene onNodeSelect={setSelectedId} selectedId={selectedId} />

                <OrbitControls enablePan={false} minDistance={10} maxDistance={30} autoRotate={!selectedId} autoRotateSpeed={0.5} />
            </Canvas>

            {/* Details Panel Overlay - Mobile Optimized */}
            {selectedNode && (
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-2xl pointer-events-auto animate-in slide-in-from-bottom-12 duration-500">
                    <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-800 to-black rounded-2xl flex items-center justify-center text-3xl sm:text-5xl border border-white/5 shadow-inner shrink-0">
                                    {selectedNode.icon}
                                </div>
                                {/* Mobile Title & Badges */}
                                <div className="sm:hidden flex-1">
                                    <h2 className="text-xl font-black text-white leading-tight">{selectedNode.name}</h2>
                                    <div className="flex gap-3 mt-2">
                                        <Badge label="LVL" value={`${selectedNode.currentLevel}/${selectedNode.maxLevel}`} />
                                        <Badge label="EFFECT" value={`+${selectedNode.currentLevel * selectedNode.effectValue}%`} color="text-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full">
                                <h2 className="text-3xl font-black text-white mb-2 hidden sm:block">{selectedNode.name}</h2>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">{selectedNode.description}</p>

                                <div className="flex gap-4 mb-4 hidden sm:flex">
                                    <Badge label="LEVEL" value={`${selectedNode.currentLevel} / ${selectedNode.maxLevel}`} />
                                    <Badge label="EFFECT" value={`+${selectedNode.currentLevel * selectedNode.effectValue}${selectedNode.effectType.includes('PERCENT') ? '%' : ''}`} color="text-cyan-400" />
                                </div>

                                <div className="flex flex-col items-center justify-center self-center shrink-0 w-full">
                                    {selectedNode.currentLevel >= selectedNode.maxLevel ? (
                                        <div className="text-green-400 font-black tracking-widest border border-green-500/30 px-6 py-3 rounded-xl bg-green-500/10 w-full text-center">
                                            MAXED
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleUnlock}
                                            disabled={stardust < selectedNode.cost}
                                            className={`flex items-center justify-center w-full py-3 rounded-xl transition-all gap-3
                                                 ${stardust >= selectedNode.cost
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] text-white'
                                                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                                }`}
                                        >
                                            <span className="font-black text-base sm:text-lg tracking-wider">UNLOCK</span>
                                            <span className="text-xs font-mono opacity-80 bg-black/20 px-2 py-0.5 rounded">{selectedNode.cost} ✨</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Badge: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = "text-white" }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
);

export default ConstellationMenu;
