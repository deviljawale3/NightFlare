
import React from 'react';

const OrientationToggle: React.FC<{ className?: string }> = ({ className }) => {
    const toggleOrientation = async () => {
        try {
            // Check if API exists
            if (!screen.orientation || !(screen.orientation as any).lock) {
                alert("Auto-rotation is managed by your device settings. Please enable Auto-Rotate in your control panel for the best experience.");
                return;
            }

            // For mobile, we often need fullscreen to lock orientation
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen().catch(() => { });
            }

            // Screen Orientation API
            const type = (screen.orientation as any).type || '';
            if (type.includes('portrait')) {
                await (screen.orientation as any).lock('landscape').catch((e: any) => {
                    console.warn("Lock failed", e);
                    alert("Please rotate your phone to Landscape mode manually.");
                });
            } else {
                await (screen.orientation as any).lock('portrait').catch(() => { });
            }
        } catch (err) {
            console.warn("Orientation lock effort failed:", err);
            alert("Please enable Auto-Rotate in your device settings.");
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
