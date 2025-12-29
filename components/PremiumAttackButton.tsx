import React, { useState } from 'react';

interface PremiumAttackButtonProps {
    onAttack: () => void;
    cooldown?: number;
}

const PremiumAttackButton: React.FC<PremiumAttackButtonProps> = ({ onAttack, cooldown = 0 }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [ripples, setRipples] = useState<number[]>([]);

    const handlePress = () => {
        setIsPressed(true);
        onAttack();

        // Create ripple effect
        const rippleId = Date.now();
        setRipples(prev => [...prev, rippleId]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(id => id !== rippleId));
        }, 600);
    };

    const handleRelease = () => {
        setIsPressed(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        handlePress();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        handleRelease();
    };

    const isOnCooldown = cooldown > 0;

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto md:hidden">
            {/* Attack Button */}
            <button
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 backdrop-blur-xl border-2 shadow-[0_8px_32px_rgba(239,68,68,0.4)] transition-all duration-200 relative overflow-hidden group ${isPressed ? 'scale-95' : 'scale-100'
                    } ${isOnCooldown ? 'border-gray-500/40 opacity-50' : 'border-red-500/40'
                    }`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                disabled={isOnCooldown}
                style={{
                    boxShadow: isPressed && !isOnCooldown
                        ? '0 4px 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.4)'
                        : '0 8px 32px rgba(239,68,68,0.4)'
                }}
            >
                {/* Pulse Effect */}
                {!isOnCooldown && (
                    <div className={`absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75 ${isPressed ? 'opacity-0' : ''}`} />
                )}

                {/* Icon */}
                <div className="relative z-10 text-4xl font-black transition-transform duration-200" style={{ transform: isPressed ? 'scale(0.9)' : 'scale(1)' }}>
                    ⚔️
                </div>

                {/* Ripple Effects */}
                {ripples.map(id => (
                    <div
                        key={id}
                        className="absolute inset-0 rounded-full bg-white/20 animate-ripple"
                        style={{
                            animation: 'ripple 0.6s ease-out'
                        }}
                    />
                ))}

                {/* Glow Ring */}
                {!isOnCooldown && (
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Cooldown Overlay */}
                {isOnCooldown && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <div className="text-white text-sm font-bold">{cooldown.toFixed(1)}s</div>
                    </div>
                )}

                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50" />
            </button>

            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                Attack
            </div>

            {/* Combo Indicator (optional enhancement) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 border border-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-orange-400 text-xs font-bold">TAP</div>
            </div>
        </div>
    );
};

// Add ripple animation to global styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

export default PremiumAttackButton;
