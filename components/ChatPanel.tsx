import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { WeaponType } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface ChatPanelProps {
    compact?: boolean;
    onClose?: () => void;
}

const EMOJIS = ['🔥', '👍', '💀', '⚔️', '🛡️', '❤️', '😱', '🏃', '🌙', '👻', '✨', '💎', '👑', '💯', '🎉', '🚀'];

const ChatPanel: React.FC<ChatPanelProps> = ({ compact, onClose }) => {
    const { chatMessages, addChatMessage, grantRequest, userProfile, giftItem, leaderboard, arenaStats } = useGameStore();
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<'CHAT' | 'RANKINGS'>('CHAT');
    const [showEmojis, setShowEmojis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeTab]);

    // Simulation: Periodic Global Achievement Notifications
    useEffect(() => {
        const interval = setInterval(() => {
            const players = ['ShadowHunter', 'NeonRider', 'GhostWalker', 'NightOwl', 'IronClad'];
            const accomplishments = [
                'has reached Wave 15!',
                'just unlocked the Crimson Scepter!',
                'achieved a 50x Multiplier!',
                'ascended to Diamond Rank!',
                'collected 5000 Star Shards!'
            ];

            if (activeTab === 'CHAT' && Math.random() > 0.4) {
                const p = players[Math.floor(Math.random() * players.length)];
                const a = accomplishments[Math.floor(Math.random() * accomplishments.length)];
                addChatMessage({
                    content: `${p} ${a}`,
                    type: 'SYSTEM',
                    senderAvatar: '🌐'
                });
            }
        }, 30000); // Every 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        addChatMessage({ content: inputText, type: 'CHAT' });
        setInputText('');
        setShowEmojis(false);
    };

    const handleEmojiClick = (emoji: string) => {
        setInputText(prev => prev + emoji);
    };

    return (
        <div className={`flex flex-col h-full bg-[#050505]/95 backdrop-blur-3xl border-l sm:border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 overflow-hidden font-['Outfit']`}>

            {/* Upper Header with Close for Mobile */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase leading-tight">Neural Link</span>
                    <span className="text-white text-lg font-black italic uppercase italic tracking-tighter">COMMS HUB</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        ✕
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/40 p-1">
                <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CHAT' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                >
                    SURVIVOR CHAT
                </button>
                <button
                    onClick={() => setActiveTab('RANKINGS')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RANKINGS' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                >
                    LEGENDS BOARD
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* CHAT VIEW */}
                {activeTab === 'CHAT' && (
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                            {chatMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 italic space-y-4">
                                    <div className="text-5xl">📡</div>
                                    <div className="text-sm font-bold tracking-widest uppercase">Waiting for Signals...</div>
                                </div>
                            )}

                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.senderId === 'player' ? 'flex-row-reverse' : ''} group`}>
                                    {/* Detailed Avatar */}
                                    {msg.type !== 'SYSTEM' && (
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-2xl border-2 transition-transform group-hover:scale-110 ${msg.senderId === 'player' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400/50' : 'bg-gradient-to-br from-purple-800 to-slate-900 border-purple-500/50'}`}>
                                            {msg.senderAvatar}
                                        </div>
                                    )}

                                    <div className={`flex flex-col max-w-[80%] ${msg.senderId === 'player' ? 'items-end' : 'items-start'}`}>
                                        {msg.type !== 'SYSTEM' && (
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${msg.senderId === 'player' ? 'text-cyan-400' : 'text-purple-400'}`}>{msg.senderName}</span>
                                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                                <span className="text-[8px] text-white/30 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}

                                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-2xl backdrop-blur-md relative border transition-all hover:bg-white/5 ${msg.type === 'SYSTEM' ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-200 w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-xl' :
                                            msg.senderId === 'player' ? 'bg-white/10 text-white rounded-tr-none border-white/20' : 'bg-[#111] text-white/90 border-white/5 rounded-tl-none'
                                            }`}>
                                            {msg.content}

                                            {/* Status Badge for Requests */}
                                            {msg.requestStatus === 'GRANTED' && (
                                                <div className="mt-3 text-[9px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                                    SUPPLIES RECEIVED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/80 backdrop-blur-2xl border-t border-white/10 space-y-4">
                            {/* Emoji Shortcuts */}
                            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                {EMOJIS.slice(0, 8).map(e => (
                                    <button
                                        key={e}
                                        onClick={() => handleEmojiClick(e)}
                                        className="w-10 h-10 flex-shrink-0 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90 border border-white/5"
                                    >
                                        {e}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowEmojis(!showEmojis)}
                                    className="w-10 h-10 flex-shrink-0 bg-cyan-400/10 text-cyan-400 rounded-xl flex items-center justify-center text-xl border border-cyan-400/20"
                                >
                                    +
                                </button>
                            </div>

                            <form onSubmit={handleSend} className="flex gap-3 items-center relative">
                                {showEmojis && (
                                    <div className="absolute bottom-full right-0 mb-4 p-3 bg-[#0a0a0a] border-2 border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,1)] grid grid-cols-4 gap-2 w-48 animate-in slide-in-from-bottom duration-300 z-[100]">
                                        {EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => handleEmojiClick(emoji)}
                                                className="aspect-square flex items-center justify-center hover:bg-white/10 rounded-2xl text-2xl transition-all hover:scale-110"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Broadcast message..."
                                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 italic"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl disabled:opacity-20 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-90"
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* RANKINGS VIEW */}
                {activeTab === 'RANKINGS' && (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-black/40">
                        {/* Current User Stats Card */}
                        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-5 rounded-[2rem] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400 opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity" />
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="text-4xl">{userProfile.avatar}</div>
                                <div>
                                    <div className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mb-1">Your Standing</div>
                                    <div className="text-white text-2xl font-black italic uppercase tracking-tighter">{userProfile.name}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                    <div className="text-white/40 text-[9px] font-black uppercase mb-1">Rank Points</div>
                                    <div className="text-white text-lg font-black tabular-nums">{arenaStats.rankPoints}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                    <div className="text-white/40 text-[9px] font-black uppercase mb-1">Rank Tier</div>
                                    <div className="text-white text-lg font-black italic">{arenaStats.rank}</div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <div className="space-y-3">
                            <div className="px-2 flex justify-between items-end mb-2">
                                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] italic">TOP OPERATIVES</h3>
                                <span className="text-white/20 text-[9px] font-bold">ALL TIME</span>
                            </div>

                            {leaderboard.map((entry, idx) => (
                                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all animate-in slide-in-from-right duration-300 ${idx === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30' : 'bg-white/5 border-white/5'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-lg ${idx === 0 ? 'text-yellow-400 scale-125' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-white/20'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="text-2xl">{entry.avatar}</div>
                                    <div className="flex-1">
                                        <div className={`text-sm font-black italic uppercase tracking-tighter ${idx === 0 ? 'text-white' : 'text-white/80'}`}>{entry.name}</div>
                                        <div className="text-[10px] text-white/40 font-bold uppercase">{entry.wave}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-black italic text-base tabular-nums ${idx === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>{entry.score.toLocaleString()}</div>
                                        <div className="text-[8px] text-white/20 font-bold uppercase">{entry.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Branding Footer */}
            <div className="p-4 flex flex-col items-center border-t border-white/10 bg-black/60 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
                <DeeJayLabsLogo className="scale-75 opacity-20 mb-1" />
                <span className="text-[8px] text-white/10 font-bold uppercase tracking-[0.5em]">Sector Communications Protocol v4.0</span>
            </div>
        </div>
    );
};

export default ChatPanel;
