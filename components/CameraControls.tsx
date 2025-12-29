import React, { useState } from 'react';
import { useSettingsStore } from './SettingsPanel';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

const CameraControls: React.FC = () => {
    const [showControls, setShowControls] = useState(false);
    const settings = useSettingsStore();

    const cameraPresets = [
        { name: 'Default', value: 'DEFAULT' as const, angle: 45, distance: 25, icon: '🎮' },
        { name: 'Top Down', value: 'TOP_DOWN' as const, angle: 0, distance: 30, icon: '⬇️' },
        { name: 'Side View', value: 'SIDE' as const, angle: 90, distance: 20, icon: '↔️' },
        { name: 'Isometric', value: 'ISOMETRIC' as const, angle: 35, distance: 28, icon: '📐' },
        { name: 'Free 360°', value: 'FREE' as const, angle: settings.cameraAngle, distance: settings.cameraDistance, icon: '🔄' },
    ];

    const safeSfx = (fn: () => void) => {
        try { fn(); } catch (e) { console.warn('SFX Fail', e); }
    };

    const handlePresetChange = (preset: typeof cameraPresets[0]) => {
        safeSfx(() => {
            soundEffects?.clickButton?.();
            haptics?.buttonTap?.();
        });

        settings.setCameraPreset(preset.value);
        settings.setCameraAngle(preset.angle);
        settings.setCameraDistance(preset.distance);

        if (preset.value !== 'FREE') {
            setShowControls(false);
        }
    };

    const handleAngleChange = (delta: number) => {
        safeSfx(() => {
            soundEffects?.clickButton?.();
            haptics?.buttonTap?.();
        });
        const current = typeof settings.cameraAngle === 'number' ? settings.cameraAngle : parseFloat(settings.cameraAngle as any) || 45;
        const newAngle = (current + delta + 360) % 360;

        settings.setCameraAngle(newAngle);
        settings.setCameraPreset('FREE');
    };

    const handleZoomChange = (delta: number) => {
        safeSfx(() => {
            soundEffects?.clickButton?.();
            haptics?.buttonTap?.();
        });
        // SAFETY: Ensure we're working with numbers
        const current = typeof settings.cameraDistance === 'number' ? settings.cameraDistance : parseFloat(settings.cameraDistance as any) || 25;

        // Expanded Range: 5 to 60
        const newDistance = Math.max(5, Math.min(60, current + delta));

        settings.setCameraDistance(newDistance);
        settings.setCameraPreset('FREE');
    };

    return (
        <div className="fixed top-1/2 -translate-y-1/2 right-4 pointer-events-auto flex items-center flex-row-reverse" style={{ zIndex: 9999 }}>
            {/* Camera Button */}
            <button
                onClick={() => {
                    setShowControls(prev => !prev);
                    try {
                        soundEffects?.clickButton?.();
                        haptics?.buttonTap?.();
                    } catch (e) {
                        console.warn('SFX Error', e);
                    }
                }}
                className="w-14 h-14 bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center border-2 border-white/20"
                style={{ pointerEvents: 'auto' }}
                title="Camera Controls"
            >
                <span className="text-2xl pt-1">🎥</span>
            </button> {/* Camera Controls Panel */}
            {showControls && (
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mr-4 flex flex-col gap-3 min-w-[200px]">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <span>📷</span>
                            Camera Controls
                        </h3>
                        <button
                            onClick={() => {
                                try { soundEffects?.closeMenu?.(); } catch (e) { }
                                setShowControls(false);
                            }}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Presets */}
                    <div className="space-y-2 mb-4">
                        <p className="text-white/60 text-sm font-semibold mb-2">Quick Presets</p>
                        <div className="grid grid-cols-2 gap-2">
                            {cameraPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => handlePresetChange(preset)}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${settings.cameraPreset === preset.value
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                                        }`}
                                >
                                    <span>{preset.icon}</span>
                                    <span className="text-xs">{preset.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 360° Rotation Controls */}
                    {settings.cameraPreset === 'FREE' && (
                        <>
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/60 text-sm font-semibold">Rotation</p>
                                    <span className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded">
                                        {settings.cameraAngle}°
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAngleChange(-15)}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        ← 15°
                                    </button>
                                    <button
                                        onClick={() => handleAngleChange(-5)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        ← 5°
                                    </button>
                                    <button
                                        onClick={() => handleAngleChange(5)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        5° →
                                    </button>
                                    <button
                                        onClick={() => handleAngleChange(15)}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        15° →
                                    </button>
                                </div>
                            </div>

                            {/* Zoom Controls */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/60 text-sm font-semibold">Zoom</p>
                                    <span className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded">
                                        {settings.cameraDistance.toFixed(0)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleZoomChange(-5)}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        title="Zoom In"
                                    >
                                        🔍 +
                                    </button>
                                    <button
                                        onClick={() => handleZoomChange(-1)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => handleZoomChange(1)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => handleZoomChange(5)}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        title="Zoom Out"
                                    >
                                        🔍 −
                                    </button>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => handlePresetChange(cameraPresets[0])}
                                className="w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                🔄 Reset to Default
                            </button>
                        </>
                    )}

                    {/* Info */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-white/40 text-xs text-center">
                            {settings.cameraPreset === 'FREE'
                                ? '360° camera control active'
                                : `Using ${cameraPresets.find(p => p.value === settings.cameraPreset)?.name} preset`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraControls;
