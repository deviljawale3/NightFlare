
import React, { useState, useEffect } from 'react';

/**
 * OrientationLock Component
 * Detects if the user is in portrait mode on a mobile device and prompts them to rotate.
 */
const OrientationLock: React.FC = () => {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Check if user is on a mobile device first
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                setIsPortrait(window.innerHeight > window.innerWidth);
            }
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (!isPortrait) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500 pointer-events-auto">
            <div className="relative w-24 h-40 mb-10">
                {/* Phone Outline */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.05)]" />
                {/* Rotating Inner Phone */}
                <div className="absolute inset-2 border-2 border-cyan-400 rounded-[1.5rem] flex items-center justify-center animate-phone-rotate">
                    <span className="text-4xl">🎮</span>
                </div>

                {/* Arrow Decoration */}
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-4xl text-cyan-400 animate-bounce-sideways">
                    ➡️
                </div>
            </div>

            <h1 className="text-white text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">
                ROTATE FOR <span className="text-cyan-400">OPTIMAL</span> PLAY
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] max-w-[250px] leading-relaxed">
                NightFlare is designed for cinematic landscape survival.
            </p>

            <div className="mt-12 text-[8px] font-black text-white/20 uppercase tracking-widest px-4 py-2 border border-white/5 rounded-full">
                DeeJay Labs Hardware Protocol 04
            </div>

            <style>{`
                @keyframes phone-rotate {
                    0% { transform: rotate(0deg); }
                    30% { transform: rotate(90deg); }
                    70% { transform: rotate(90deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes bounce-sideways {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(15px, -50%); }
                }
            `}</style>
        </div>
    );
};

export default OrientationLock;
