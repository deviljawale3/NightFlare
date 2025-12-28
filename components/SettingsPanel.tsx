import React, { useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import DeeJayLabsLogo from './DeeJayLabsLogo';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface SettingsState {
    // Graphics
    quality: 'low' | 'medium' | 'high' | 'ultra';
    particles: 'off' | 'reduced' | 'full';
    shadows: boolean;
    postProcessing: boolean;
    fpsLimit: 30 | 60 | 120;

    // Audio
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    ambientVolume: number;

    // Controls
    hapticFeedback: boolean;
    sensitivity: number;
    autoAim: boolean;
    controlLayout: 'A' | 'B' | 'C';

    // Accessibility
    colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reducedMotion: boolean;
    textSize: 'small' | 'medium' | 'large';
    highContrast: boolean;

    // Gameplay
    difficulty: 'easy' | 'normal' | 'hard';
    autoSave: boolean;
    tutorialHints: boolean;

    // Actions
    setQuality: (quality: SettingsState['quality']) => void;
    setParticles: (particles: SettingsState['particles']) => void;
    setShadows: (shadows: boolean) => void;
    setPostProcessing: (postProcessing: boolean) => void;
    setFpsLimit: (fpsLimit: SettingsState['fpsLimit']) => void;
    setMasterVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    setAmbientVolume: (volume: number) => void;
    setHapticFeedback: (enabled: boolean) => void;
    setSensitivity: (sensitivity: number) => void;
    setAutoAim: (enabled: boolean) => void;
    setControlLayout: (layout: SettingsState['controlLayout']) => void;
    setColorblindMode: (mode: SettingsState['colorblindMode']) => void;
    setReducedMotion: (enabled: boolean) => void;
    setTextSize: (size: SettingsState['textSize']) => void;
    setHighContrast: (enabled: boolean) => void;
    setDifficulty: (difficulty: SettingsState['difficulty']) => void;
    setAutoSave: (enabled: boolean) => void;
    setTutorialHints: (enabled: boolean) => void;
    resetToDefaults: () => void;
}

const defaultSettings = {
    quality: 'high' as const,
    particles: 'full' as const,
    shadows: true,
    postProcessing: true,
    fpsLimit: 60 as const,
    masterVolume: 70,
    musicVolume: 60,
    sfxVolume: 80,
    ambientVolume: 50,
    hapticFeedback: true,
    sensitivity: 5,
    autoAim: false,
    controlLayout: 'A' as const,
    colorblindMode: 'none' as const,
    reducedMotion: false,
    textSize: 'medium' as const,
    highContrast: false,
    difficulty: 'normal' as const,
    autoSave: true,
    tutorialHints: true
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            setQuality: (quality) => set({ quality }),
            setParticles: (particles) => set({ particles }),
            setShadows: (shadows) => set({ shadows }),
            setPostProcessing: (postProcessing) => set({ postProcessing }),
            setFpsLimit: (fpsLimit) => set({ fpsLimit }),

            setMasterVolume: (volume) => {
                set({ masterVolume: volume });
                soundEffects.setMasterVolume(volume / 100);
            },
            setMusicVolume: (volume) => set({ musicVolume: volume }),
            setSfxVolume: (volume) => {
                set({ sfxVolume: volume });
                soundEffects.setSFXVolume(volume / 100);
            },
            setAmbientVolume: (volume) => set({ ambientVolume: volume }),

            setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
            setSensitivity: (sensitivity) => set({ sensitivity }),
            setAutoAim: (enabled) => set({ autoAim: enabled }),
            setControlLayout: (layout) => set({ controlLayout: layout }),

            setColorblindMode: (mode) => set({ colorblindMode: mode }),
            setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
            setTextSize: (size) => set({ textSize: size }),
            setHighContrast: (enabled) => set({ highContrast: enabled }),

            setDifficulty: (difficulty) => set({ difficulty }),
            setAutoSave: (enabled) => set({ autoSave: enabled }),
            setTutorialHints: (enabled) => set({ tutorialHints: enabled }),

            resetToDefaults: () => set(defaultSettings)
        }),
        {
            name: 'nightflare-settings'
        }
    )
);

interface SettingsPanelProps {
    onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const settings = useSettingsStore();
    const [activeTab, setActiveTab] = useState<'graphics' | 'audio' | 'controls' | 'accessibility' | 'gameplay'>('graphics');

    const handleClose = () => {
        haptics.menuClose();
        soundEffects.closeMenu();
        onClose();
    };

    const tabs = [
        { id: 'graphics', label: 'Graphics', icon: '🎨' },
        { id: 'audio', label: 'Audio', icon: '🔊' },
        { id: 'controls', label: 'Controls', icon: '🎮' },
        { id: 'accessibility', label: 'Access', icon: '♿' },
        { id: 'gameplay', label: 'Gameplay', icon: '⚙️' }
    ] as const;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 safe-padding">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-6 max-w-2xl w-full border-2 border-white/10 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />

                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Settings</h2>
                        <p className="text-white/50 text-xs uppercase tracking-wider font-bold mt-1">Customize your experience</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white/70 hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto relative z-10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                haptics.tabSwitch();
                                soundEffects.switchTab();
                            }}
                            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-orange-600 text-white shadow-lg scale-105'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">

                    {/* Graphics Tab */}
                    {activeTab === 'graphics' && (
                        <div className="space-y-4">
                            <SettingSelect
                                label="Quality Preset"
                                value={settings.quality}
                                options={[
                                    { value: 'low', label: 'Low (Best Performance)' },
                                    { value: 'medium', label: 'Medium (Balanced)' },
                                    { value: 'high', label: 'High (Recommended)' },
                                    { value: 'ultra', label: 'Ultra (Best Quality)' }
                                ]}
                                onChange={(value) => settings.setQuality(value as any)}
                            />

                            <SettingSelect
                                label="Particle Effects"
                                value={settings.particles}
                                options={[
                                    { value: 'off', label: 'Off' },
                                    { value: 'reduced', label: 'Reduced' },
                                    { value: 'full', label: 'Full' }
                                ]}
                                onChange={(value) => settings.setParticles(value as any)}
                            />

                            <SettingToggle
                                label="Shadows"
                                value={settings.shadows}
                                onChange={settings.setShadows}
                            />

                            <SettingToggle
                                label="Post-Processing"
                                value={settings.postProcessing}
                                onChange={settings.setPostProcessing}
                            />

                            <SettingSelect
                                label="FPS Limit"
                                value={settings.fpsLimit}
                                options={[
                                    { value: 30, label: '30 FPS (Battery Saver)' },
                                    { value: 60, label: '60 FPS (Recommended)' },
                                    { value: 120, label: '120 FPS (High Refresh)' }
                                ]}
                                onChange={(value) => settings.setFpsLimit(Number(value) as any)}
                            />
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="space-y-4">
                            <SettingSlider
                                label="Master Volume"
                                value={settings.masterVolume}
                                onChange={settings.setMasterVolume}
                            />

                            <SettingSlider
                                label="Music Volume"
                                value={settings.musicVolume}
                                onChange={settings.setMusicVolume}
                            />

                            <SettingSlider
                                label="SFX Volume"
                                value={settings.sfxVolume}
                                onChange={settings.setSfxVolume}
                            />

                            <SettingSlider
                                label="Ambient Volume"
                                value={settings.ambientVolume}
                                onChange={settings.setAmbientVolume}
                            />
                        </div>
                    )}

                    {/* Controls Tab */}
                    {activeTab === 'controls' && (
                        <div className="space-y-4">
                            <SettingToggle
                                label="Haptic Feedback"
                                value={settings.hapticFeedback}
                                onChange={settings.setHapticFeedback}
                            />

                            <SettingSlider
                                label="Sensitivity"
                                value={settings.sensitivity}
                                onChange={settings.setSensitivity}
                                min={1}
                                max={10}
                            />

                            <SettingToggle
                                label="Auto-Aim Assist"
                                value={settings.autoAim}
                                onChange={settings.setAutoAim}
                            />

                            <SettingSelect
                                label="Control Layout"
                                value={settings.controlLayout}
                                options={[
                                    { value: 'A', label: 'Layout A (Default)' },
                                    { value: 'B', label: 'Layout B (Alternative)' },
                                    { value: 'C', label: 'Layout C (Custom)' }
                                ]}
                                onChange={(value) => settings.setControlLayout(value as any)}
                            />
                        </div>
                    )}

                    {/* Accessibility Tab */}
                    {activeTab === 'accessibility' && (
                        <div className="space-y-4">
                            <SettingSelect
                                label="Colorblind Mode"
                                value={settings.colorblindMode}
                                options={[
                                    { value: 'none', label: 'None' },
                                    { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
                                    { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
                                    { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' }
                                ]}
                                onChange={(value) => settings.setColorblindMode(value as any)}
                            />

                            <SettingToggle
                                label="Reduced Motion"
                                value={settings.reducedMotion}
                                onChange={settings.setReducedMotion}
                            />

                            <SettingSelect
                                label="Text Size"
                                value={settings.textSize}
                                options={[
                                    { value: 'small', label: 'Small' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'large', label: 'Large' }
                                ]}
                                onChange={(value) => settings.setTextSize(value as any)}
                            />

                            <SettingToggle
                                label="High Contrast"
                                value={settings.highContrast}
                                onChange={settings.setHighContrast}
                            />
                        </div>
                    )}

                    {/* Gameplay Tab */}
                    {activeTab === 'gameplay' && (
                        <div className="space-y-4">
                            <SettingSelect
                                label="Difficulty"
                                value={settings.difficulty}
                                options={[
                                    { value: 'easy', label: 'Easy (Casual)' },
                                    { value: 'normal', label: 'Normal (Recommended)' },
                                    { value: 'hard', label: 'Hard (Challenge)' }
                                ]}
                                onChange={(value) => settings.setDifficulty(value as any)}
                            />

                            <SettingToggle
                                label="Auto-Save"
                                value={settings.autoSave}
                                onChange={settings.setAutoSave}
                            />

                            <SettingToggle
                                label="Tutorial Hints"
                                value={settings.tutorialHints}
                                onChange={settings.setTutorialHints}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-between items-center relative z-10">
                    <button
                        onClick={() => {
                            settings.resetToDefaults();
                            haptics.buttonTap();
                            soundEffects.playSuccess();
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white text-sm font-bold uppercase tracking-wider transition-all"
                    >
                        Reset to Defaults
                    </button>

                    <DeeJayLabsLogo className="scale-75 opacity-30" />
                </div>
            </div>
        </div>
    );
};

// Helper Components
const SettingToggle: React.FC<{ label: string; value: boolean; onChange: (value: boolean) => void }> = ({ label, value, onChange }) => (
    <div className="flex justify-between items-center bg-white/5 rounded-xl p-4">
        <span className="text-white font-bold text-sm">{label}</span>
        <button
            onClick={() => {
                onChange(!value);
                haptics.buttonTap();
                soundEffects.clickButton();
            }}
            className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-green-600' : 'bg-gray-600'}`}
        >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`} />
        </button>
    </div>
);

const SettingSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }> = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div className="bg-white/5 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold text-sm">{label}</span>
            <span className="text-orange-500 font-mono font-bold text-sm">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
    </div>
);

const SettingSelect: React.FC<{ label: string; value: any; options: { value: any; label: string }[]; onChange: (value: any) => void }> = ({ label, value, options, onChange }) => (
    <div className="bg-white/5 rounded-xl p-4">
        <label className="text-white font-bold text-sm mb-2 block">{label}</label>
        <select
            value={value}
            onChange={(e) => {
                onChange(e.target.value);
                haptics.buttonTap();
                soundEffects.clickButton();
            }}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 font-bold text-sm border border-white/10 focus:border-orange-500 focus:outline-none"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

export default SettingsPanel;
