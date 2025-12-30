import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';

/**
 * Screen Effects Component
 * Provides visual polish effects like damage vignette, low health pulse, critical flash
 */

const ScreenEffects: React.FC = () => {
    const { playerStats, combo } = useGameStore();
    const [damageFlash, setDamageFlash] = useState(false);
    const [criticalFlash, setCriticalFlash] = useState(false);
    const [healFlash, setHealFlash] = useState(false);
    const [impactFlash, setImpactFlash] = useState(false);
    const [isDashing, setIsDashing] = useState(false);

    // Calculate health percentage
    const healthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;
    const isLowHealth = healthPercent <= 25;
    const isCriticalHealth = healthPercent <= 10;

    // Listen for events
    useEffect(() => {
        const handleDamage = () => { setDamageFlash(true); setTimeout(() => setDamageFlash(false), 200); };
        const handleCritical = () => { setCriticalFlash(true); setTimeout(() => setCriticalFlash(false), 300); };
        const handleHeal = () => { setHealFlash(true); setTimeout(() => setHealFlash(false), 400); };
        const handleImpact = () => { setImpactFlash(true); setTimeout(() => setImpactFlash(false), 100); };
        const handleDashStart = () => setIsDashing(true);
        const handleDashEnd = () => setIsDashing(false);

        window.addEventListener('player-damage', handleDamage);
        window.addEventListener('critical-hit', handleCritical);
        window.addEventListener('player-heal', handleHeal);
        window.addEventListener('attack-impact', handleImpact);
        window.addEventListener('player-dash-start', handleDashStart);
        window.addEventListener('player-dash-end', handleDashEnd);

        return () => {
            window.removeEventListener('player-damage', handleDamage);
            window.removeEventListener('critical-hit', handleCritical);
            window.removeEventListener('player-heal', handleHeal);
            window.removeEventListener('attack-impact', handleImpact);
            window.removeEventListener('player-dash-start', handleDashStart);
            window.removeEventListener('player-dash-end', handleDashEnd);
        };
    }, []);

    const blurIntensity = isDashing ? 15 : Math.min(20, combo * 1.5);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {/* RADIAL SPEED BLUR OVERLAY */}
            <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: blurIntensity > 0 ? 0.4 : 0,
                    backdropFilter: `blur(${blurIntensity}px)`,
                    WebkitBackdropFilter: `blur(${blurIntensity}px)`,
                    maskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)',
                }}
            />

            {/* CHROMATIC ABERRATION ON IMPACT */}
            {impactFlash && (
                <div className="absolute inset-0 bg-cyan-500/5 mix-blend-screen animate-pulse" style={{ transform: 'translateX(2px)' }} />
            )}

            {/* Impact Flash */}
            {impactFlash && (
                <div className="absolute inset-0 bg-white/20 backdrop-invert-[0.1] animate-in fade-in duration-75" />
            )}

            {/* Damage Vignette */}
            <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                    background: 'radial-gradient(circle at center, transparent 20%, rgba(139, 0, 0, 0.4) 100%)',
                    opacity: isLowHealth ? (isCriticalHealth ? 0.7 : 0.45) : 0
                }}
            />

            {/* Low Health Pulse */}
            {isLowHealth && (
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 35%, rgba(220, 38, 38, 0.25) 100%)',
                        animationDuration: isCriticalHealth ? '0.8s' : '1.5s'
                    }}
                />
            )}

            {/* Damage Flash */}
            {damageFlash && (
                <div className="absolute inset-0 bg-red-600/40 mix-blend-multiply" />
            )}

            {/* Heal Flash */}
            {healFlash && (
                <div className="absolute inset-0 bg-green-500/20 mix-blend-screen" />
            )}

            <style>{`
                @keyframes blurFade { 0% { opacity: 0; } 100% { opacity: 0.4; } }
            `}</style>
        </div>
    );
};

export default ScreenEffects;
