
import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { settings, updateSettings } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl z-[110] pointer-events-auto overflow-y-auto px-4 py-8">
      <div className="max-w-md w-full p-8 sm:p-12 bg-slate-900/50 border border-white/10 rounded-[3rem] shadow-2xl relative flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter mb-10 text-center uppercase">
          Settings
        </h2>
        
        <div className="w-full space-y-8 mb-12">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="flex flex-col">
              <span className="text-white font-black text-lg uppercase italic tracking-tighter">Sound Effects</span>
              <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Atmosphere & Feedback</span>
            </div>
            <button 
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-14 h-8 rounded-full transition-all relative ${settings.soundEnabled ? 'bg-orange-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="flex flex-col">
              <span className="text-white font-black text-lg uppercase italic tracking-tighter">Haptic Feedback</span>
              <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Tactile Immersion</span>
            </div>
            <button 
              onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-14 h-8 rounded-full transition-all relative ${settings.vibrationEnabled ? 'bg-orange-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.vibrationEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={onBack}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-lg hover:scale-[1.03] active:scale-95 transition-all shadow-xl uppercase italic tracking-tighter"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
          <DeeJayLabsLogo />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
