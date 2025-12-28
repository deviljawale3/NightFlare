
import React, { useState } from 'react';
import { useGameStore } from '../store';
import { Friend, FriendRequest, DirectChallenge } from '../types';

interface FriendsPanelProps {
    onBack: () => void;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ onBack }) => {
    const {
        friends,
        friendRequests,
        directChallenges,
        addFriend,
        removeFriend,
        sendFriendRequest,
        acceptFriendRequest,
        sendDirectChallenge,
        userProfile
    } = useGameStore();

    const [activeTab, setActiveTab] = useState<'FRIENDS' | 'REQUESTS' | 'CHALLENGES'>('FRIENDS');
    const [searchId, setSearchId] = useState('');

    const handleSendRequest = () => {
        if (!searchId) return;
        sendFriendRequest(searchId, searchId, '🎮');
        setSearchId('');
        alert(`Friend request sent to ${searchId}!`);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/10 to-transparent flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Social Network</h2>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Connect with other survivors</div>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-600 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold">✕</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/40">
                    <button
                        onClick={() => setActiveTab('FRIENDS')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'FRIENDS' ? 'text-blue-400 bg-blue-500/5' : 'text-white/30 hover:text-white/60'}`}
                    >
                        Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('REQUESTS')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REQUESTS' ? 'text-orange-400 bg-orange-500/5' : 'text-white/30 hover:text-white/60'}`}
                    >
                        Requests ({friendRequests.filter(r => r.status === 'PENDING').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('CHALLENGES')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CHALLENGES' ? 'text-red-400 bg-red-500/5' : 'text-white/30 hover:text-white/60'}`}
                    >
                        Challenges ({directChallenges.filter(c => c.status === 'PENDING').length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

                    {activeTab === 'FRIENDS' && (
                        <>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Enter Survivor ID..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500 placeholder:text-white/20"
                                />
                                <button
                                    onClick={handleSendRequest}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Add Friend
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {friends.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                                        No friends yet. Start adding survivors!
                                    </div>
                                ) : (
                                    friends.map(friend => (
                                        <div key={friend.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all group">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center text-3xl">
                                                    {friend.avatar}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-white/20'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-black uppercase text-sm">{friend.name}</div>
                                                <div className="text-white/30 text-[10px] font-bold uppercase tracking-tighter">
                                                    Rank: {friend.rank} • W/L: {friend.wins}/{friend.losses}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => sendDirectChallenge(friend.id, 100, 'SCORE_RUSH')}
                                                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-all text-[10px] font-black uppercase opacity-0 group-hover:opacity-100"
                                                >
                                                    Duel
                                                </button>
                                                <button
                                                    onClick={() => removeFriend(friend.id)}
                                                    className="bg-white/5 hover:bg-red-900/40 text-white/20 hover:text-red-400 p-2 rounded-lg transition-all text-xs opacity-0 group-hover:opacity-100"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'REQUESTS' && (
                        <div className="space-y-3">
                            {friendRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                                <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                                    No pending requests
                                </div>
                            ) : (
                                friendRequests.filter(r => r.status === 'PENDING').map(req => (
                                    <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-600/20 border-2 border-orange-500/30 flex items-center justify-center text-2xl">
                                            {req.fromAvatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-black uppercase text-sm">{req.fromName}</div>
                                            <div className="text-white/30 text-[10px] font-bold uppercase tracking-tighter">
                                                Wants to connect • {new Date(req.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptFriendRequest(req.id)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Accept
                                            </button>
                                            <button className="bg-white/5 hover:bg-white/10 text-white/30 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'CHALLENGES' && (
                        <div className="space-y-3">
                            {directChallenges.filter(c => c.status === 'PENDING').length === 0 ? (
                                <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                                    No active challenges
                                </div>
                            ) : (
                                directChallenges.filter(c => c.status === 'PENDING').map(challenge => (
                                    <div key={challenge.id} className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-4xl animate-pulse">
                                            {challenge.fromAvatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-red-500 font-black uppercase text-xs tracking-[0.2em] mb-1">Direct Challenge</div>
                                            <div className="text-white font-black uppercase text-xl">{challenge.fromName}</div>
                                            <div className="flex gap-4 mt-2">
                                                <div className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-[10px] font-black text-yellow-500">
                                                    ✨ {challenge.wager} SHARDS
                                                </div>
                                                <div className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-[10px] font-black text-white/60 uppercase">
                                                    {challenge.mode.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => useGameStore.getState().acceptDirectChallenge(challenge.id)}
                                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Accept Duel
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center items-center gap-6">
                    <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                        Your Link ID: <span className="text-blue-500 select-all">{userProfile.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendsPanel;
