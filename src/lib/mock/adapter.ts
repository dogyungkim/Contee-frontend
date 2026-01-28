import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    MOCK_TEAMS,
    MOCK_MEMBERS_TEAM_1,
    MOCK_MEMBERS_TEAM_2,
    MOCK_USER,
    MOCK_CONTIS,
    MOCK_CONTI_SONGS,
    MOCK_TEAM_SONGS,
    MOCK_MASTER_SONGS
} from './data';
import { Conti, ContiSong } from '@/types/conti';
import { Team, TeamMember } from '@/types/team';
import { TeamSong } from '@/types/song';

// Helper to create successful response
const success = (data: unknown): AxiosResponse => {
    return {
        data: {
            success: true,
            message: 'Mock Success',
            data,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};

export const mockAdapter: AxiosAdapter = async (config) => {
    const { url, method, data } = config;
    const methodUpper = method?.toUpperCase();

    console.log(`[MockAdapter] ${methodUpper} ${url}`, { data, headers: config.headers });

    // Intentional delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    // --- Teams API ---
    if (url === '/api/v1/teams' && methodUpper === 'POST') {
        const body = data ? JSON.parse(data) : {};
        const newTeam: Team = {
            members: [],
            id: `team-${Date.now()}`,
            name: body.name || 'New Team',
            shortCode: 'NEW12345',
            description: body.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberCount: 1,
        };
        MOCK_TEAMS.push(newTeam);
        return success(newTeam);
    }

    if (url === '/api/v1/teams' && methodUpper === 'GET') {
        return success(MOCK_TEAMS);
    }

    // --- Conti API ---
    const teamContisMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/contis$/);
    if (teamContisMatch && methodUpper === 'GET') {
        const teamId = teamContisMatch[1];
        return success(MOCK_CONTIS.filter(c => c.teamId === teamId));
    }

    if (teamContisMatch && methodUpper === 'POST') {
        const teamId = teamContisMatch[1];
        const body = data ? JSON.parse(data) : {};
        const newConti: Conti = {
            id: `conti-${Date.now()}`,
            teamId,
            title: body.title,
            worshipDate: body.worshipDate,
            memo: body.memo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_CONTIS.push(newConti);
        return success(newConti);
    }

    const contiDetailMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)$/);
    if (contiDetailMatch && methodUpper === 'GET') {
        const id = contiDetailMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === id);
        return success(conti);
    }

    // --- Conti Songs API ---
    const contiSongsMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/songs$/);
    if (contiSongsMatch && methodUpper === 'GET') {
        const contiId = contiSongsMatch[1];
        return success(MOCK_CONTI_SONGS.filter(cs => cs.contiId === contiId));
    }

    if (contiSongsMatch && methodUpper === 'POST') {
        const contiId = contiSongsMatch[1];
        const body = data ? JSON.parse(data) : {};
        const teamSong = MOCK_TEAM_SONGS.find(ts => ts.id === body.teamSongId);

        const newContiSong: ContiSong = {
            songTitle: 'New Song', // Default title, or fetch from teamSong if available in real logic
            songArtist: teamSong?.artist || 'Unknown',
            songForm: [],
            id: `cs-${Date.now()}`,
            contiId,
            teamSongId: body.teamSongId,
            orderIndex: body.orderIndex,
            keyOverride: body.keyOverride,
            bpmOverride: body.bpmOverride,
            note: body.note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            teamSong: teamSong,
        };
        MOCK_CONTI_SONGS.push(newContiSong);
        return success(newContiSong);
    }

    const contiSongDetailMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/songs\/([a-zA-Z0-9-]+)$/);
    if (contiSongDetailMatch && methodUpper === 'DELETE') {
        const id = contiSongDetailMatch[2];
        const index = MOCK_CONTI_SONGS.findIndex(cs => cs.id === id);
        if (index > -1) MOCK_CONTI_SONGS.splice(index, 1);
        return success(null);
    }

    if (contiSongDetailMatch && methodUpper === 'PATCH') {
        const id = contiSongDetailMatch[2];
        const body = data ? JSON.parse(data) : {};
        const song = MOCK_CONTI_SONGS.find(cs => cs.id === id);
        if (song) {
            Object.assign(song, body, { updatedAt: new Date().toISOString() });
            return success(song);
        }
    }

    const contiSongsOrderMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/songs\/order$/);
    if (contiSongsOrderMatch && methodUpper === 'PUT') {
        const contiId = contiSongsOrderMatch[1];
        const body = data ? JSON.parse(data) : {};
        const { contiSongIds } = body;

        if (Array.isArray(contiSongIds)) {
            // In a real DB we'd update index. 
            // In mock, we can just re-sort MOCK_CONTI_SONGS for this conti, or update orderIndex on items.
            contiSongIds.forEach((id, index) => {
                const match = MOCK_CONTI_SONGS.find(cs => cs.id === id);
                if (match) match.orderIndex = index;
            });
            // Sort mock storage to reflect order if needed, but orderIndex is what matters.
        }
        return success(null);
    }

    // --- Team Songs API ---
    const teamSongsMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/songs$/);
    if (teamSongsMatch && methodUpper === 'GET') {
        const teamId = teamSongsMatch[1];
        return success(MOCK_TEAM_SONGS.filter(ts => ts.teamId === teamId));
    }

    if (teamSongsMatch && methodUpper === 'POST') {
        const teamId = teamSongsMatch[1];
        const body = data ? JSON.parse(data) : {};
        const newTeamSong: TeamSong = {
            id: `ts-${Date.now()}`,
            teamId,
            customTitle: body.customTitle,
            artist: body.artist,
            keySignature: body.customKeySignature,
            bpm: body.customBpm,
            youtubeUrl: body.youtubeUrl,
            sheetMusicUrl: body.sheetMusicUrl,
            note: body.note,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_TEAM_SONGS.push(newTeamSong);
        return success(newTeamSong);
    }

    // --- Master Songs API (Search) ---
    if (url === '/api/v1/songs' && methodUpper === 'GET') {
        const query = config.params?.q;
        if (!query) return success(MOCK_MASTER_SONGS.slice(0, 10)); // return recent/popular if no query

        const filtered = MOCK_MASTER_SONGS.filter(s =>
            s.title.includes(query) || s.artist.includes(query)
        );
        return success(filtered);
    }

    // --- Dashboard API ---
    if (url === '/api/v1/dashboard/summary' && methodUpper === 'GET') {
        const { MOCK_DASHBOARD_SUMMARY } = await import('./data');
        return success(MOCK_DASHBOARD_SUMMARY);
    }

    if (url === '/api/v1/dashboard' && methodUpper === 'GET') {
        const {
            MOCK_DASHBOARD_SUMMARY,
            MOCK_RECENT_CONTIS,
            MOCK_SONGS,
            MOCK_ACTIVITIES,
        } = await import('./data');
        return success({
            summary: MOCK_DASHBOARD_SUMMARY,
            recentContis: MOCK_RECENT_CONTIS,
            songs: MOCK_SONGS,
            activities: MOCK_ACTIVITIES,
        });
    }

    // Default fallback
    console.warn(`[MockAdapter] Unhandled request: ${methodUpper} ${url}`);
    return {
        data: { success: false, message: 'Mock route not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};
