import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store';

interface EnhancedChatProps {
    compact?: boolean;
}

// Emoji picker data (simplified - in production use emoji-picker-react)
const EMOJI_CATEGORIES = {
    'Reactions': ['👍', '❤️', '🔥', '😂', '😮', '😢', '🎉', '💪'],
    'Emotions': ['😀', '😎', '🤔', '😅', '🥳', '😴', '🤯', '🤩'],
    'Game': ['⚔️', '🛡️', '💎', '🏆', '🎮', '🎯', '💀', '🧟'],
};

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂'];

interface Message {
    id: string;
    sender: string;
    avatar: string;
    content: string;
    timestamp: number;
    reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
    isSystem?: boolean;
    mentions?: string[];
}

const EnhancedChat: React.FC<EnhancedChatProps> = ({ compact = false }) => {
    const { chatMessages, addChatMessage, userProfile } = useGameStore();
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Enhanced messages with reactions support
    const [enhancedMessages, setEnhancedMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'System',
            avatar: '🤖',
            content: 'Welcome to NightFlare! Chat with survivors worldwide.',
            timestamp: Date.now() - 60000,
            isSystem: true
        }
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [enhancedMessages]);

    const handleSend = () => {
        if (!message.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: userProfile.name,
            avatar: userProfile.avatar,
            content: message,
            timestamp: Date.now(),
            reactions: {},
            mentions: extractMentions(message)
        };

        setEnhancedMessages(prev => [...prev, newMessage]);
        addChatMessage({ content: message, type: 'CHAT' });
        setMessage('');
        setReplyTo(null);
        setShowEmojiPicker(false);
    };

    const handleReaction = (messageId: string, emoji: string) => {
        setEnhancedMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...msg.reactions };
                if (!reactions[emoji]) {
                    reactions[emoji] = [];
                }

                const userId = userProfile.name;
                if (reactions[emoji].includes(userId)) {
                    // Remove reaction
                    reactions[emoji] = reactions[emoji].filter(id => id !== userId);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    // Add reaction
                    reactions[emoji].push(userId);
                }

                return { ...msg, reactions };
            }
            return msg;
        }));
    };

    const extractMentions = (text: string): string[] => {
        const mentions = text.match(/@\w+/g);
        return mentions ? mentions.map(m => m.slice(1)) : [];
    };

    const insertEmoji = (emoji: string) => {
        setMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const mins = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
    };

    return (
        <div className={`flex flex-col ${compact ? 'h-full' : 'h-96'} bg-black/20`}>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {enhancedMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredMessage(msg.id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                    >
                        {msg.isSystem ? (
                            // System Message
                            <div className="text-center">
                                <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                                    <span className="text-white/50 text-xs font-bold">{msg.content}</span>
                                </div>
                            </div>
                        ) : (
                            // User Message
                            <div className={`flex gap-2 ${msg.sender === userProfile.name ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 border-2 border-white/20 flex items-center justify-center text-lg">
                                    {msg.avatar}
                                </div>

                                {/* Message Content */}
                                <div className={`flex-1 max-w-[75%] ${msg.sender === userProfile.name ? 'items-end' : 'items-start'} flex flex-col`}>

                                    {/* Sender Name & Time */}
                                    <div className={`flex items-center gap-2 mb-1 ${msg.sender === userProfile.name ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-white/70 text-xs font-bold">{msg.sender}</span>
                                        <span className="text-white/30 text-[10px]">{formatTime(msg.timestamp)}</span>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`rounded-2xl px-4 py-2 ${msg.sender === userProfile.name
                                        ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-tr-sm'
                                        : 'bg-white/10 text-white rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm font-medium break-words">{msg.content}</p>
                                    </div>

                                    {/* Reactions */}
                                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${users.includes(userProfile.name)
                                                        ? 'bg-orange-600/50 border border-orange-400'
                                                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                                                        }`}
                                                >
                                                    <span>{emoji}</span>
                                                    <span className="text-white/70 font-bold">{users.length}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick Reactions (on hover) */}
                                    {hoveredMessage === msg.id && !msg.isSystem && (
                                        <div className="flex gap-1 mt-1 animate-in fade-in duration-200">
                                            {QUICK_REACTIONS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                    className="w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full text-sm transition-all hover:scale-125"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
                <div className="px-3 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="text-white/50 text-xs font-bold">Replying to {replyTo.sender}</div>
                        <div className="text-white/70 text-xs truncate">{replyTo.content}</div>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="text-white/50 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 right-0 bg-gray-900 border border-white/20 rounded-t-2xl p-4 max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom duration-200 z-50">
                    {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                        <div key={category} className="mb-4">
                            <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{category}</div>
                            <div className="grid grid-cols-8 gap-2">
                                {emojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => insertEmoji(emoji)}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition-all hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-black/40 border-t border-white/10">
                <div className="flex gap-2">
                    {/* Emoji Button */}
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showEmojiPicker ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        😀
                    </button>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message... (use @ to mention)"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium focus:outline-none focus:border-orange-500 placeholder:text-white/30"
                    />

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl text-white font-bold transition-all disabled:cursor-not-allowed"
                    >
                        ➤
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-2">
                    <button className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all">
                        📷 Share
                    </button>
                    <button className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all">
                        🎁 Gift
                    </button>
                    <button className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all">
                        ⚔️ Challenge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedChat;
