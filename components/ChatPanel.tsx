import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { WeaponType } from '../types';

interface ChatPanelProps {
    compact?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ compact }) => {
    const { chatMessages, addChatMessage, grantRequest, userProfile } = useGameStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        addChatMessage({ content: inputText, type: 'CHAT' });
        setInputText('');
    };

    const handleRequest = (type: 'HP' | 'WEAPON') => {
        if (type === 'HP') {
            addChatMessage({
                content: 'Requesting Life Support!',
                type: 'REQUEST_LIFE'
            });
        } else {
            addChatMessage({
                content: 'Requesting Weapon Upgrade!',
                type: 'REQUEST_WEAPON',
                weaponType: WeaponType.SWORD // Default or selector
            });
        }
    };

    return (
        <div className={`flex flex-col h-full ${compact ? 'text-xs' : ''}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {chatMessages.length === 0 && (
                    <div className="text-center text-white/20 italic mt-10">No signals detected...</div>
                )}

                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.senderId === 'player' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                        {/* Avatar */}
                        {msg.type !== 'SYSTEM' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${msg.senderId === 'player' ? 'bg-orange-600' : 'bg-white/10'}`}>
                                {msg.senderAvatar}
                            </div>
                        )}

                        <div className={`flex flex-col max-w-[80%] ${msg.senderId === 'player' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase">{msg.senderName}</span>
                                <span className="text-[8px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'SYSTEM' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-200 w-full text-center' :
                                msg.senderId === 'player' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-[#1a1a1a] text-white/90 border border-white/5 rounded-tl-none'
                                }`}>
                                {msg.content}

                                {/* Request Actions */}
                                {msg.requestStatus === 'PENDING' && msg.senderId !== 'player' && (
                                    <div className="mt-2 pt-2 border-t border-white/10 flex gap-2">
                                        <button
                                            onClick={() => grantRequest(msg.id)}
                                            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold py-1.5 rounded uppercase tracking-wider transition-colors"
                                        >
                                            Grant Request
                                        </button>
                                    </div>
                                )}
                                {msg.requestStatus === 'GRANTED' && (
                                    <div className="mt-1 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                                        ✓ Granted
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#080808]/95 backdrop-blur-md border-t border-white/5 space-y-3">
                {!compact && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                        <button onClick={() => handleRequest('HP')} className="px-3 py-1.5 bg-red-900/20 border border-red-500/20 rounded-full text-red-400 text-[10px] font-black uppercase hover:bg-red-900/40 transition-all whitespace-nowrap active:scale-95">
                            🆘 Request Life
                        </button>
                        <button onClick={() => handleRequest('WEAPON')} className="px-3 py-1.5 bg-blue-900/20 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase hover:bg-blue-900/40 transition-all whitespace-nowrap active:scale-95">
                            ⚔️ Request Weapon
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-center relative">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={compact ? "Comms..." : "Transmit to global channel..."}
                            className="w-full bg-[#151515] border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:bg-black transition-all placeholder:text-white/20 shadow-inner"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <button type="button" className="text-white/20 hover:text-white transition-colors p-1" onClick={() => setInputText(p => p + '👍')}>👍</button>
                            <button type="button" className="text-white/20 hover:text-white transition-colors p-1" onClick={() => setInputText(p => p + '🔥')}>🔥</button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="w-12 h-12 bg-orange-600 hover:bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg disabled:opacity-50 disabled:bg-white/5 transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)] active:scale-95"
                    >
                        ➤
                    </button>
                </form>
                {!compact && (
                    <div className="flex justify-center pt-1 opacity-20 hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">DeeJay Labs Comms v2.0</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
