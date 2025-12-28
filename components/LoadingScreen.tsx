import React, { useState, useEffect } from 'react';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const [tip, setTip] = useState('');

    const tips = [
        "The Nightflare's light is your only protection against the shadows...",
        "Collect Light Shards to upgrade your weapons and abilities",
        "Each night brings stronger enemies - prepare wisely",
        "Use Nova attacks strategically - they take time to recharge",
        "Resources respawn after each wave - plan your gathering",
        "Higher waves unlock better crafting recipes",
        "Challenge friends in the Shadow Arena for glory",
        "Daily login rewards help you survive longer",
        "Watch your health - healing items are precious",
        "The minimap shows nearby enemies - use it wisely"
    ];

    useEffect(() => {
        // Random tip
        setTip(tips[Math.floor(Math.random() * tips.length)]);

        // Splash screen phase (2 seconds)
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        // Progress simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onComplete, 500); // Small delay before completing
                    return 100;
                }
                return prev + Math.random() * 15; // Random increment for realistic feel
            });
        }, 100);

        return () => {
            clearTimeout(splashTimer);
            clearInterval(progressInterval);
        };
    }, []);

    if (showSplash) {
        // Splash Screen - DeeJay Labs branding
        return (
            <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-purple-900/20" />

                {/* Animated particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-orange-500/30 rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>

                {/* Logo with animation */}
                <div className="relative z-10 animate-in zoom-in fade-in duration-1000">
                    <div className="mb-8 transform scale-150">
                        <DeeJayLabsLogo />
                    </div>
                    <div className="text-white/40 text-xs uppercase tracking-[0.3em] text-center font-bold animate-pulse">
                        Powered by Innovation
                    </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent animate-pulse" />
            </div>
        );
    }

    // Loading Screen - Game assets
    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center overflow-hidden">
            {/* Animated fire background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">

                {/* Game Logo */}
                <div className="mb-12 text-center animate-in slide-in-from-top-8 duration-700">
                    <h1 className="text-7xl sm:text-8xl font-black text-white tracking-tighter italic leading-none select-none drop-shadow-[0_10px_60px_rgba(255,107,0,0.8)] mb-2">
                        NIGHT<span className="text-[#ff6b00]">FLARE</span>
                    </h1>
                    <div className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold">
                        Survive the Eternal Shadow
                    </div>
                </div>

                {/* Animated flame icon */}
                <div className="mb-8 animate-bounce">
                    <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(255,107,0,0.8)]">
                        🔥
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full mb-6 animate-in fade-in duration-500 delay-300">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/50 text-xs uppercase font-bold tracking-wider">Loading</span>
                        <span className="text-orange-500 text-sm font-mono font-bold">{Math.min(100, Math.floor(progress))}%</span>
                    </div>

                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        >
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Tip of the day */}
                <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-in fade-in duration-500 delay-500">
                    <div className="text-orange-500 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                        <span>💡</span> TIP
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                        {tip}
                    </p>
                </div>

                {/* Loading spinner */}
                <div className="mt-8 flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider animate-pulse">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold">Preparing your journey...</span>
                </div>
            </div>

            {/* Bottom branding */}
            <div className="absolute bottom-8 opacity-30">
                <DeeJayLabsLogo className="scale-75" />
            </div>
        </div>
    );
};

export default LoadingScreen;
