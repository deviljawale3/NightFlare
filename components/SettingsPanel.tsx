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
    movementMode: 'joystick' | 'touch';

    // Accessibility
    colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reducedMotion: boolean;
    textSize: 'small' | 'medium' | 'large';
    highContrast: boolean;

    // Gameplay
    difficulty: 'easy' | 'normal' | 'hard';
    autoSave: boolean;
    tutorialHints: boolean;

    // UI State
    isOpen: boolean;

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
    setMovementMode: (mode: SettingsState['movementMode']) => void;
    setColorblindMode: (mode: SettingsState['colorblindMode']) => void;
    setReducedMotion: (enabled: boolean) => void;
    setTextSize: (size: SettingsState['textSize']) => void;
    setHighContrast: (enabled: boolean) => void;
    setDifficulty: (difficulty: SettingsState['difficulty']) => void;
    setAutoSave: (enabled: boolean) => void;
    setTutorialHints: (enabled: boolean) => void;

    // UI Actions
    setIsOpen: (isOpen: boolean) => void;
    toggleSettings: () => void;

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
    movementMode: 'joystick' as const,
    colorblindMode: 'none' as const,
    reducedMotion: false,
    textSize: 'medium' as const,
    highContrast: false,
    difficulty: 'normal' as const,
    autoSave: true,
    tutorialHints: true,
    isOpen: false
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
            setMovementMode: (mode) => set({ movementMode: mode }),

            setColorblindMode: (mode) => set({ colorblindMode: mode }),
            setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
            setTextSize: (size) => set({ textSize: size }),
            setHighContrast: (enabled) => set({ highContrast: enabled }),

            setDifficulty: (difficulty) => set({ difficulty }),
            setAutoSave: (enabled) => set({ autoSave: enabled }),
            setTutorialHints: (enabled) => set({ tutorialHints: enabled }),

            setIsOpen: (isOpen) => set({ isOpen }),
            toggleSettings: () => set((state) => ({ isOpen: !state.isOpen })),

            resetToDefaults: () => set(defaultSettings)
        }),
        {
            name: 'nightflare-settings',
            partialize: (state) => {
                // Exclude UI state from persistence
                const { isOpen, ...persisted } = state;
                return persisted;
            }
        }
    )
);

const SettingsPanel: React.FC = () => {
    const settings = useSettingsStore();
    const [activeTab, setActiveTab] = useState<'graphics' | 'audio' | 'controls' | 'accessibility' | 'gameplay'>('graphics');

    const handleClose = () => {
        haptics.menuClose();
        soundEffects.closeMenu();
        settings.setIsOpen(false);
    };

    const tabs = [
        {
            id: 'graphics', label: 'Graphics', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10h-10V2z"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path><path d="M2.5 12a9.5 9.5 0 0 1 19 0"></path></svg>
            )
        },
        {
            id: 'audio', label: 'Audio', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            )
        },
        {
            id: 'controls', label: 'Controls', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="18" y2="12"></line><line x1="12" y1="6" x2="12" y2="18"></line><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect></svg>
            )
        },
        {
            id: 'accessibility', label: 'Access', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 14.14 14.14"></path></svg>
            )
        },
        {
            id: 'gameplay', label: 'Gameplay', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zs"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M22 12h-2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></svg>
            )
        }
    ] as const;

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in zoom-in-95 fade-in duration-300 safe-padding" onClick={handleClose}>
            <div className="bg-black/90 backdrop-blur-3xl sm:rounded-3xl w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl border-0 sm:border border-white/10 shadow-2xl relative overflow-hidden flex flex-col pt-safe" onClick={e => e.stopPropagation()}>

                {/* Background decoration */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2 shrink-0 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Settings</h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mt-1">System Configuration</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-2 overflow-x-auto flex gap-2 shrink-0 relative z-10 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                haptics.tabSwitch();
                                soundEffects.switchTab();
                            }}
                            className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap border flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-black border-white shadow-lg scale-105'
                                : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            <span className="opacity-70">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 pb-24 sm:pb-6">

                    {/* Graphics Tab */}
                    {activeTab === 'graphics' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <SettingSelect
                                label="Quality Preset"
                                value={settings.quality}
                                options={[
                                    { value: 'low', label: 'Low (Performance)' },
                                    { value: 'medium', label: 'Medium (Balanced)' },
                                    { value: 'high', label: 'High (Quality)' },
                                    { value: 'ultra', label: 'Ultra (Max)' }
                                ]}
                                onChange={(value) => settings.setQuality(value as any)}
                            />

                            <SettingSelect
                                label="Particle Effects"
                                value={settings.particles}
                                options={[
                                    { value: 'off', label: 'Off' },
                                    { value: 'reduced', label: 'Reduced' },
                                    { value: 'full', label: 'Cinematic' }
                                ]}
                                onChange={(value) => settings.setParticles(value as any)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <SettingToggle
                                    label="Dynamic Shadows"
                                    value={settings.shadows}
                                    onChange={settings.setShadows}
                                />
                                <SettingToggle
                                    label="Post-Processing"
                                    value={settings.postProcessing}
                                    onChange={settings.setPostProcessing}
                                />
                            </div>

                            <SettingSelect
                                label="Target Frame Rate"
                                value={settings.fpsLimit}
                                options={[
                                    { value: 30, label: '30 FPS (Power Saver)' },
                                    { value: 60, label: '60 FPS (Smooth)' },
                                    { value: 120, label: '120 FPS (High Refresh)' }
                                ]}
                                onChange={(value) => settings.setFpsLimit(Number(value) as any)}
                            />
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <SettingToggle
                                label="Haptic Feedback"
                                value={settings.hapticFeedback}
                                onChange={settings.setHapticFeedback}
                            />

                            <SettingSlider
                                label="Touch Sensitivity"
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
                                label="Movement Input"
                                value={settings.movementMode}
                                options={[
                                    { value: 'joystick', label: 'Fixed Joystick' },
                                    { value: 'touch', label: 'Dynamic Follow' }
                                ]}
                                onChange={(value) => settings.setMovementMode(value as any)}
                            />

                            <SettingSelect
                                label="Button Layout"
                                value={settings.controlLayout}
                                options={[
                                    { value: 'A', label: 'Layout A (Standard)' },
                                    { value: 'B', label: 'Layout B (Ergonomic)' },
                                    { value: 'C', label: 'Layout C (Claw)' }
                                ]}
                                onChange={(value) => settings.setControlLayout(value as any)}
                            />
                        </div>
                    )}

                    {/* Accessibility Tab */}
                    {activeTab === 'accessibility' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <SettingSelect
                                label="Colorblind Mode"
                                value={settings.colorblindMode}
                                options={[
                                    { value: 'none', label: 'None' },
                                    { value: 'protanopia', label: 'Protanopia' },
                                    { value: 'deuteranopia', label: 'Deuteranopia' },
                                    { value: 'tritanopia', label: 'Tritanopia' }
                                ]}
                                onChange={(value) => settings.setColorblindMode(value as any)}
                            />

                            <SettingToggle
                                label="Reduced Motion"
                                value={settings.reducedMotion}
                                onChange={settings.setReducedMotion}
                            />

                            <SettingSelect
                                label="Text Size Scale"
                                value={settings.textSize}
                                options={[
                                    { value: 'small', label: 'Small' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'large', label: 'Large' }
                                ]}
                                onChange={(value) => settings.setTextSize(value as any)}
                            />

                            <SettingToggle
                                label="High Contrast UI"
                                value={settings.highContrast}
                                onChange={settings.setHighContrast}
                            />
                        </div>
                    )}

                    {/* Gameplay Tab */}
                    {activeTab === 'gameplay' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <SettingSelect
                                label="Difficulty"
                                value={settings.difficulty}
                                options={[
                                    { value: 'easy', label: 'Easy (Story)' },
                                    { value: 'normal', label: 'Normal (Intended)' },
                                    { value: 'hard', label: 'Hard (Survival)' }
                                ]}
                                onChange={(value) => settings.setDifficulty(value as any)}
                            />

                            <SettingToggle
                                label="Auto-Save Progress"
                                value={settings.autoSave}
                                onChange={settings.setAutoSave}
                            />

                            <SettingToggle
                                label="Show Tutorials"
                                value={settings.tutorialHints}
                                onChange={settings.setTutorialHints}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/20 shrink-0 relative z-10">
                    <button
                        onClick={() => {
                            settings.resetToDefaults();
                            haptics.buttonTap();
                            soundEffects.playSuccess();
                        }}
                        className="px-4 py-2 rounded-xl text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5"
                    >
                        Reset Defaults
                    </button>

                    <div className="scale-75 opacity-20">
                        <DeeJayLabsLogo />
                    </div>
                </div>
            </div>
        </div >
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
