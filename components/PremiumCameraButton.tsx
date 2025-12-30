import React, { useState } from 'react';

interface PremiumCameraButtonProps {
    onToggle: () => void;
    isActive?: boolean;
}

const PremiumCameraButton: React.FC<PremiumCameraButtonProps> = ({ onToggle, isActive = false }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        setIsPressed(true);
        onToggle();
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <div className="fixed top-20 right-6 z-50 pointer-events-auto md:hidden">
            {/* Camera Button */}
            <button
                className={`w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 relative overflow-hidden group ${isPressed ? 'scale-90' : 'scale-100'
                    } ${isActive ? 'bg-cyan-500/30 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'hover:bg-white/10 hover:border-white/30'
                    }`}
                onClick={handlePress}
                style={{
                    boxShadow: isActive
                        ? '0 0 25px rgba(34,211,238,0.3), inset 0 0 10px rgba(34,211,238,0.2)'
                        : '0 8px 32px rgba(0,0,0,0.5)'
                }}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-lg transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'
                    }`} />

                {/* Camera Icon */}
                <div className="relative z-10 text-xl transition-transform duration-200" style={{ transform: isPressed ? 'scale(0.85)' : 'scale(1)' }}>
                    📷
                </div>

                {/* Active Indicator */}
                {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse border border-white/30" />
                )}

                {/* Press Effect */}
                {isPressed && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                )}

                {/* Inner Shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50" />
            </button>

            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                Camera
            </div>

            {/* Tooltip */}
            <div className="absolute -left-24 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="text-white text-xs font-medium whitespace-nowrap">
                    {isActive ? 'Free Cam' : 'Toggle Cam'}
                </div>
                {/* Arrow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-black/80" />
            </div>
        </div>
    );
};

export default PremiumCameraButton;
