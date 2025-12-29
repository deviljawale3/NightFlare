import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';

/**
 * Screen Effects Component
 * Provides visual polish effects like damage vignette, low health pulse, critical flash
 */

const ScreenEffects: React.FC = () => {
    const { playerStats } = useGameStore();
    const [damageFlash, setDamageFlash] = useState(false);
    const [criticalFlash, setCriticalFlash] = useState(false);
    const [healFlash, setHealFlash] = useState(false);

    // Calculate health percentage
    const healthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;
    const isLowHealth = healthPercent <= 25;
    const isCriticalHealth = healthPercent <= 10;

    // Listen for damage events
    useEffect(() => {
        const handleDamage = () => {
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 200);
        };

        const handleCritical = () => {
            setCriticalFlash(true);
            setTimeout(() => setCriticalFlash(false), 300);
        };

        const handleHeal = () => {
            setHealFlash(true);
            setTimeout(() => setHealFlash(false), 400);
        };

        window.addEventListener('player-damage', handleDamage);
        window.addEventListener('critical-hit', handleCritical);
        window.addEventListener('player-heal', handleHeal);

        return () => {
            window.removeEventListener('player-damage', handleDamage);
            window.removeEventListener('critical-hit', handleCritical);
            window.removeEventListener('player-heal', handleHeal);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Damage Vignette (always present, intensity based on health) */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(139, 0, 0, 0.3) 100%)',
                    opacity: isLowHealth ? (isCriticalHealth ? 0.6 : 0.4) : 0
                }}
            />

            {/* Low Health Pulse (red edges) */}
            {isLowHealth && (
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 40%, rgba(220, 38, 38, 0.2) 100%)',
                        animationDuration: isCriticalHealth ? '1s' : '2s'
                    }}
                />
            )}

            {/* Critical Health Warning (intense red pulse) */}
            {isCriticalHealth && (
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                        boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.5)',
                        animationDuration: '0.8s'
                    }}
                />
            )}

            {/* Damage Flash (red flash when hit) */}
            {damageFlash && (
                <div
                    className="absolute inset-0 bg-red-600/30 animate-in fade-in duration-100"
                    style={{
                        animation: 'damageFlash 0.2s ease-out'
                    }}
                />
            )}

            {/* Critical Hit Flash (yellow/orange flash) */}
            {criticalFlash && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 via-orange-500/40 to-red-500/40 animate-in fade-in duration-150"
                    style={{
                        animation: 'criticalFlash 0.3s ease-out'
                    }}
                />
            )}

            {/* Heal Flash (green flash when healing) */}
            {healFlash && (
                <div
                    className="absolute inset-0 bg-green-500/20 animate-in fade-in duration-200"
                    style={{
                        animation: 'healFlash 0.4s ease-out'
                    }}
                />
            )}

            {/* Corner Health Indicators (visual feedback) */}
            {isLowHealth && (
                <>
                    {/* Top-left corner */}
                    <div
                        className="absolute top-0 left-0 w-32 h-32 opacity-40"
                        style={{
                            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                            animation: isCriticalHealth ? 'pulse 0.8s infinite' : 'pulse 2s infinite'
                        }}
                    />
                    {/* Top-right corner */}
                    <div
                        className="absolute top-0 right-0 w-32 h-32 opacity-40"
                        style={{
                            background: 'linear-gradient(225deg, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                            animation: isCriticalHealth ? 'pulse 0.8s infinite' : 'pulse 2s infinite'
                        }}
                    />
                    {/* Bottom-left corner */}
                    <div
                        className="absolute bottom-0 left-0 w-32 h-32 opacity-40"
                        style={{
                            background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                            animation: isCriticalHealth ? 'pulse 0.8s infinite' : 'pulse 2s infinite'
                        }}
                    />
                    {/* Bottom-right corner */}
                    <div
                        className="absolute bottom-0 right-0 w-32 h-32 opacity-40"
                        style={{
                            background: 'linear-gradient(315deg, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                            animation: isCriticalHealth ? 'pulse 0.8s infinite' : 'pulse 2s infinite'
                        }}
                    />
                </>
            )}

            {/* Screen shake container (for future use) */}
            <style>{`
                @keyframes damageFlash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes criticalFlash {
                    0% { opacity: 1; transform: scale(1.05); }
                    50% { opacity: 0.8; }
                    100% { opacity: 0; transform: scale(1); }
                }

                @keyframes healFlash {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0; }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default ScreenEffects;
