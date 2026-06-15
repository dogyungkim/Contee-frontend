import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    MOCK_TEAMS,
    MOCK_CONTIS,
    MOCK_CONTI_SONGS,
    MOCK_TEAM_SONGS,
    MOCK_MASTER_SONGS
} from './data';
import { Conti, ContiSong } from '@/types/conti';
import { Team } from '@/types/team';
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

const failure = (status: number, message: string, code?: string): AxiosResponse => {
    return {
        data: {
            success: false,
            message,
            ...(code ? { code, errorCode: code } : {}),
            data: null,
        },
        status,
        statusText: status === 400 ? 'Bad Request' : status === 409 ? 'Conflict' : 'Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};

const getContiSongs = (contiId: string) =>
    MOCK_CONTI_SONGS
        .filter((song) => song.contiId === contiId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

const getContiDetailData = (conti: Conti): Conti => ({
    ...conti,
    contiSongs: getContiSongs(conti.id),
});

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
    if (url === '/api/v1/contis' && methodUpper === 'GET') {
        const page = Number(config.params?.page ?? 0);
        const size = Number(config.params?.size ?? 20);
        const start = page * size;
        const content = MOCK_CONTIS.slice(start, start + size).map(getContiDetailData);
        const totalElements = MOCK_CONTIS.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / size));

        return success({
            content,
            totalPages,
            totalElements,
        });
    }

    if (url === '/api/v1/contis' && methodUpper === 'POST') {
        const body = data ? JSON.parse(data) : {};
        const newConti: Conti = {
            id: `conti-${Date.now()}`,
            teamId: body.teamId,
            title: body.title,
            worshipDate: body.worshipDate,
            memo: body.memo,
            bibleVerse: body.bibleVerse,
            sharingInfo: body.sharingInfo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_CONTIS.push(newConti);

        const requestSongs = Array.isArray(body.contiSongs) ? body.contiSongs : [];
        requestSongs.forEach((song: Record<string, unknown>, index: number) => {
            const teamSong = song.teamSongId
                ? MOCK_TEAM_SONGS.find((ts) => ts.id === String(song.teamSongId))
                : undefined;
            const contiSong: ContiSong = {
                id: `cs-${Date.now()}-${index}`,
                contiId: newConti.id,
                teamSongId: typeof song.teamSongId === 'string' ? song.teamSongId : undefined,
                customTitle: typeof song.customTitle === 'string' ? song.customTitle : undefined,
                songTitle:
                    (typeof song.customTitle === 'string' && song.customTitle) ||
                    teamSong?.title ||
                    'New Song',
                songArtist:
                    (typeof song.artist === 'string' && song.artist) ||
                    teamSong?.artist ||
                    'Unknown',
                orderIndex:
                    typeof song.orderIndex === 'number' ? song.orderIndex : index,
                keyOverride: typeof song.keyOverride === 'string' ? song.keyOverride : undefined,
                bpmOverride: typeof song.bpmOverride === 'number' ? song.bpmOverride : undefined,
                note: typeof song.contiNote === 'string' ? song.contiNote : undefined,
                songForm: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                teamSong,
            };
            MOCK_CONTI_SONGS.push(contiSong);
        });

        return success(getContiDetailData(newConti));
    }

    const teamContisMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/contis$/);
    if (teamContisMatch && methodUpper === 'GET') {
        const teamId = teamContisMatch[1];
        const page = Number(config.params?.page ?? 0);
        const size = Number(config.params?.size ?? 20);
        const q = String(config.params?.q ?? '').trim().toLowerCase();
        const from = config.params?.from ? String(config.params.from) : undefined;
        const to = config.params?.to ? String(config.params.to) : undefined;
        const filtered = MOCK_CONTIS.filter((conti) => {
            if (conti.teamId !== teamId) return false;
            if (q && !conti.title.toLowerCase().includes(q)) return false;
            if (from && conti.worshipDate < from) return false;
            if (to && conti.worshipDate > to) return false;
            return true;
        });
        const start = page * size;
        return success({
            content: filtered.slice(start, start + size).map(getContiDetailData),
            totalPages: Math.max(1, Math.ceil(filtered.length / size)),
            totalElements: filtered.length,
        });
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
        return success(getContiDetailData(newConti));
    }

    const contiDetailMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)$/);
    if (contiDetailMatch && methodUpper === 'GET') {
        const id = contiDetailMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === id);
        if (!conti) return failure(404, 'Conti not found');
        return success(getContiDetailData(conti));
    }

    if (contiDetailMatch && methodUpper === 'PATCH') {
        const id = contiDetailMatch[1];
        const body = data ? JSON.parse(data) : {};
        const conti = MOCK_CONTIS.find(c => c.id === id);
        if (!conti) return failure(404, 'Conti not found');

        Object.assign(conti, body, {
            updatedAt: new Date().toISOString(),
        });
        return success(getContiDetailData(conti));
    }

    // --- Conti Songs API ---
    const contiSongsMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/songs$/);
    if (contiSongsMatch && methodUpper === 'GET') {
        const contiId = contiSongsMatch[1];
        return success(getContiSongs(contiId));
    }

    if (contiSongsMatch && methodUpper === 'POST') {
        const contiId = contiSongsMatch[1];
        const body = data ? JSON.parse(data) : {};
        const teamSong = MOCK_TEAM_SONGS.find(ts => ts.id === body.teamSongId);
        const existingSongs = getContiSongs(contiId);

        const newContiSong: ContiSong = {
            songTitle: teamSong?.title || body.customTitle || 'New Song',
            songArtist: teamSong?.artist || 'Unknown',
            songForm: [],
            id: `cs-${Date.now()}`,
            contiId,
            teamSongId: body.teamSongId,
            orderIndex: existingSongs.length,
            keyOverride: body.keyOverride,
            bpmOverride: body.bpmOverride,
            note: body.contiNote,
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
            Object.assign(song, {
                keyOverride: body.keyOverride,
                bpmOverride: body.bpmOverride,
                note: body.contiNote,
                songForm: body.songForm ?? song.songForm,
                updatedAt: new Date().toISOString(),
            });
            return success(song);
        }
    }

    const contiSongsOrderMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/songs\/order$/);
    if (contiSongsOrderMatch && methodUpper === 'PUT') {
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
        const resolvedTitle = body.title ?? body.customTitle ?? '';
        const newTeamSong: TeamSong = {
            id: `ts-${Date.now()}`,
            teamId,
            title: resolvedTitle,
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

    const teamSongDetailMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/songs\/([a-zA-Z0-9-]+)$/);
    if (teamSongDetailMatch && methodUpper === 'PATCH') {
        const songId = teamSongDetailMatch[2];
        const body = data ? JSON.parse(data) : {};
        const teamSong = MOCK_TEAM_SONGS.find(ts => ts.id === songId);

        if (!teamSong) {
            return {
                data: { success: false, message: 'Team song not found', data: null },
                status: 404,
                statusText: 'Not Found',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
        }

        const resolvedTitle = body.title ?? body.customTitle;
        Object.assign(teamSong, {
            ...(resolvedTitle !== undefined ? { title: resolvedTitle } : {}),
            ...(body.artist !== undefined ? { artist: body.artist } : {}),
            ...(body.customKeySignature !== undefined ? { keySignature: body.customKeySignature } : {}),
            ...(body.customBpm !== undefined ? { bpm: body.customBpm } : {}),
            ...(body.note !== undefined ? { note: body.note } : {}),
            ...(body.youtubeUrl !== undefined ? { youtubeUrl: body.youtubeUrl } : {}),
            ...(body.sheetMusicUrl !== undefined ? { sheetMusicUrl: body.sheetMusicUrl } : {}),
            ...(body.isFavorite !== undefined ? { isFavorite: body.isFavorite } : {}),
            updatedAt: new Date().toISOString(),
        });

        return success(teamSong);
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
