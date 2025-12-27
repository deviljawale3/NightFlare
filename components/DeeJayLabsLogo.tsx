
import React from 'react';

const DeeJayLabsLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Pulsating Brand Glow */}
        <div className="absolute w-7 h-7 bg-orange-500/30 rounded-full blur-md animate-pulse"></div>
        <div className="relative w-5 h-5 bg-slate-900 border border-white/30 rounded-md flex items-center justify-center rotate-45 shadow-lg shadow-black/50">
          <div className="w-2 h-2 bg-orange-500 rounded-sm -rotate-45 animate-bounce"></div>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-black text-white tracking-tighter uppercase italic">
          DeeJay <span className="text-orange-500">Labs</span>
        </span>
        <span className="text-[6px] text-white/40 font-bold tracking-[0.3em] uppercase">Digital Studio</span>
      </div>
    </div>
  );
};

export default DeeJayLabsLogo;
