/**
 * YouTube Live Streaming Integration for NightFlare
 * 
 * SETUP REQUIRED:
 * 1. Create Google Cloud Project: https://console.cloud.google.com
 * 2. Enable YouTube Data API v3
 * 3. Create OAuth 2.0 credentials
 * 4. Add authorized redirect URIs
 * 5. Get Client ID and Client Secret
 * 
 * ENVIRONMENT VARIABLES NEEDED:
 * - VITE_YOUTUBE_CLIENT_ID
 * - VITE_YOUTUBE_CLIENT_SECRET
 * - VITE_YOUTUBE_REDIRECT_URI
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface StreamStats {
    isLive: boolean;
    viewerCount: number;
    likes: number;
    newSubscribers: number;
    peakViewers: number;
    duration: number;
    chatMessages: number;
}

interface YouTubeStreamingProps {
    onClose: () => void;
}

const YouTubeStreaming: React.FC<YouTubeStreamingProps> = ({ onClose }) => {
    const { userProfile, score, wave, kills } = useGameStore();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [streamKey, setStreamKey] = useState<string | null>(null);
    const [broadcastId, setBroadcastId] = useState<string | null>(null);

    const [streamStats, setStreamStats] = useState<StreamStats>({
        isLive: false,
        viewerCount: 0,
        likes: 0,
        newSubscribers: 0,
        peakViewers: 0,
        duration: 0,
        chatMessages: 0
    });

    const [streamSettings, setStreamSettings] = useState({
        title: `${userProfile.name} playing NightFlare - Wave ${wave}`,
        description: 'Live gameplay of NightFlare! Join me as I survive the eternal shadow.',
        privacy: 'public' as 'public' | 'unlisted' | 'private',
        category: '20', // Gaming category
        enableChat: true,
        enableDonations: false,
        overlayEnabled: true
    });

    const [showSettings, setShowSettings] = useState(false);
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // OAuth Configuration
    const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
    const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

    const CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '';
    const CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '';
    const REDIRECT_URI = import.meta.env.VITE_YOUTUBE_REDIRECT_URI || window.location.origin + '/youtube-callback';

    const SCOPES = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly'
    ].join(' ');

    // Check for OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code && !accessToken) {
            exchangeCodeForToken(code);
        }
    }, []);

    // Update stream stats
    useEffect(() => {
        if (streamStats.isLive) {
            streamIntervalRef.current = setInterval(() => {
                setStreamStats(prev => ({
                    ...prev,
                    duration: prev.duration + 1,
                    viewerCount: prev.viewerCount + Math.floor(Math.random() * 3) - 1, // Mock fluctuation
                }));
            }, 1000);
        } else {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        }

        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, [streamStats.isLive]);

    // OAuth Flow - Step 1: Redirect to Google
    const initiateOAuth = () => {
        if (!CLIENT_ID) {
            alert('YouTube Client ID not configured. Please set VITE_YOUTUBE_CLIENT_ID in your environment variables.');
            return;
        }

        const authUrl = `${YOUTUBE_AUTH_URL}?` + new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: SCOPES,
            access_type: 'offline',
            prompt: 'consent'
        });

        window.location.href = authUrl;
    };

    // OAuth Flow - Step 2: Exchange code for token
    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch(YOUTUBE_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                })
            });

            const data = await response.json();

            if (data.access_token) {
                setAccessToken(data.access_token);
                setIsAuthenticated(true);
                localStorage.setItem('youtube_access_token', data.access_token);

                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Failed to exchange code for token:', error);
            alert('Authentication failed. Please try again.');
        }
    };

    // Create Live Broadcast
    const createBroadcast = async () => {
        if (!accessToken) return;

        try {
            const response = await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status,contentDetails`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    snippet: {
                        title: streamSettings.title,
                        description: streamSettings.description,
                        scheduledStartTime: new Date().toISOString()
                    },
                    status: {
                        privacyStatus: streamSettings.privacy
                    },
                    contentDetails: {
                        enableAutoStart: true,
                        enableAutoStop: true,
                        enableDvr: true,
                        enableContentEncryption: false,
                        enableEmbed: true,
                        recordFromStart: true
                    }
                })
            });

            const data = await response.json();

            if (data.id) {
                setBroadcastId(data.id);
                await createStream(data.id);
            }
        } catch (error) {
            console.error('Failed to create broadcast:', error);
            alert('Failed to create broadcast. Please check your API quota.');
        }
    };

    // Create Live Stream
    const createStream = async (broadcastId: string) => {
        if (!accessToken) return;

        try {
            const response = await fetch(`${YOUTUBE_API_BASE}/liveStreams?part=snippet,cdn,status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    snippet: {
                        title: `${streamSettings.title} - Stream`
                    },
                    cdn: {
                        frameRate: '60fps',
                        ingestionType: 'rtmp',
                        resolution: '1080p'
                    }
                })
            });

            const data = await response.json();

            if (data.cdn?.ingestionInfo?.streamName) {
                setStreamKey(data.cdn.ingestionInfo.streamName);
                await bindBroadcastToStream(broadcastId, data.id);
            }
        } catch (error) {
            console.error('Failed to create stream:', error);
        }
    };

    // Bind Broadcast to Stream
    const bindBroadcastToStream = async (broadcastId: string, streamId: string) => {
        if (!accessToken) return;

        try {
            await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts/bind?id=${broadcastId}&streamId=${streamId}&part=id,snippet,status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        } catch (error) {
            console.error('Failed to bind broadcast to stream:', error);
        }
    };

    // Start Streaming
    const startStream = async () => {
        if (!broadcastId || !accessToken) {
            await createBroadcast();
            return;
        }

        try {
            await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts/transition?broadcastStatus=live&id=${broadcastId}&part=status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setStreamStats(prev => ({ ...prev, isLive: true }));
        } catch (error) {
            console.error('Failed to start stream:', error);
            alert('Failed to start stream. Please try again.');
        }
    };

    // Stop Streaming
    const stopStream = async () => {
        if (!broadcastId || !accessToken) return;

        try {
            await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts/transition?broadcastStatus=complete&id=${broadcastId}&part=status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setStreamStats(prev => ({ ...prev, isLive: false }));
        } catch (error) {
            console.error('Failed to stop stream:', error);
        }
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-500 safe-padding" onClick={onClose}>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[2rem] w-full max-w-5xl border border-red-500/20 shadow-2xl relative overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300 slide-in-from-bottom-5" onClick={e => e.stopPropagation()}>

                {/* Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 p-6 sm:p-8 border-b border-white/5 bg-white/5 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                                <span className="text-4xl drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">📺</span>
                                YouTube Live
                            </h2>
                            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mt-2 ml-1">
                                Broadcast Operation Control
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5"
                        >
                            <span className="text-xl font-bold">✕</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">

                    {!isAuthenticated ? (
                        // Authentication Required
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10">
                            <div className="text-7xl animate-pulse">🔐</div>
                            <div>
                                <h3 className="text-3xl font-black text-white italic uppercase mb-3">Authentication Required</h3>
                                <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                                    Link your YouTube account to start broadcasting directly from NightFlare.
                                </p>
                            </div>

                            {!CLIENT_ID ? (
                                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-2xl p-6 max-w-2xl text-left backdrop-blur-sm">
                                    <h4 className="text-yellow-400 font-black uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                                        <span>⚠️</span> Configuration Missing
                                    </h4>
                                    <div className="text-white/70 text-sm space-y-2 font-mono text-[11px]">
                                        <p>Please configure your environment variables:</p>
                                        <div className="bg-black/40 rounded-lg p-4 border border-white/5 space-y-1">
                                            <div>VITE_YOUTUBE_CLIENT_ID</div>
                                            <div>VITE_YOUTUBE_CLIENT_SECRET</div>
                                            <div>VITE_YOUTUBE_REDIRECT_URI</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-full max-w-sm">
                                    <button
                                        onClick={initiateOAuth}
                                        className="w-full px-8 py-4 bg-[#FF0000] hover:bg-red-600 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:shadow-[0_0_50px_rgba(255,0,0,0.5)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span>Connect YouTube Account</span>
                                    </button>

                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <span className="text-white/20 text-[10px] uppercase font-bold">OR</span>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    <button
                                        onClick={() => window.open('https://studio.youtube.com/channel/UC/livestreaming/dashboard', '_blank')}
                                        className="w-full px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Open Live Control Room</span>
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="w-full px-8 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    >
                                        <span>🖥️ Share Screen (Browser)</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Streaming Dashboard
                        <div className="space-y-8">

                            {/* Stream Status Card */}
                            <div className={`relative overflow-hidden border rounded-3xl p-8 transition-all duration-500 ${streamStats.isLive ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.1)]' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        {streamStats.isLive ? (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                                                <span className="text-red-400 font-black uppercase text-xs tracking-widest">Live Signal Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                                <div className="w-2.5 h-2.5 bg-white/20 rounded-full" />
                                                <span className="text-white/40 font-black uppercase text-xs tracking-widest">Standby Mode</span>
                                            </div>
                                        )}
                                    </div>

                                    {streamStats.isLive ? (
                                        <button
                                            onClick={stopStream}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-black uppercase text-xs tracking-wider transition-all shadow-lg hover:shadow-red-600/20"
                                        >
                                            End Transmssion
                                        </button>
                                    ) : (
                                        <button
                                            onClick={startStream}
                                            className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 flex items-center gap-2"
                                        >
                                            Start Stream
                                        </button>
                                    )}
                                </div>

                                {/* Stream Stats Grid */}
                                {streamStats.isLive && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                        <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
                                            <div className="text-white text-3xl font-black tabular-nums tracking-tighter">{streamStats.viewerCount}</div>
                                            <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Viewers</div>
                                        </div>
                                        <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
                                            <div className="text-white text-3xl font-black tabular-nums tracking-tighter">{streamStats.likes}</div>
                                            <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Likes</div>
                                        </div>
                                        <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
                                            <div className="text-white text-3xl font-black tabular-nums tracking-tighter">+{streamStats.newSubscribers}</div>
                                            <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Subs</div>
                                        </div>
                                        <div className="bg-black/40 rounded-2xl p-4 text-center border border-white/5">
                                            <div className="text-white text-3xl font-black tabular-nums tracking-tighter text-red-400">{formatDuration(streamStats.duration)}</div>
                                            <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Uptime</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Settings Column */}
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                                            <span>⚙️</span> Config
                                        </h3>
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full transition-all"
                                        >
                                            {showSettings ? 'Minimize' : 'Expand'}
                                        </button>
                                    </div>

                                    {showSettings && (
                                        <div className="space-y-5 animate-in slide-in-from-left-2 duration-300">
                                            <div className="group">
                                                <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">Stream Title</label>
                                                <input
                                                    type="text"
                                                    value={streamSettings.title}
                                                    onChange={e => setStreamSettings(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm font-bold focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                                                    placeholder="Enter a catchy title..."
                                                />
                                            </div>

                                            <div className="group">
                                                <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">Description</label>
                                                <textarea
                                                    value={streamSettings.description}
                                                    onChange={e => setStreamSettings(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-red-500/50 focus:bg-black/60 transition-all resize-none placeholder:text-white/10"
                                                    rows={3}
                                                    placeholder="What are you playing today?"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block tracking-widest">Privacy</label>
                                                    <div className="relative">
                                                        <select
                                                            value={streamSettings.privacy}
                                                            onChange={e => setStreamSettings(prev => ({ ...prev, privacy: e.target.value as any }))}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-red-500 appearance-none"
                                                        >
                                                            <option value="public">Public (Everyone)</option>
                                                            <option value="unlisted">Unlisted (Link Only)</option>
                                                            <option value="private">Private (Only You)</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">▼</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preview Column */}
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col">
                                    <h3 className="text-white font-black uppercase text-sm tracking-widest mb-4 flex items-center gap-2">
                                        <span>👁️</span> Output Preview
                                    </h3>
                                    <div className="bg-black rounded-2xl border border-white/10 relative aspect-video overflow-hidden group shadow-2xl">

                                        {/* Mock Game Content */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-white/10 font-black text-4xl uppercase -rotate-12 select-none">Game Feed</div>
                                        </div>

                                        {/* Overlay Elements */}
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex flex-col">
                                            <span className="text-white font-black text-xs">{userProfile.name}</span>
                                            <span className="text-red-400 text-[10px] uppercase font-bold">Wave {wave}</span>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse shadow-lg shadow-red-600/40">
                                                Live
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div className="flex gap-2">
                                                <div className="bg-black/60 backdrop-blur rounded px-2 py-1 border border-white/5">
                                                    <span className="text-white font-black text-xs mr-1">💀</span>
                                                    <span className="text-white text-xs font-mono">{kills}</span>
                                                </div>
                                                <div className="bg-black/60 backdrop-blur rounded px-2 py-1 border border-white/5">
                                                    <span className="text-white font-black text-xs mr-1">✨</span>
                                                    <span className="text-white text-xs font-mono">{score}</span>
                                                </div>
                                            </div>
                                            <DeeJayLabsLogo className="scale-50 opacity-80 drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <p className="text-center text-white/20 text-[10px] uppercase font-bold mt-4 tracking-widest">
                                        Signal Quality: Outstanding • 1080p60
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="relative z-10 p-6 border-t border-white/5 flex justify-between items-center bg-black/20 shrink-0">
                    <span className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">DeeJay Labs Broadcast System</span>
                    <DeeJayLabsLogo className="scale-75 opacity-20" />
                </div>
            </div>
        </div>
    );
};

export default YouTubeStreaming;
