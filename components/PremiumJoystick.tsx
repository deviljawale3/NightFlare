
import React, { useRef, useState, useEffect } from 'react';

interface JoystickProps {
    onMove?: (x: number, y: number) => void;
    onEnd?: () => void;
}

const PremiumJoystick: React.FC<JoystickProps> = React.memo(({ onMove, onEnd }) => {
    const [active, setActive] = useState(false);
    const knobRef = useRef<HTMLDivElement>(null);
    const baseRef = useRef<HTMLDivElement>(null);
    const rectRef = useRef<DOMRect | null>(null);

    const handleStart = (e: React.PointerEvent) => {
        if (!baseRef.current) return;
        rectRef.current = baseRef.current.getBoundingClientRect();
        setActive(true);
        (e.target as Element).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!rectRef.current || !knobRef.current) return;

        const width = rectRef.current.width;
        const height = rectRef.current.height;
        const centerX = rectRef.current.left + width / 2;
        const centerY = rectRef.current.top + height / 2;

        const dX = clientX - centerX;
        const dY = clientY - centerY;
        const dist = Math.sqrt(dX ** 2 + dY ** 2) || 0.001;

        const maxDist = window.innerWidth < 640 ? 60 : 80;

        const scale = Math.min(dist, maxDist) / dist;
        const limitedX = dX * scale;
        const limitedY = dY * scale;

        // Performant direct DOM update
        knobRef.current.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

        (window as any).joystickX = limitedX / maxDist;
        (window as any).joystickY = limitedY / maxDist;
        onMove?.(limitedX / maxDist, limitedY / maxDist);
    };

    const handleEnd = () => {
        setActive(false);
        if (knobRef.current) {
            knobRef.current.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            knobRef.current.style.transform = `translate(0px, 0px)`;
        }
        rectRef.current = null;
        (window as any).joystickX = 0;
        (window as any).joystickY = 0;
        onEnd?.();
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={baseRef}
                className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-3xl pointer-events-auto touch-none flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden group"
                onPointerDown={handleStart}
                onPointerMove={e => { if (active) handleMove(e.clientX, e.clientY); }}
                onPointerUp={e => { (e.target as Element).releasePointerCapture(e.pointerId); handleEnd(); }}
                onPointerCancel={handleEnd}
            >
                {/* Prestige Inner Ring - Pulses on touch */}
                <div className={`absolute inset-6 rounded-full border border-cyan-400/10 pointer-events-none transition-all duration-500 ${active ? 'scale-90 border-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'scale-100'}`} />

                {/* Center Mag-Lock Point */}
                <div className="absolute w-2 h-2 rounded-full bg-cyan-400/20 pointer-events-none" />

                <div
                    ref={knobRef}
                    className={`w-18 h-18 sm:w-26 sm:h-26 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-[3px] border-slate-600/50 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none will-change-transform flex items-center justify-center transition-transform ${!active && 'duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)'}`}
                >
                    {/* Thumb Grip Texture */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500/20 to-transparent border border-white/5 opacity-50" />
                    <div className={`absolute inset-0 rounded-full bg-cyan-400/10 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`} />
                </div>
            </div>
            <div className="mt-2 text-[10px] font-bold text-cyan-400/60 tracking-widest uppercase">Move</div>
        </div>
    );
});

export default PremiumJoystick;
