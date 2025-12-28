
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

    const gameUrl = window.location.href;
    const shareText = stats
        ? `I survived Night ${stats.wave} with ${stats.score} points inside NIGHTFLARE. #NightFlare #DeeJayLabs`
        : `Surviving the eternal shadow in NIGHTFLARE. #DeeJayLabs`;

    // Snapshot Logic
    useEffect(() => {
        if (mode === 'SNAPSHOT' && !image) {
            captureSnapshot();
        }
    }, [mode]);

    const captureSnapshot = () => {
        try {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const data = canvas.toDataURL('image/jpeg', 0.9);
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

        const stream = canvas.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };

        recorder.onstop = () => {
            // Processing happens in useEffect dependent on chunks
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setRecording(true);
        setRecordTimer(0);
        setRecordedChunks([]); // clear previous
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    // Timer
    useEffect(() => {
        let interval: any;
        if (recording) {
            interval = setInterval(() => setRecordTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [recording]);

    // Create Video Blob
    useEffect(() => {
        if (!recording && recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        }
    }, [recording, recordedChunks]);

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
        let url = '';
        switch (platform) {
            case 'youtube': url = 'https://studio.youtube.com/channel/UC/livestreaming'; break;
            case 'twitch': url = 'https://dashboard.twitch.tv/'; break;
            case 'facebook': url = 'https://www.facebook.com/live/create/'; break;
            case 'youtube_sub': url = 'https://www.youtube.com/@DeeJayLabs?sub_confirmation=1'; break;
        }
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full flex flex-col items-center shadow-2xl relative" onClick={e => e.stopPropagation()}>

                <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 z-10">✕</button>

                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Broadcast Station</h2>

                {/* TABS */}
                <div className="flex bg-black/50 p-1 rounded-xl w-full mb-6">
                    {(['SNAPSHOT', 'CLIP', 'LIVE'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${mode === m ? 'bg-orange-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}>
                            {m}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="w-full aspect-video bg-black rounded-2xl mb-6 overflow-hidden border border-white/10 shadow-lg relative group flex items-center justify-center">

                    {mode === 'SNAPSHOT' && (
                        image ? (
                            <>
                                <img src={image} alt="Snapshot" className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 right-2 opacity-50"><DeeJayLabsLogo className="scale-75" /></div>
                            </>
                        ) : <span className="text-white/20 text-xs italic">No Signal</span>
                    )}

                    {mode === 'CLIP' && (
                        <>
                            {recording ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]" />
                                    <span className="text-red-500 font-mono text-sm font-bold">REC {recordTimer}s</span>
                                    <div className="text-white/30 text-[9px] uppercase tracking-widest">Capturing Screen...</div>
                                </div>
                            ) : videoUrl ? (
                                <video src={videoUrl} controls className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <button onClick={startRecording} className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-600/40 transition-all group-hover:scale-110">
                                        <div className="w-6 h-6 bg-red-500 rounded-full" />
                                    </button>
                                    <div className="mt-2 text-white/30 text-[10px] uppercase tracking-widest">Start Clip</div>
                                </div>
                            )}
                            {recording && (
                                <button onClick={stopRecording} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform">
                                    Stop Log
                                </button>
                            )}
                        </>
                    )}

                    {mode === 'LIVE' && (
                        <div className="flex flex-col gap-3 items-center w-full px-8">
                            <div className="text-white/40 text-[10px] uppercase font-bold text-center mb-2">Select Uplink Channel</div>
                            <button onClick={() => openLiveDashboard('youtube')} className="w-full py-3 bg-[#FF0000] rounded-xl text-white font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                <span>📺</span> YouTube Live
                            </button>
                            <button onClick={() => openLiveDashboard('twitch')} className="w-full py-3 bg-[#9146FF] rounded-xl text-white font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                <span>👾</span> Twitch TV
                            </button>
                            <button onClick={() => openLiveDashboard('facebook')} className="w-full py-3 bg-[#1877F2] rounded-xl text-white font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                <span>🔵</span> Facebook Live
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                {mode !== 'LIVE' && (
                    <div className="grid grid-cols-4 gap-3 w-full mb-6">
                        <SocialButton icon="𝕏" color="bg-black border-white/20" onClick={() => handleShare('twitter')} />
                        <SocialButton icon="fb" color="bg-blue-600" onClick={() => handleShare('facebook')} />
                        <SocialButton icon="wz" color="bg-green-500" onClick={() => handleShare('whatsapp')} />
                        <SocialButton icon="⬇" color="bg-orange-600" onClick={handleDownload} />
                    </div>
                )}

                {mode === 'LIVE' && (
                    <div className="w-full mb-4">
                        <button onClick={() => openLiveDashboard('youtube_sub')} className="w-full py-3 border border-white/10 bg-white/5 rounded-xl text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <span>🔔</span> Subscribe for Drops
                        </button>
                    </div>
                )}

                <p className="text-[10px] text-white/30 text-center px-4 leading-relaxed italic">
                    {mode === 'LIVE' ? "Initiate direct uplink to external streaming providers. Latency may vary." : "Share your survival log with the network. Visuals must be saved manually."}
                </p>

                <div className="mt-6 opacity-40">
                    <DeeJayLabsLogo className="scale-75" />
                </div>
            </div>
        </div>
    );
};

const SocialButton: React.FC<{ icon: string, color: string, onClick: () => void }> = ({ icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`aspect-square rounded-2xl flex items-center justify-center text-white font-black text-lg hover:scale-110 active:scale-95 transition-all shadow-lg ${color}`}
    >
        {icon}
    </button>
);

export default SocialShare;
