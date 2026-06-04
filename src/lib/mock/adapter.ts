import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    MOCK_TEAMS,
    MOCK_CONTIS,
    MOCK_CONTI_SONGS,
    MOCK_TEAM_SONGS,
    MOCK_MASTER_SONGS
} from './data';
import { Conti, ContiSong, ContiStatus } from '@/types/conti';
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

const normalizeContiStatus = (status?: string): ContiStatus => {
    if (status === 'PUBLISHED' || status === 'ARCHIVED') return status;
    return 'DRAFT';
};

const getContiSongs = (contiId: string) =>
    MOCK_CONTI_SONGS
        .filter((song) => song.contiId === contiId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

const getContiDetailData = (conti: Conti): Conti => ({
    ...conti,
    status: normalizeContiStatus(conti.status),
    contiSongs: getContiSongs(conti.id),
});

const isContiEditable = (conti?: Conti): boolean =>
    normalizeContiStatus(conti?.status) === 'DRAFT';

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
            status: 'DRAFT',
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
                    typeof song.orderIndex === 'number' ? song.orderIndex : index + 1,
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
        return success(MOCK_CONTIS.filter(c => c.teamId === teamId).map(getContiDetailData));
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
            status: 'DRAFT',
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
        if (!isContiEditable(conti)) {
            return failure(409, 'Conti is not editable', 'CONTI_NOT_EDITABLE');
        }

        Object.assign(conti, body, {
            updatedAt: new Date().toISOString(),
        });
        return success(getContiDetailData(conti));
    }

    const contiStatusMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/status$/);
    if (contiStatusMatch && methodUpper === 'PATCH') {
        const id = contiStatusMatch[1];
        const body = data ? JSON.parse(data) : {};
        const targetStatus = body.status as ContiStatus | undefined;
        const conti = MOCK_CONTIS.find(c => c.id === id);

        if (!conti) return failure(404, 'Conti not found');
        if (!targetStatus) return failure(400, 'Missing status', 'CONTI_INVALID_STATUS_TRANSITION');

        const currentStatus = normalizeContiStatus(conti.status);
        if (currentStatus === targetStatus) {
            return success(getContiDetailData(conti));
        }

        const isAllowedTransition =
            (currentStatus === 'DRAFT' && targetStatus === 'PUBLISHED') ||
            (currentStatus === 'PUBLISHED' && targetStatus === 'ARCHIVED');

        if (!isAllowedTransition) {
            return failure(409, 'Invalid conti status transition', 'CONTI_INVALID_STATUS_TRANSITION');
        }

        if (currentStatus === 'DRAFT' && targetStatus === 'PUBLISHED') {
            const songs = getContiSongs(conti.id);
            const isSequential = songs.every((song, index) => song.orderIndex === index + 1);

            if (songs.length === 0 || !isSequential) {
                return failure(
                    400,
                    'Publish precondition failed',
                    'CONTI_PUBLISH_PRECONDITION_FAILED',
                );
            }

            Object.assign(conti, {
                status: targetStatus,
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return success(getContiDetailData(conti));
        }

        Object.assign(conti, {
            status: targetStatus,
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
        const conti = MOCK_CONTIS.find(c => c.id === contiId);
        if (!isContiEditable(conti)) {
            return failure(409, 'Conti is not editable', 'CONTI_NOT_EDITABLE');
        }

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
            orderIndex: body.orderIndex || existingSongs.length + 1,
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
        const contiId = contiSongDetailMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === contiId);
        if (!isContiEditable(conti)) {
            return failure(409, 'Conti is not editable', 'CONTI_NOT_EDITABLE');
        }

        const id = contiSongDetailMatch[2];
        const index = MOCK_CONTI_SONGS.findIndex(cs => cs.id === id);
        if (index > -1) MOCK_CONTI_SONGS.splice(index, 1);
        return success(null);
    }

    if (contiSongDetailMatch && methodUpper === 'PATCH') {
        const contiId = contiSongDetailMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === contiId);
        if (!isContiEditable(conti)) {
            return failure(409, 'Conti is not editable', 'CONTI_NOT_EDITABLE');
        }

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
        const conti = MOCK_CONTIS.find(c => c.id === contiId);
        if (!isContiEditable(conti)) {
            return failure(409, 'Conti is not editable', 'CONTI_NOT_EDITABLE');
        }

        const body = data ? JSON.parse(data) : {};
        const { contiSongIds } = body;

        if (Array.isArray(contiSongIds)) {
            // In a real DB we'd update index. 
            // In mock, we can just re-sort MOCK_CONTI_SONGS for this conti, or update orderIndex on items.
            contiSongIds.forEach((id, index) => {
                const match = MOCK_CONTI_SONGS.find(cs => cs.id === id);
                if (match) match.orderIndex = index + 1;
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
