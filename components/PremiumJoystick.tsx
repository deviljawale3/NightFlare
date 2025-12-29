import React, { useRef, useState, useEffect } from 'react';

interface PremiumJoystickProps {
    onMove: (x: number, y: number) => void;
    onEnd: () => void;
}

const PremiumJoystick: React.FC<PremiumJoystickProps> = ({ onMove, onEnd }) => {
    const joystickRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const maxDistance = 48; // Maximum distance from center

    const handleStart = (clientX: number, clientY: number) => {
        setIsActive(true);
        handleMove(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;

        // Calculate distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Limit to max distance
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }

        setPosition({ x: deltaX, y: deltaY });

        // Normalize to -1 to 1 range
        const normalizedX = deltaX / maxDistance;
        const normalizedY = deltaY / maxDistance;

        onMove(normalizedX, normalizedY);
    };

    const handleEnd = () => {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
        onEnd();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (!isActive) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isActive) return;
            handleMove(e.clientX, e.clientY);
        };

        const handleMouseUp = () => {
            if (isActive) handleEnd();
        };

        if (isActive) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isActive]);

    return (
        <div className="fixed bottom-6 left-6 z-50 pointer-events-auto md:hidden">
            {/* Outer Ring - Glassmorphism */}
            <div
                ref={joystickRef}
                className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative transition-all duration-300"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleMouseDown}
                style={{
                    boxShadow: isActive
                        ? '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(34,211,238,0.4)'
                        : '0 8px 32px rgba(0,0,0,0.4)'
                }}
            >
                {/* Animated Glow Effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`} />

                {/* Directional Indicators */}
                <div className="absolute inset-0 flex items-start justify-center pt-2">
                    <div className="text-white/20 text-xs font-bold">↑</div>
                </div>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <div className="text-white/20 text-xs font-bold">↓</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-start pl-2">
                    <div className="text-white/20 text-xs font-bold">←</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <div className="text-white/20 text-xs font-bold">→</div>
                </div>

                {/* Inner Stick */}
                <div
                    className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-lg transition-all duration-100"
                    style={{
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                        boxShadow: isActive
                            ? '0 4px 20px rgba(34,211,238,0.6)'
                            : '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Center Dot with Glow */}
                    <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse" />
                </div>

                {/* Active Ring Pulse */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />
                )}
            </div>

            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                Move
            </div>
        </div>
    );
};

export default PremiumJoystick;
