import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store';
import * as THREE from 'three';

const Minimap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resources } = useGameStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // Read direct from window to avoid React overhead
            const playerPosVec = (window as any).playerPos;
            const playerX = playerPosVec ? playerPosVec.x : 0;
            const playerZ = playerPosVec ? playerPosVec.z : 0;
            const enemies = (window as any).gameEnemies || [];

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Map settings
            const mapSize = 120;
            const worldSize = 50;
            const scale = mapSize / worldSize;
            const centerX = mapSize / 2;
            const centerY = mapSize / 2;

            // Draw map background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, mapSize, mapSize);

            // Draw border
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'; // Cyan-ish for premium
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, mapSize, mapSize);

            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const pos = (mapSize / 4) * i;
                ctx.beginPath();
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, mapSize);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, pos);
                ctx.lineTo(mapSize, pos);
                ctx.stroke();
            }

            // Draw collectables (resources)
            // Use store resources count as a hint? No, we need positions.
            // ResourceNodes are in the store!
            const nodes = useGameStore.getState().nodes;

            nodes.forEach(node => {
                const relX = node.position[0] - playerX;
                const relZ = node.position[2] - playerZ;
                const x = centerX + relX * scale;
                const y = centerY + relZ * scale;

                if (x >= 0 && x <= mapSize && y >= 0 && y <= mapSize) {
                    ctx.fillStyle = node.type === 'TREE' ? '#fbbf24' :
                        (node.type === 'ROCK' ? '#94a3b8' :
                            (node.type === 'FOOD' ? '#f87171' : '#22d3ee'));
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Draw enemies
            if (enemies && enemies.length > 0) {
                const time = Date.now() / 1000;
                enemies.forEach((enemy: any, index: number) => {
                    if (!enemy.health || enemy.health <= 0) return;

                    const ePos = enemy.position; // [x, y, z] or object
                    const eX = Array.isArray(ePos) ? ePos[0] : ePos.x;
                    const eZ = Array.isArray(ePos) ? ePos[2] : ePos.z;

                    const relX = eX - playerX;
                    const relZ = eZ - playerZ;

                    const x = centerX + relX * scale;
                    const y = centerY + relZ * scale;

                    if (x >= 0 && x <= mapSize && y >= 0 && y <= mapSize) {
                        const pulse = Math.sin(time * 3 + index) * 0.3 + 1;
                        const radius = 2.5 * pulse;

                        ctx.shadowBlur = 4;
                        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
                        ctx.fillStyle = enemy.type === 'BRUTE' ? '#ff4400' : '#ff0000';
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            }

            // Draw player (center)
            ctx.save();
            ctx.translate(centerX, centerY);

            // Get player rotation if possible, otherwise just point up
            // Assuming player is always "up" relative to camera if camera follows? 
            // In this minimap implementation logic, we are translating world coordinates relative to player center. 
            // So objects move around the player. The player is fixed at center.

            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(-4, 4);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Run once on mount

    return (
        <div className="relative group">
            {/* Glassmorphism Container with Glow */}
            <div className="relative rounded-2xl bg-black/20 backdrop-blur-xl border-2 border-cyan-400/40 shadow-[0_8px_32px_rgba(6,182,212,0.3)] p-2 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_8px_40px_rgba(6,182,212,0.4)]">
                {/* Animated Glow Ring */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    width={120}
                    height={120}
                    className="rounded-xl relative z-10"
                />

                {/* Corner Accent */}
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
            </div>

            {/* Label */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400/60 font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:text-cyan-400">
                ◈ RADAR ◈
            </div>
        </div>
    );
};

export default Minimap;
