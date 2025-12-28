import React, { useEffect, useState, useRef } from 'react';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface SocialShareProps {
    onClose: () => void;
    stats?: { wave: number; score: number };
}

const SocialShare: React.FC<SocialShareProps> = ({ onClose, stats }) => {
    const [mode, setMode] = useState<'SNAPSHOT' | 'CLIP' | 'LIVE'>('SNAPSHOT');
    const [image, setImage] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recordTimer, setRecordTimer] = useState(0);
    const [isFlashing, setIsFlashing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const gameUrl = window.location.href;
    const shareText = stats
        ? `I survived Night ${stats.wave} with ${stats.score} points inside NIGHTFLARE. #NightFlare #DeeJayLabs`
        : `Surviving the eternal shadow in NIGHTFLARE. #DeeJayLabs`;

    // Snapshot Logic
    useEffect(() => {
        if (mode === 'SNAPSHOT') {
            setImage(null);
            setTimeout(() => captureSnapshot(), 500); // Slight delay for UI transition
        }
    }, [mode]);

    const captureSnapshot = () => {
        try {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 150);

                // Create a flash sound effect or visual cue
                const data = canvas.toDataURL('image/jpeg', 0.95);
                setImage(data);
            }
        } catch (e) {
            console.error("Snapshot failed", e);
        }
    };

    // Recording Logic
    const startRecording = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        try {
            // @ts-ignore - captureStream might not be in TS defs
            const stream = canvas.captureStream(30); // 30 FPS

            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4'
            ];

            const selectedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
            if (!selectedType) {
                console.error("No supported video mime type found");
                alert("Screen recording is not supported on this browser.");
                return;
            }

            const recorder = new MediaRecorder(stream, { mimeType: selectedType });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
            };

            recorder.onstop = () => {
                // Logic handled in useEffect due to closure capture issues
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setRecording(true);
            setRecordTimer(0);
            setRecordedChunks([]);
            setVideoUrl(null);
        } catch (err) {
            console.error("Recording init failed:", err);
            alert("Recording not supported on this device/browser context.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    // Process Recording
    useEffect(() => {
        if (!recording && recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        }
    }, [recording, recordedChunks]);

    // Timer
    useEffect(() => {
        let interval: any;
        if (recording) {
            interval = setInterval(() => setRecordTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [recording]);

    const handleDownload = () => {
        const link = document.createElement('a');
        if (mode === 'SNAPSHOT' && image) {
            link.download = `nightflare-${Date.now()}.jpg`;
            link.href = image;
        } else if (mode === 'CLIP' && videoUrl) {
            link.download = `nightflare-clip-${Date.now()}.webm`;
            link.href = videoUrl;
        }
        link.click();
    };

    const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
        let url = '';
        switch (platform) {
            case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}`; break;
            case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(shareText)}`; break;
            case 'whatsapp': url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + gameUrl)}`; break;
        }
        window.open(url, '_blank');
    };

    const openLiveDashboard = (platform: 'youtube' | 'twitch' | 'facebook' | 'youtube_sub') => {
        setIsConnecting(true);
        setTimeout(() => {
            let url = '';
            switch (platform) {
                case 'youtube': url = 'https://studio.youtube.com/channel/UC/livestreaming'; break;
                case 'twitch': url = 'https://dashboard.twitch.tv/'; break;
                case 'facebook': url = 'https://www.facebook.com/live/create/'; break;
                case 'youtube_sub': url = 'https://www.youtube.com/@DeeJayLabs?sub_confirmation=1'; break;
            }
            window.open(url, '_blank');
            setIsConnecting(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={onClose}>
            {/* Flash Effect */}
            {isFlashing && <div className="fixed inset-0 bg-white z-[300] animate-out fade-out duration-300 pointer-events-none" />}

            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all z-10">✕</button>

                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 drop-shadow-lg flex items-center gap-2">
                    <span className="text-orange-500">●</span> Broadcast
                </h2>

                {/* TABS */}
                <div className="flex bg-black/50 p-1.5 rounded-xl w-full mb-6 border border-white/5">
                    {(['SNAPSHOT', 'CLIP', 'LIVE'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mode === m ? 'bg-orange-600 text-white shadow-lg scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                            {m}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="w-full aspect-video bg-black rounded-2xl mb-6 overflow-hidden border border-white/10 shadow-2xl relative group flex items-center justify-center">

                    {/* Scanlines Overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-30 pointer-events-none z-0" />

                    {mode === 'SNAPSHOT' && (
                        image ? (
                            <>
                                <img src={image} alt="Snapshot" className="w-full h-full object-cover z-10" />
                                <div className="absolute bottom-2 right-2 opacity-50 z-20"><DeeJayLabsLogo className="scale-75" /></div>
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[9px] font-mono text-white/50 border border-white/10 z-20 shadow-lg">CAPTURED</div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 z-10">
                                <span className="animate-spin text-2xl opacity-30">↻</span>
                                <span className="text-white/20 text-xs italic tracking-widest uppercase">Initializing Feed...</span>
                            </div>
                        )
                    )}

                    {mode === 'CLIP' && (
                        <>
                            {recording ? (
                                <div className="flex flex-col items-center gap-3 z-10 w-full h-full justify-center bg-black/80 backdrop-blur-sm animate-pulse-slow">
                                    <div className="w-16 h-16 rounded-full border-4 border-red-600 flex items-center justify-center animate-pulse relative">
                                        <div className="w-12 h-12 bg-red-600 rounded-full animate-ping opacity-20 absolute" />
                                        <div className="w-6 h-6 bg-red-600 rounded-sm" />
                                    </div>
                                    <span className="text-red-500 font-mono text-xl font-bold tracking-widest">{recordTimer}s</span>
                                    <div className="text-white/30 text-[9px] uppercase tracking-[0.2em] animate-pulse">Recording Feed</div>
                                </div>
                            ) : videoUrl ? (
                                <video src={videoUrl} controls loop autoPlay className="w-full h-full object-cover z-10" />
                            ) : (
                                <div className="text-center z-10">
                                    <button onClick={startRecording} className="w-20 h-20 rounded-full bg-red-600/10 border border-red-500/50 flex items-center justify-center hover:bg-red-600/30 transition-all group-hover:scale-110 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                                        <div className="w-8 h-8 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse" />
                                    </button>
                                    <div className="mt-4 text-white/30 text-[10px] uppercase tracking-widest">Start Recording</div>
                                </div>
                            )}

                            {recording && (
                                <button onClick={stopRecording} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform z-20 shadow-xl">
                                    Stop Recording
                                </button>
                            )}

                            {!recording && videoUrl && (
                                <button onClick={() => setVideoUrl(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/50 hover:bg-red-600 hover:text-white transition-all z-20 backdrop-blur-md">
                                    ✕
                                </button>
                            )}
                        </>
                    )}

                    {mode === 'LIVE' && (
                        isConnecting ? (
                            <div className="flex flex-col items-center gap-3 z-10">
                                <div className="w-8 h-8 border-t-2 border-orange-500 rounded-full animate-spin" />
                                <span className="text-orange-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">Establishing Uplink...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 items-center w-full px-8 z-10">
                                <div className="text-white/40 text-[10px] uppercase font-bold text-center mb-2 tracking-widest">Select Provider</div>
                                <button onClick={() => openLiveDashboard('youtube')} className="w-full py-3 bg-[#FF0000] rounded-xl text-white font-black uppercase text-xs hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all flex items-center justify-center gap-2 group/btn">
                                    <span className="text-lg">📺</span> YouTube Live
                                </button>
                                <button onClick={() => openLiveDashboard('twitch')} className="w-full py-3 bg-[#9146FF] rounded-xl text-white font-black uppercase text-xs hover:scale-105 hover:shadow-[0_0_20px_rgba(145,70,255,0.4)] transition-all flex items-center justify-center gap-2">
                                    <span className="text-lg">👾</span> Twitch
                                </button>
                                <button onClick={() => openLiveDashboard('facebook')} className="w-full py-3 bg-[#1877F2] rounded-xl text-white font-black uppercase text-xs hover:scale-105 hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] transition-all flex items-center justify-center gap-2">
                                    <span className="text-lg">🔵</span> Facebook
                                </button>
                            </div>
                        )
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                {mode !== 'LIVE' && (
                    <div className="grid grid-cols-4 gap-3 w-full mb-6 relative z-10">
                        <SocialButton icon="𝕏" color="bg-black border border-white/20" onClick={() => handleShare('twitter')} />
                        <SocialButton icon="fb" color="bg-[#1877F2]" onClick={() => handleShare('facebook')} />
                        <SocialButton icon="wz" color="bg-[#25D366]" onClick={() => handleShare('whatsapp')} />
                        <SocialButton icon="⬇" color="bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]" onClick={handleDownload} />
                    </div>
                )}

                {mode === 'LIVE' && !isConnecting && (
                    <div className="w-full mb-4 relative z-10">
                        <button onClick={() => openLiveDashboard('youtube_sub')} className="w-full py-3 border border-white/10 bg-white/5 rounded-xl text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 group/sub">
                            <span className="group-hover/sub:animate-bounce">🔔</span> <span className="opacity-80 group-hover/sub:opacity-100">Subscribe for Drops</span>
                        </button>
                    </div>
                )}

                <p className="text-[10px] text-white/30 text-center px-4 leading-relaxed italic z-10">
                    {mode === 'LIVE' ? "Initiating direct uplink protocol. Ensure streaming software is active locally." : "Encrypted logs ready for transmission. Visual data must be saved locally."}
                </p>

                <div className="mt-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                    <DeeJayLabsLogo className="scale-75" />
                </div>
            </div>
        </div>
    );
};

const SocialButton: React.FC<{ icon: string, color: string, onClick: () => void }> = ({ icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`aspect-square rounded-2xl flex items-center justify-center text-white font-black text-lg hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-2xl ${color}`}
    >
        {icon}
    </button>
);

export default SocialShare;
