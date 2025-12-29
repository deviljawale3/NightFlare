
import React from 'react';

const OrientationToggle: React.FC<{ className?: string }> = ({ className }) => {
    const toggleOrientation = async () => {
        try {
            // For mobile, we often need fullscreen to lock orientation
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen().catch(() => { });
            }

            // Screen Orientation API
            if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).lock) {
                // Toggle between portrait and landscape or just force landscape
                const type = (screen.orientation as any).type;
                if (type.includes('portrait')) {
                    await (screen.orientation as any).lock('landscape').catch(() => { });
                } else {
                    await (screen.orientation as any).lock('portrait').catch(() => { });
                }
            }
        } catch (err) {
            console.warn("Orientation lock effort failed:", err);
        }
    };

    return (
        <button
            onClick={toggleOrientation}
            className={`group flex items-center justify-center transition-all active:scale-90 pointer-events-auto h-full w-full ${className}`}
            title="Toggle Screen Rotation"
        >
            <span className="text-xl sm:text-3xl group-hover:rotate-180 transition-transform duration-500">🔄</span>
        </button>
    );
};

export default OrientationToggle;
