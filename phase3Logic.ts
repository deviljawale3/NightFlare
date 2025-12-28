// Phase 3 Store Logic - Tournament, Friends, Seasons, Analytics, Multiplayer
import type {
    Tournament, Friend, FriendRequest, DirectChallenge, Season,
    PlayerAnalytics, MultiplayerState, TournamentParticipant, TournamentMatch,
    ChallengeMode, PlayerRank
} from './types';

// INITIAL STATE GENERATORS
export const getInitialTournaments = (): Tournament[] => {
    const stored = localStorage.getItem('nightflare_tournaments');
    return stored ? JSON.parse(stored) : [];
};

export const getInitialFriends = (): Friend[] => {
    const stored = localStorage.getItem('nightflare_friends');
    return stored ? JSON.parse(stored) : [];
};

export const getInitialFriendRequests = (): FriendRequest[] => {
    const stored = localStorage.getItem('nightflare_friend_requests');
    return stored ? JSON.parse(stored) : [];
};

export const getInitialDirectChallenges = (): DirectChallenge[] => {
    const stored = localStorage.getItem('nightflare_direct_challenges');
    return stored ? JSON.parse(stored) : [];
};

export const getInitialSeason = (): Season | undefined => {
    const stored = localStorage.getItem('nightflare_current_season');
    return stored ? JSON.parse(stored) : undefined;
};

export const getInitialSeasonHistory = (): Season[] => {
    const stored = localStorage.getItem('nightflare_season_history');
    return stored ? JSON.parse(stored) : [];
};

export const getInitialAnalytics = (): PlayerAnalytics => {
    const stored = localStorage.getItem('nightflare_analytics');
    return stored ? JSON.parse(stored) : {
        winRateByMode: { SCORE_RUSH: 0, SUDDEN_DEATH: 0 },
        averageScore: 0,
        averageDuration: 0,
        bestOpponent: '',
        worstOpponent: '',
        peakPerformanceTime: 'Unknown',
        recentForm: [],
        scoreHistory: [],
        rankHistory: []
    };
};

export const getInitialMultiplayerState = (): MultiplayerState => ({
    enabled: false,
    connectionStatus: 'DISCONNECTED',
    opponentConnected: false
});

// TOURNAMENT LOGIC
export const createTournamentBracket = (participants: TournamentParticipant[]): TournamentMatch[] => {
    const bracket: TournamentMatch[] = [];
    const rounds = Math.ceil(Math.log2(participants.length));

    // Round 1
    for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
            bracket.push({
                id: `match-1-${i / 2}`,
                round: 1,
                matchNumber: i / 2,
                player1: {
                    id: participants[i].id,
                    name: participants[i].name,
                    avatar: participants[i].avatar
                },
                player2: {
                    id: participants[i + 1].id,
                    name: participants[i + 1].name,
                    avatar: participants[i + 1].avatar
                },
                completed: false
            });
        }
    }

    return bracket;
};

export const advanceTournamentRound = (tournament: Tournament): Tournament => {
    const currentRound = Math.max(...tournament.bracket.map(m => m.round));
    const currentMatches = tournament.bracket.filter(m => m.round === currentRound);

    // Check if all matches in current round are complete
    const allComplete = currentMatches.every(m => m.completed);
    if (!allComplete) return tournament;

    // Create next round matches
    const winners = currentMatches.map(m => {
        const winner = m.winner === m.player1.id ? m.player1 : m.player2;
        return winner;
    });

    if (winners.length === 1) {
        // Tournament complete
        return { ...tournament, status: 'COMPLETED' };
    }

    const nextRound = currentRound + 1;
    const newMatches: TournamentMatch[] = [];

    for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
            newMatches.push({
                id: `match-${nextRound}-${i / 2}`,
                round: nextRound,
                matchNumber: i / 2,
                player1: winners[i],
                player2: winners[i + 1],
                completed: false
            });
        }
    }

    return {
        ...tournament,
        bracket: [...tournament.bracket, ...newMatches]
    };
};

// ANALYTICS CALCULATIONS
export const calculateWinRate = (wins: number, total: number): number => {
    return total > 0 ? Math.round((wins / total) * 100) / 100 : 0;
};

export const calculatePeakTime = (battleHistory: any[]): string => {
    if (battleHistory.length === 0) return 'Unknown';

    const timeSlots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

    battleHistory.forEach(battle => {
        const hour = new Date(battle.date).getHours();
        if (hour >= 6 && hour < 12) timeSlots.Morning++;
        else if (hour >= 12 && hour < 18) timeSlots.Afternoon++;
        else if (hour >= 18 && hour < 22) timeSlots.Evening++;
        else timeSlots.Night++;
    });

    return Object.entries(timeSlots).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

// SEASON LOGIC
export const createNewSeason = (seasonNumber: number): Season => {
    const now = Date.now();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    return {
        id: `season-${seasonNumber}`,
        name: `Season ${seasonNumber}`,
        number: seasonNumber,
        startDate: now,
        endDate: now + twoWeeks,
        status: 'ACTIVE',
        rewards: [
            { rankThreshold: 'LEGEND', shards: 10000, title: 'Legendary Champion', badge: '👑' },
            { rankThreshold: 'DIAMOND', shards: 5000, title: 'Diamond Elite', badge: '💎' },
            { rankThreshold: 'PLATINUM', shards: 2500, title: 'Platinum Warrior', badge: '⚪' },
            { rankThreshold: 'GOLD', shards: 1000, title: 'Golden Victor', badge: '🟡' },
            { rankThreshold: 'SILVER', shards: 500, title: 'Silver Contender', badge: '⚫' },
            { rankThreshold: 'BRONZE', shards: 100, title: 'Bronze Fighter', badge: '🟤' }
        ],
        topPlayers: []
    };
};

export const checkSeasonEnd = (season: Season): boolean => {
    return Date.now() >= season.endDate;
};

// MULTIPLAYER MOCK (WebSocket placeholder)
export const mockWebSocketConnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate connection
            if (Math.random() > 0.1) { // 90% success rate
                resolve();
            } else {
                reject(new Error('Connection failed'));
            }
        }, 2000);
    });
};

export default {
    getInitialTournaments,
    getInitialFriends,
    getInitialFriendRequests,
    getInitialDirectChallenges,
    getInitialSeason,
    getInitialSeasonHistory,
    getInitialAnalytics,
    getInitialMultiplayerState,
    createTournamentBracket,
    advanceTournamentRound,
    calculateWinRate,
    calculatePeakTime,
    createNewSeason,
    checkSeasonEnd,
    mockWebSocketConnection
};
