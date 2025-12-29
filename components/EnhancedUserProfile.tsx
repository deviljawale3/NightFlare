import React, { useState } from 'react';
import { useGameStore } from '../store';
import useAchievementStore from './AchievementSystem';
import DeeJayLabsLogo from './DeeJayLabsLogo';

interface EnhancedUserProfileProps {
    onClose: () => void;
}

const EnhancedUserProfile: React.FC<EnhancedUserProfileProps> = ({ onClose }) => {
    const {
        userProfile,
        updateUserProfile,
        bestScore,
        lastWave,
        kills,
        getNightName,
        battleHistory
    } = useGameStore();

    const { achievements } = useAchievementStore();

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(userProfile.name);
    const [editEmail, setEditEmail] = useState(userProfile.email);
    const [editAvatar, setEditAvatar] = useState(userProfile.avatar);
    const [editBio, setEditBio] = useState(userProfile.bio || '');
    const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'activity' | 'social'>('stats');

    const avatarOptions = ['🤠', '🦁', '🦊', '🦉', '💀', '🤖', '👽', '👑', '🎮', '⚔️', '🔥', '💎'];

    const handleSave = () => {
        updateUserProfile({
            name: editName,
            email: editEmail,
            avatar: editAvatar,
            bio: editBio
        });
        setEditMode(false);
    };

    // Calculate stats
    const totalPlayTime = battleHistory.reduce((acc, battle) => acc + (battle.duration || 0), 0);
    const totalKills = battleHistory.reduce((acc, battle) => acc + (battle.kills || 0), 0);
    const totalGames = battleHistory.length;
    const winRate = totalGames > 0 ? (battleHistory.filter(b => b.result === 'VICTORY').length / totalGames * 100) : 0;
    const avgScore = totalGames > 0 ? battleHistory.reduce((acc, b) => acc + (b.playerScore || 0), 0) / totalGames : 0;

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300 safe-padding overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl w-full max-w-4xl border-2 border-white/10 shadow-2xl relative overflow-hidden max-h-[95vh] flex flex-col">

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

                {/* Header */}
                <div className="relative z-10 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-orange-900/20 to-transparent">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">Survivor Profile</h2>
                            <p className="text-white/50 text-xs uppercase tracking-wider font-bold mt-1">Complete Stats & Achievements</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-red-600 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-90"
                        >
                            <span className="text-xl font-bold">✕</span>
                        </button>
                    </div>
                </div>

                {/* Profile Header Section */}
                <div className="relative z-10 p-4 sm:p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-600 to-red-600 border-4 border-white/20 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl relative overflow-hidden">
                                    {userProfile.avatar.startsWith('data:') ? (
                                        <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        editAvatar
                                    )}
                                    {editMode && (
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-xs font-bold text-white uppercase">Change</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            const img = new Image();
                                                            img.onload = () => {
                                                                const canvas = document.createElement('canvas');
                                                                const ctx = canvas.getContext('2d');
                                                                const size = 128;
                                                                canvas.width = size;
                                                                canvas.height = size;
                                                                if (ctx) {
                                                                    const scale = Math.max(size / img.width, size / img.height);
                                                                    const x = (size / 2) - (img.width / 2) * scale;
                                                                    const y = (size / 2) - (img.height / 2) * scale;
                                                                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                                                    setEditAvatar(canvas.toDataURL('image/jpeg', 0.8));
                                                                }
                                                            };
                                                            img.src = ev.target?.result as string;
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Level Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full px-3 py-1 border-2 border-white/30 shadow-lg">
                                    <span className="text-white font-black text-xs">LVL {Math.floor(bestScore / 10000) + 1}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 w-full">
                            {editMode ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Enter Name"
                                        className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white font-bold text-lg focus:outline-none focus:border-orange-500 uppercase tracking-wider"
                                    />
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        placeholder="Email (Optional)"
                                        className="w-full bg-black/50 border border-white/20 rounded-xl p-2 text-white/70 font-bold text-sm focus:outline-none focus:border-cyan-500"
                                    />
                                    <textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        placeholder="Bio / Status Message"
                                        className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white/70 font-bold text-sm focus:outline-none focus:border-cyan-500 resize-none"
                                        rows={2}
                                    />

                                    {/* Avatar Picker */}
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                        {avatarOptions.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setEditAvatar(emoji)}
                                                className={`h-10 rounded-lg text-xl flex items-center justify-center transition-all ${editAvatar === emoji ? 'bg-orange-600 scale-110' : 'bg-white/5 hover:bg-white/10'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{userProfile.name}</h3>
                                    {userProfile.email && (
                                        <p className="text-cyan-400 text-sm font-bold mt-1">{userProfile.email}</p>
                                    )}
                                    {userProfile.bio && (
                                        <p className="text-white/60 text-sm mt-2 italic">{userProfile.bio}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg px-3 py-1">
                                            <span className="text-orange-400 text-xs font-black">ID: {userProfile.name.toUpperCase().slice(0, 8)}</span>
                                        </div>
                                        <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg px-3 py-1">
                                            <span className="text-cyan-400 text-xs font-black">{bestScore.toLocaleString()} PTS</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit/Save Buttons */}
                            <div className="flex gap-2 mt-4">
                                {editMode ? (
                                    <>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative z-10 flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
                    {[
                        { id: 'stats', label: 'Statistics', icon: '📊' },
                        { id: 'achievements', label: 'Achievements', icon: '🏆' },
                        { id: 'activity', label: 'Activity', icon: '📜' },
                        { id: 'social', label: 'Social', icon: '👥' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">

                    {/* STATS TAB */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-orange-400 text-3xl font-black tabular-nums">{bestScore.toLocaleString()}</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">High Score</div>
                                </div>
                                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-cyan-400 text-3xl font-black tabular-nums">{lastWave || 0}</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Best Wave</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-red-400 text-3xl font-black tabular-nums">{totalKills.toLocaleString()}</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Total Kills</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-purple-400 text-3xl font-black tabular-nums">{totalGames}</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Games Played</div>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Detailed Statistics</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <StatRow label="Total Play Time" value={formatTime(totalPlayTime)} />
                                    <StatRow label="Average Score" value={Math.floor(avgScore).toLocaleString()} />
                                    <StatRow label="Win Rate" value={`${winRate.toFixed(1)}%`} />
                                    <StatRow label="Kills Per Game" value={(totalKills / Math.max(1, totalGames)).toFixed(1)} />
                                    <StatRow label="Favorite Weapon" value="Sword" />
                                    <StatRow label="Most Killed Enemy" value="Stalker" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACHIEVEMENTS TAB */}
                    {activeTab === 'achievements' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-white/50 text-sm uppercase tracking-wider">Achievement Progress</div>
                                <div className="text-white text-2xl font-black mt-1">
                                    {achievements.filter(a => a.unlocked).length} / {achievements.length}
                                </div>
                            </div>

                            {achievements.slice(0, 10).map(achievement => (
                                <div
                                    key={achievement.id}
                                    className={`bg-gradient-to-r ${achievement.unlocked ? 'from-yellow-900/30 to-orange-900/30 border-yellow-500/30' : 'from-white/5 to-white/5 border-white/10'} border rounded-2xl p-4 flex items-center gap-4`}
                                >
                                    <div className={`text-4xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-30'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-black uppercase text-sm ${achievement.unlocked ? 'text-yellow-400' : 'text-white/50'}`}>
                                            {achievement.title}
                                        </h4>
                                        <p className="text-white/40 text-xs mt-1">{achievement.description}</p>
                                        {!achievement.unlocked && achievement.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                                                        style={{ width: `${(achievement.progress / (achievement.requirement || 1)) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="text-white/30 text-[10px] mt-1">{achievement.progress} / {achievement.requirement}</div>
                                            </div>
                                        )}
                                    </div>
                                    {achievement.unlocked && achievement.unlockedAt && (
                                        <div className="text-white/30 text-[10px] text-right">
                                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACTIVITY TAB */}
                    {activeTab === 'activity' && (
                        <div className="space-y-3">
                            <div className="text-white/50 text-sm uppercase tracking-wider mb-4">Recent Battles</div>
                            {battleHistory.slice(0, 15).map((battle, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-gradient-to-r ${battle.result === 'VICTORY' ? 'from-green-900/20 to-cyan-900/20 border-green-500/20' : 'from-red-900/20 to-orange-900/20 border-red-500/20'} border rounded-xl p-4 flex items-center justify-between`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`text-2xl ${battle.result === 'VICTORY' ? '🏆' : '💀'}`}>
                                            {battle.result === 'VICTORY' ? '🏆' : '💀'}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">
                                                {battle.result === 'VICTORY' ? 'VICTORY' : 'DEFEATED'}
                                            </div>
                                            <div className="text-white/40 text-xs">
                                                Wave {battle.wave || 0} • {battle.kills || 0} kills
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-black text-sm ${battle.result === 'VICTORY' ? 'text-cyan-400' : 'text-orange-400'}`}>
                                            {(battle.playerScore || 0).toLocaleString()}
                                        </div>
                                        <div className="text-white/30 text-[10px]">
                                            {battle.date ? new Date(battle.date).toLocaleDateString() : 'Recent'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SOCIAL TAB */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-blue-400 text-3xl font-black">0</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Friends</div>
                                </div>
                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-purple-400 text-3xl font-black">0</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Challenges</div>
                                </div>
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-yellow-400 text-3xl font-black">-</div>
                                    <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">Rank</div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                                <div className="text-4xl mb-3">👥</div>
                                <h3 className="text-white font-black uppercase text-sm mb-2">Connect with Friends</h3>
                                <p className="text-white/50 text-xs mb-4">Add friends to compete and share your achievements</p>
                                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider">
                                    Add Friends
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="relative z-10 p-4 border-t border-white/10 flex justify-center opacity-40">
                    <DeeJayLabsLogo />
                </div>
            </div>
        </div>
    );
};

// Helper Component
const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
        <span className="text-white/60 text-sm font-bold">{label}</span>
        <span className="text-white font-black text-sm tabular-nums">{value}</span>
    </div>
);

export default EnhancedUserProfile;
