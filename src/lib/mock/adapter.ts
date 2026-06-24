import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    MOCK_TEAMS,
    MOCK_CONTIS,
    MOCK_CONTI_SONGS,
    MOCK_TEAM_SONGS
} from './data';
import { Conti, ContiSong } from '@/types/conti';
import { Team } from '@/types/team';

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
    externalShare: conti.externalShare ?? {
        enabled: false,
        token: null,
        url: null,
        createdAt: null,
        createdById: null,
    },
    contiSongs: getContiSongs(conti.id),
});

const getContiListData = (conti: Conti): Conti => {
    const songs = getContiSongs(conti.id);
    return {
        ...conti,
        createdByName: conti.createdByName ?? 'Bryan',
        songCount: songs.length,
        songPreview: songs.slice(0, 3).map((song) => song.title),
        externalShareEnabled: conti.externalShare?.enabled ?? false,
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
        const teamId = config.params?.teamId ? String(config.params.teamId) : undefined;
        const q = config.params?.q ? String(config.params.q).toLowerCase() : '';
        const from = config.params?.from ? String(config.params.from) : undefined;
        const to = config.params?.to ? String(config.params.to) : undefined;
        const filteredContis = MOCK_CONTIS.filter((conti) => {
            if (teamId && conti.teamId !== teamId) return false;
            if (q && !conti.title.toLowerCase().includes(q)) return false;
            if (from && conti.worshipDate < from) return false;
            if (to && conti.worshipDate > to) return false;
            return true;
        });
        const start = page * size;
        const content = filteredContis.slice(start, start + size).map(getContiListData);
        const totalElements = filteredContis.length;
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
                title:
                    (typeof song.title === 'string' && song.title) ||
                    teamSong?.title ||
                    'New Song',
                artist:
                    (typeof song.artist === 'string' && song.artist) ||
                    teamSong?.artist ||
                    'Unknown',
                orderIndex:
                    typeof song.orderIndex === 'number' ? song.orderIndex : index,
                key: typeof song.key === 'string' ? song.key : undefined,
                bpm: typeof song.bpm === 'number' ? song.bpm : undefined,
                note: typeof song.note === 'string' ? song.note : undefined,
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
            content: filtered.slice(start, start + size).map(getContiListData),
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

    if (contiDetailMatch && methodUpper === 'PUT') {
        const id = contiDetailMatch[1];
        const body = data ? JSON.parse(data) : {};
        const conti = MOCK_CONTIS.find(c => c.id === id);
        if (!conti) return failure(404, 'Conti not found');

        Object.assign(conti, {
            title: body.title ?? conti.title,
            worshipDate: body.worshipDate ?? conti.worshipDate,
            memo: body.memo,
            bibleVerse: body.bibleVerse,
            sharingInfo: body.sharingInfo,
            updatedAt: new Date().toISOString(),
        });

        const existingSongs = MOCK_CONTI_SONGS.filter((song) => song.contiId === id);
        const existingSongMap = new Map(existingSongs.map((song) => [song.id, song]));
        const nextSongs = Array.isArray(body.contiSongs) ? body.contiSongs : [];

        for (let index = MOCK_CONTI_SONGS.length - 1; index >= 0; index -= 1) {
            if (MOCK_CONTI_SONGS[index].contiId === id) {
                MOCK_CONTI_SONGS.splice(index, 1);
            }
        }

        nextSongs.forEach((song: Record<string, unknown>, index: number) => {
            const existingSong = typeof song.id === 'string' ? existingSongMap.get(song.id) : undefined;
            const teamSong = song.teamSongId
                ? MOCK_TEAM_SONGS.find((ts) => ts.id === String(song.teamSongId))
                : existingSong?.teamSong;

            const nextSong: ContiSong = {
                id: typeof song.id === 'string' ? song.id : `cs-${Date.now()}-${index}`,
                contiId: id,
                teamSongId: typeof song.teamSongId === 'string' ? song.teamSongId : undefined,
                title:
                    (typeof song.title === 'string' && song.title) ||
                    teamSong?.title ||
                    existingSong?.title ||
                    'New Song',
                artist:
                    (typeof song.artist === 'string' && song.artist) ||
                    teamSong?.artist ||
                    existingSong?.artist ||
                    'Unknown',
                orderIndex: typeof song.orderIndex === 'number' ? song.orderIndex : index,
                key: typeof song.key === 'string' ? song.key : undefined,
                bpm: typeof song.bpm === 'number' ? song.bpm : undefined,
                note: typeof song.note === 'string' ? song.note : undefined,
                youtubeUrl:
                    typeof song.youtubeUrl === 'string'
                        ? song.youtubeUrl
                        : teamSong?.youtubeUrl || existingSong?.youtubeUrl,
                sheetMusicUrl:
                    typeof song.sheetMusicUrl === 'string'
                        ? song.sheetMusicUrl
                        : teamSong?.sheetMusicUrl || existingSong?.sheetMusicUrl,
                songForm: Array.isArray(song.songForm) ? song.songForm as ContiSong['songForm'] : existingSong?.songForm ?? [],
                createdAt: existingSong?.createdAt ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                teamSong,
            };

            MOCK_CONTI_SONGS.push(nextSong);
        });

        return success(getContiDetailData(conti));
    }

    const contiExternalShareMatch = url?.match(/^\/api\/v1\/contis\/([a-zA-Z0-9-]+)\/external-share$/);
    if (contiExternalShareMatch && methodUpper === 'POST') {
        const id = contiExternalShareMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === id);
        if (!conti) return failure(404, 'Conti not found');

        const token = conti.externalShare?.token ?? `share-${Date.now()}`;
        conti.externalShare = {
            enabled: true,
            token,
            url: `/share/contis/${token}`,
            createdAt: conti.externalShare?.createdAt ?? new Date().toISOString(),
            createdById: conti.createdById ?? 'mock-user',
        };
        conti.externalShareEnabled = true;

        return success(conti.externalShare);
    }

    if (contiExternalShareMatch && methodUpper === 'DELETE') {
        const id = contiExternalShareMatch[1];
        const conti = MOCK_CONTIS.find(c => c.id === id);
        if (!conti) return failure(404, 'Conti not found');

        conti.externalShare = {
            enabled: false,
            token: null,
            url: null,
            createdAt: null,
            createdById: null,
        };
        conti.externalShareEnabled = false;

        return success(null);
    }

    const sharedContiMatch = url?.match(/^\/api\/v1\/share\/contis\/([^/]+)$/);
    if (sharedContiMatch && methodUpper === 'GET') {
        const token = sharedContiMatch[1];
        const conti = MOCK_CONTIS.find(c => c.externalShare?.enabled && c.externalShare.token === token);
        if (!conti) return failure(404, 'Share link not found', 'SHARE_LINK_NOT_FOUND');

        const detail = getContiDetailData(conti);
        return success({
            id: detail.id,
            title: detail.title,
            worshipDate: detail.worshipDate,
            memo: detail.memo,
            bibleVerse: detail.bibleVerse,
            sharingInfo: detail.sharingInfo,
            contiSongs: detail.contiSongs,
        });
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
            title: teamSong?.title || body.title || 'New Song',
            artist: body.artist || teamSong?.artist || 'Unknown',
            songForm: [],
            id: `cs-${Date.now()}`,
            contiId,
            teamSongId: body.teamSongId,
            orderIndex: existingSongs.length,
            key: body.key,
            bpm: body.bpm,
            note: body.note,
            youtubeUrl: body.youtubeUrl,
            sheetMusicUrl: body.sheetMusicUrl,
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
                ...(body.title !== undefined ? { title: body.title } : {}),
                ...(body.artist !== undefined ? { artist: body.artist } : {}),
                ...(body.key !== undefined ? { key: body.key } : {}),
                ...(body.bpm !== undefined ? { bpm: body.bpm } : {}),
                ...(body.note !== undefined ? { note: body.note } : {}),
                ...(body.youtubeUrl !== undefined ? { youtubeUrl: body.youtubeUrl } : {}),
                ...(body.sheetMusicUrl !== undefined ? { sheetMusicUrl: body.sheetMusicUrl } : {}),
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
        const content = MOCK_TEAM_SONGS.filter(ts => ts.teamId === teamId);
        return success({
            content,
            totalPages: 1,
            totalElements: content.length,
        });
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

        Object.assign(teamSong, {
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.artist !== undefined ? { artist: body.artist } : {}),
            ...(body.keySignature !== undefined ? { keySignature: body.keySignature } : {}),
            ...(body.bpm !== undefined ? { bpm: body.bpm } : {}),
            ...(body.note !== undefined ? { note: body.note } : {}),
            ...(body.youtubeUrl !== undefined ? { youtubeUrl: body.youtubeUrl } : {}),
            ...(body.sheetMusicUrl !== undefined ? { sheetMusicUrl: body.sheetMusicUrl } : {}),
            ...(body.isFavorite !== undefined ? { isFavorite: body.isFavorite } : {}),
            updatedAt: new Date().toISOString(),
        });

        return success(teamSong);
    }

    // --- Master Songs API (Search) ---
    // --- Dashboard API ---
    const teamDashboardMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/dashboard$/);
    if (teamDashboardMatch && methodUpper === 'GET') {
        const teamId = teamDashboardMatch[1];
        const {
            MOCK_DASHBOARD_SUMMARY,
            MOCK_ACTIVITIES,
        } = await import('./data');
        const recentContis = MOCK_CONTIS
            .filter((conti) => conti.teamId === teamId)
            .map((conti) => ({
                id: conti.id,
                title: conti.title,
                worshipDate: conti.worshipDate,
                updatedAt: conti.updatedAt || conti.worshipDate,
                songCount: getContiSongs(conti.id).length,
            }));
        const songs = MOCK_TEAM_SONGS.filter((song) => song.teamId === teamId);

        return success({
            summary: {
                ...MOCK_DASHBOARD_SUMMARY,
                totalSongCount: songs.length,
            },
            recentContis,
            songs,
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
