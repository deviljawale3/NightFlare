
import React from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

const TutorialOverlay: React.FC = () => {
  const { tutorialStep, completeTutorialStep } = useGameStore();

  const steps = [
    {
      title: "MOVEMENT",
      desc: "Welcome, Survivor. Use the joystick in the bottom left to explore the island.",
      button: "Got it",
      action: completeTutorialStep
    },
    {
      title: "GATHERING",
      desc: "Tap on trees or rocks to gather resources. You'll need them to stoke the fire and build tools.",
      button: "Start Gathering",
      action: completeTutorialStep
    },
    {
      title: "NIGHTFLARE",
      desc: "The central fire is your only protection. If it dies, the shadows win. Keep it stoked with wood and shards.",
      button: "I'll protect it",
      action: completeTutorialStep
    },
    {
      title: "NIGHTFALL",
      desc: "When night falls, shadow creatures will attack the fire. Fight them off with your staff!",
      button: "Begin Survival",
      action: completeTutorialStep
    }
  ];

  const current = steps[tutorialStep];
  if (!current) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start pt-24 sm:pt-32 bg-black/50 z-[80] pointer-events-none p-6">
      <div className="bg-[#0a0f1a] border border-white/10 p-8 sm:p-10 rounded-[2.5rem] max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,1)] pointer-events-auto text-center animate-in zoom-in duration-300 flex flex-col items-center relative">

        <div className="text-orange-500 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.4em] mb-3 italic">
          PHASE {tutorialStep + 1}
        </div>

        <h2 className="text-white text-4xl sm:text-5xl font-black mb-6 italic tracking-tighter uppercase leading-none">
          {current.title}
        </h2>

        <p className="text-white/60 text-sm font-medium leading-relaxed mb-10 px-2">
          {current.desc}
        </p>

        {current.button && (
          <button
            onClick={() => current.action && current.action()}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 hover:bg-slate-100 transition-all mb-8 uppercase italic tracking-tight"
          >
            {current.button}
          </button>
        )}

        <div className="opacity-40">
          <DeeJayLabsLogo className="scale-90" />
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
