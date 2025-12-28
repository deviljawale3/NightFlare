import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store';

interface MinimapProps {
    playerPosition?: { x: number; z: number };
}

const Minimap: React.FC<MinimapProps> = ({ playerPosition }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resources } = useGameStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Map settings
        const mapSize = 120;
        const worldSize = 50; // Adjust based on your game world size
        const scale = mapSize / worldSize;
        const centerX = mapSize / 2;
        const centerY = mapSize / 2;

        // Draw map background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, mapSize, mapSize);

        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, mapSize, mapSize);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
        if (resources) {
            // Draw wood (brown dots)
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5;
                const x = centerX + Math.cos(angle) * 30;
                const y = centerY + Math.sin(angle) * 30;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw light shards (yellow sparkles)
            ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 * i) / 3 + Math.PI / 6;
                const x = centerX + Math.cos(angle) * 40;
                const y = centerY + Math.sin(angle) * 40;
                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Add glow
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Draw enemies (red dots with pulse) - Get from global window object
        const enemies = (window as any).gameEnemies || [];
        if (enemies && enemies.length > 0) {
            const time = Date.now() / 1000;
            enemies.forEach((enemy: any, index: number) => {
                if (!enemy.health || enemy.health <= 0) return;

                // Calculate position relative to player
                const relX = (enemy.position?.[0] || 0) - (playerPosition?.x || 0);
                const relZ = (enemy.position?.[2] || 0) - (playerPosition?.z || 0);

                const x = centerX + relX * scale;
                const y = centerY + relZ * scale;

                // Only draw if within map bounds
                if (x >= 0 && x <= mapSize && y >= 0 && y <= mapSize) {
                    // Pulsing effect
                    const pulse = Math.sin(time * 3 + index) * 0.3 + 1;
                    const radius = 3 * pulse;

                    // Draw glow
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Draw core
                    ctx.fillStyle = 'rgba(255, 100, 100, 1)';
                    ctx.beginPath();
                    ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Draw player (center, blue triangle pointing up)
        ctx.save();
        ctx.translate(centerX, centerY);

        // Player glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 150, 255, 0.8)';

        // Player triangle
        ctx.fillStyle = 'rgba(0, 150, 255, 1)';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 4);
        ctx.lineTo(4, 4);
        ctx.closePath();
        ctx.fill();

        // Player border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw Nightflare core (center, orange circle)
        ctx.fillStyle = 'rgba(255, 107, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 107, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw core border
        ctx.strokeStyle = 'rgba(255, 150, 0, 1)';
        ctx.lineWidth = 2;
        ctx.stroke();

    }, [playerPosition, resources]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={120}
                height={120}
                className="rounded-xl border-2 border-white/20 shadow-2xl"
            />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] text-white/50 font-bold uppercase tracking-wider whitespace-nowrap">
                Tactical Map
            </div>
        </div>
    );
};

export default Minimap;
