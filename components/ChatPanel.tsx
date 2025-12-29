import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { WeaponType } from '../types';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface ChatPanelProps {
    compact?: boolean;
}

const EMOJIS = ['🔥', '👍', '💀', '⚔️', '🛡️', '❤️', '😱', '🏃', '🌙', '👻', '✨', '💎'];

const MOCK_ONLINE_USERS = [
    { id: '1', name: 'GhostWalker', avatar: '👻', status: 'PLAYING' },
    { id: '2', name: 'NightOwl', avatar: '🦉', status: 'LOBBY' },
    { id: '3', name: 'IronClad', avatar: '🛡️', status: 'PLAYING' },
    { id: '4', name: 'ShadowHunter', avatar: '🗡️', status: 'PLAYING' },
    { id: '5', name: 'NeonRider', avatar: '🏍️', status: 'LOBBY' },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ compact }) => {
    const { chatMessages, addChatMessage, grantRequest, userProfile, giftItem } = useGameStore();
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<'CHAT' | 'ONLINE'>('CHAT');
    const [showEmojis, setShowEmojis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeTab]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        addChatMessage({ content: inputText, type: 'CHAT' });
        setInputText('');
        setShowEmojis(false);
    };

    const handleRequest = (type: 'HP' | 'WEAPON' | 'RESOURCE') => {
        if (type === 'HP') {
            addChatMessage({ content: 'Requesting Life Support (Needs 100 Shards)!', type: 'REQUEST_LIFE' });
        } else if (type === 'WEAPON') {
            addChatMessage({
                content: 'Requesting Weapon Upgrade Support!',
                type: 'REQUEST_WEAPON',
                weaponType: WeaponType.SWORD
            });
        } else {
            addChatMessage({ content: 'Requesting Stone/Wood Supplies!', type: 'REQUEST_LIFE' }); // simplified type for visual
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setInputText(prev => prev + emoji);
    };

    return (
        <div className={`flex flex-col h-full bg-[#0a0a0a]/90 backdrop-blur-2xl ${compact ? 'text-xs' : ''} border-r border-white/5`}>

            {/* Header Tabs (Only non-compact) */}
            {!compact && (
                <div className="flex border-b border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('CHAT')}
                        className={`flex-1 py-3 font-bold text-[10px] uppercase tracking-wider transition-colors ${activeTab === 'CHAT' ? 'bg-white/5 text-white border-b-2 border-orange-500' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Comms
                    </button>
                    <button
                        onClick={() => setActiveTab('ONLINE')}
                        className={`flex-1 py-3 font-bold text-[10px] uppercase tracking-wider transition-colors ${activeTab === 'ONLINE' ? 'bg-white/5 text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Online ({MOCK_ONLINE_USERS.length})
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* CHAT VIEW */}
                {activeTab === 'CHAT' && (
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-white/20 italic mt-10">No signals detected...</div>
                            )}

                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.senderId === 'player' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                                    {/* Avatar */}
                                    {msg.type !== 'SYSTEM' && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-lg border border-white/10 ${msg.senderId === 'player' ? 'bg-gradient-to-br from-orange-600 to-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-800'}`}>
                                            {msg.senderAvatar}
                                        </div>
                                    )}

                                    <div className={`flex flex-col max-w-[85%] ${msg.senderId === 'player' ? 'items-end' : 'items-start'}`}>
                                        {msg.type !== 'SYSTEM' && (
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">{msg.senderName}</span>
                                                <span className="text-[8px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}

                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${msg.type === 'SYSTEM' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-200 w-full text-center text-xs font-bold uppercase tracking-wide py-2' :
                                            msg.senderId === 'player' ? 'bg-white/10 text-white rounded-tr-none border border-white/10' : 'bg-black/40 text-white/90 border border-white/5 rounded-tl-none'
                                            }`}>
                                            {msg.content}

                                            {/* Request Actions */}
                                            {msg.requestStatus === 'PENDING' && msg.senderId !== 'player' && (
                                                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const success = giftItem(msg.senderName, 'LIFE', 1);
                                                            if (success) grantRequest(msg.id);
                                                            else alert("Not enough shards (100)!");
                                                        }}
                                                        className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 text-[10px] font-black py-2 rounded-lg uppercase tracking-wider transition-all"
                                                    >
                                                        Gift Life
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const success = giftItem(msg.senderName, 'WOOD', 50);
                                                            if (success) grantRequest(msg.id);
                                                            else alert("Not enough wood!");
                                                        }}
                                                        className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 text-[10px] font-black py-2 rounded-lg uppercase tracking-wider transition-all"
                                                    >
                                                        Gift 50 Wood
                                                    </button>
                                                </div>
                                            )}
                                            {msg.requestStatus === 'GRANTED' && (
                                                <div className="mt-2 text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 bg-green-500/10 py-1 rounded">
                                                    <span>✓ Granted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                {/* ONLINE VIEW */}
                {activeTab === 'ONLINE' && (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {MOCK_ONLINE_USERS.map(user => (
                            <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group animate-in slide-in-from-right-2 duration-300">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg shadow-inner">
                                    {user.avatar}
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#151515] ${user.status === 'PLAYING' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white text-sm">{user.name}</div>
                                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{user.status}</div>
                                </div>
                                <button
                                    onClick={() => giftItem(user.name, 'WOOD', 10)}
                                    className="p-2 rounded-lg bg-orange-600/20 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-600 hover:text-white"
                                    title="Send Gift"
                                >
                                    🎁
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            {activeTab === 'CHAT' && (
                <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/5 space-y-3 relative z-20">
                    {!compact && (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar items-center">
                            <span className="text-[9px] font-bold text-white/30 uppercase mr-2">Quick Request:</span>
                            <button onClick={() => handleRequest('HP')} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[9px] font-black uppercase hover:bg-red-500/20 transition-all whitespace-nowrap active:scale-95 flex items-center gap-1">
                                🆘 Life
                            </button>
                            <button onClick={() => handleRequest('WEAPON')} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[9px] font-black uppercase hover:bg-blue-500/20 transition-all whitespace-nowrap active:scale-95 flex items-center gap-1">
                                ⚔️ Weapon
                            </button>
                            <button onClick={() => handleRequest('RESOURCE')} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[9px] font-black uppercase hover:bg-amber-500/20 transition-all whitespace-nowrap active:scale-95 flex items-center gap-1">
                                🪵 Supplies
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        {showEmojis && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl grid grid-cols-6 gap-1 w-64 animate-in zoom-in-95 duration-200 z-50">
                                {EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="aspect-square flex items-center justify-center hover:bg-white/10 rounded-lg text-xl transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="flex gap-2 items-center">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={compact ? "Comms..." : "Transmit message..."}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojis(!showEmojis)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors hover:scale-110 active:scale-95"
                                >
                                    😀
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="w-12 h-11 bg-orange-600 hover:bg-orange-500 rounded-xl flex items-center justify-center text-white text-lg disabled:opacity-50 disabled:bg-white/5 transition-all shadow-lg active:scale-95"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                    {!compact && (
                        <div className="flex justify-between items-center pt-1 px-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Secure Channel Encrypted</span>
                            <DeeJayLabsLogo className="scale-50 opacity-20" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPanel;
