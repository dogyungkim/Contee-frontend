import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    MOCK_TEAMS,
    MOCK_CONTIS,
    MOCK_CONTI_SONGS,
    MOCK_TEAM_SONGS,
    MOCK_MEMBERS_TEAM_1,
    MOCK_MEMBERS_TEAM_2,
    MOCK_USER_ID,
} from './data';
import { Conti, ContiSong } from '@/types/conti';
import { Team, TeamMember } from '@/types/team';
import { TeamSong } from '@/types/song';

const EXTRA_TEAM_MEMBERS: Record<string, TeamMember[]> = {};
const MOCK_TEAM_SONG_FORMS: Record<string, ContiSong['songForm']> = {};

const createTeamSongFromContiRequest = (
    teamId: string,
    song: Record<string, unknown>,
    index: number,
): TeamSong => {
    const now = new Date().toISOString();
    const teamSong: TeamSong = {
        id: `ts-${Date.now()}-${index}`,
        teamId,
        title: typeof song.title === 'string' && song.title ? song.title : '새 찬양',
        artist: typeof song.artist === 'string' ? song.artist : undefined,
        keySignature:
            typeof song.defaultKey === 'string'
                ? song.defaultKey
                : typeof song.key === 'string'
                    ? song.key
                    : undefined,
        bpm:
            typeof song.defaultBpm === 'number'
                ? song.defaultBpm
                : typeof song.bpm === 'number'
                    ? song.bpm
                    : undefined,
        youtubeUrl: typeof song.youtubeUrl === 'string' ? song.youtubeUrl : undefined,
        sheetMusicUrl: typeof song.sheetMusicUrl === 'string' ? song.sheetMusicUrl : undefined,
        note: typeof song.teamNote === 'string' ? song.teamNote : undefined,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
    };

    MOCK_TEAM_SONGS.push(teamSong);
    if (Array.isArray(song.songForm)) {
        MOCK_TEAM_SONG_FORMS[teamSong.id] = song.songForm as ContiSong['songForm'];
    }
    return teamSong;
};

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
        EXTRA_TEAM_MEMBERS[newTeam.id] = [{
            id: `member-${Date.now()}`,
            userId: MOCK_USER_ID,
            userName: 'Bryan Kim',
            userEmail: 'bryan@contee.local',
            role: 'OWNER',
            joinedAt: new Date().toISOString(),
        }];
        return success(newTeam);
    }

    if (url === '/api/v1/teams' && methodUpper === 'GET') {
        return success(MOCK_TEAMS);
    }

    const teamDetailMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)$/);
    if (teamDetailMatch && methodUpper === 'GET') {
        const team = MOCK_TEAMS.find((item) => item.id === teamDetailMatch[1]);
        if (!team) return failure(404, 'Team not found');
        return success(team);
    }

    if (teamDetailMatch && methodUpper === 'PUT') {
        const body = data ? JSON.parse(data) : {};
        const team = MOCK_TEAMS.find((item) => item.id === teamDetailMatch[1]);
        if (!team) return failure(404, 'Team not found');

        Object.assign(team, {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.description !== undefined ? { description: body.description } : {}),
            updatedAt: new Date().toISOString(),
        });
        return success(team);
    }

    if (teamDetailMatch && methodUpper === 'DELETE') {
        const index = MOCK_TEAMS.findIndex((item) => item.id === teamDetailMatch[1]);
        if (index < 0) return failure(404, 'Team not found');
        MOCK_TEAMS.splice(index, 1);
        return success(null);
    }

    const getTeamMembers = (teamId: string): TeamMember[] => {
        if (teamId === 'team-1') return MOCK_MEMBERS_TEAM_1;
        if (teamId === 'team-2') return MOCK_MEMBERS_TEAM_2;
        if (!EXTRA_TEAM_MEMBERS[teamId]) EXTRA_TEAM_MEMBERS[teamId] = [];
        return EXTRA_TEAM_MEMBERS[teamId];
    };

    const teamMembersMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members$/);
    if (teamMembersMatch && methodUpper === 'GET') {
        return success(getTeamMembers(teamMembersMatch[1]));
    }

    if (teamMembersMatch && methodUpper === 'POST') {
        const teamId = teamMembersMatch[1];
        const body = data ? JSON.parse(data) : {};
        const members = getTeamMembers(teamId);
        const member: TeamMember = {
            id: `member-${Date.now()}`,
            userId: `user-${Date.now()}`,
            userName: body.userName || body.email || '새 멤버',
            userEmail: body.email || 'member@contee.local',
            role: body.role || 'MEMBER',
            joinedAt: new Date().toISOString(),
        };
        members.push(member);
        return success(member);
    }

    const joinTeamMatch = url === '/api/v1/teams/join' && methodUpper === 'POST';
    if (joinTeamMatch) {
        const body = data ? JSON.parse(data) : {};
        const team = MOCK_TEAMS.find((item) => item.shortCode === body.shortCode);
        if (!team) return failure(404, 'Team invite code not found');
        const members = getTeamMembers(team.id);
        const existing = members.find((member) => member.userId === MOCK_USER_ID);
        if (existing) return success(existing);

        const member: TeamMember = {
            id: `member-${Date.now()}`,
            userId: MOCK_USER_ID,
            userName: 'Bryan Kim',
            userEmail: 'bryan@contee.local',
            role: 'MEMBER',
            joinedAt: new Date().toISOString(),
        };
        members.push(member);
        return success(member);
    }

    const teamMemberDetailMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members\/([a-zA-Z0-9-]+)$/);
    if (teamMemberDetailMatch && methodUpper === 'DELETE') {
        const members = getTeamMembers(teamMemberDetailMatch[1]);
        const index = members.findIndex((member) => member.userId === teamMemberDetailMatch[2]);
        if (index > -1) members.splice(index, 1);
        return success(null);
    }

    const teamMemberRoleMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members\/([a-zA-Z0-9-]+)\/role$/);
    if (teamMemberRoleMatch && methodUpper === 'PUT') {
        const body = data ? JSON.parse(data) : {};
        const members = getTeamMembers(teamMemberRoleMatch[1]);
        const member = members.find((item) => item.userId === teamMemberRoleMatch[2]);
        if (!member) return failure(404, 'Team member not found');
        member.role = typeof body === 'string' ? body : body.role || member.role;
        return success(member);
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
            worshipTime: body.worshipTime,
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
                : createTeamSongFromContiRequest(newConti.teamId, song, index);
            const contiSong: ContiSong = {
                id: `cs-${Date.now()}-${index}`,
                contiId: newConti.id,
                teamSongId: teamSong?.id,
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
                key:
                    typeof song.key === 'string'
                        ? song.key
                        : teamSong?.keySignature,
                bpm:
                    typeof song.bpm === 'number'
                        ? song.bpm
                        : teamSong?.bpm,
                note: typeof song.note === 'string' ? song.note : undefined,
                youtubeUrl:
                    typeof song.youtubeUrl === 'string'
                        ? song.youtubeUrl
                        : teamSong?.youtubeUrl,
                sheetMusicUrl:
                    typeof song.sheetMusicUrl === 'string'
                        ? song.sheetMusicUrl
                        : teamSong?.sheetMusicUrl,
                songForm: Array.isArray(song.songForm) ? song.songForm as ContiSong['songForm'] : [],
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
            worshipTime: body.worshipTime,
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
            worshipTime: body.worshipTime ?? conti.worshipTime,
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
                : existingSong?.teamSong ?? createTeamSongFromContiRequest(conti.teamId, song, index);

            const nextSong: ContiSong = {
                id: typeof song.id === 'string' ? song.id : `cs-${Date.now()}-${index}`,
                contiId: id,
                teamSongId: teamSong?.id,
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
                key:
                    typeof song.key === 'string'
                        ? song.key
                        : teamSong?.keySignature,
                bpm:
                    typeof song.bpm === 'number'
                        ? song.bpm
                        : teamSong?.bpm,
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
            worshipTime: detail.worshipTime,
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
        const q = String(config.params?.q ?? '').trim().toLowerCase();
        const content = MOCK_TEAM_SONGS.filter((song) => {
            if (song.teamId !== teamId) return false;
            if (!q) return true;
            return (
                song.title.toLowerCase().includes(q) ||
                song.artist?.toLowerCase().includes(q) ||
                song.keySignature?.toLowerCase().includes(q) ||
                song.bpm?.toString().includes(q)
            );
        });
        return success({
            content,
            totalPages: 1,
            totalElements: content.length,
        });
    }

    if (teamSongsMatch && methodUpper === 'POST') {
        const teamId = teamSongsMatch[1];
        const body = data ? JSON.parse(data) : {};
        const normalizedTitle = String(body.title ?? '').replace(/\s+/g, '').toLowerCase();
        const normalizedArtist = String(body.artist ?? '').replace(/\s+/g, '').toLowerCase();
        const duplicate = MOCK_TEAM_SONGS.find(
            (song) =>
                song.teamId === teamId &&
                song.title.replace(/\s+/g, '').toLowerCase() === normalizedTitle &&
                String(song.artist ?? '').replace(/\s+/g, '').toLowerCase() === normalizedArtist,
        );
        if (duplicate) return failure(409, '이미 등록된 곡입니다.', 'DUPLICATE_TEAM_SONG');

        const now = new Date().toISOString();
        const teamSong: TeamSong = {
            id: `ts-${Date.now()}`,
            teamId,
            songId: typeof body.songId === 'string' ? body.songId : undefined,
            title: String(body.title ?? '').trim(),
            artist: typeof body.artist === 'string' ? body.artist.trim() : undefined,
            keySignature: typeof body.keySignature === 'string' ? body.keySignature : undefined,
            bpm: typeof body.bpm === 'number' ? body.bpm : undefined,
            ccliNumber: typeof body.ccliNumber === 'string' ? body.ccliNumber : undefined,
            youtubeUrl: typeof body.youtubeUrl === 'string' ? body.youtubeUrl : undefined,
            sheetMusicUrl: typeof body.sheetMusicUrl === 'string' ? body.sheetMusicUrl : undefined,
            note: typeof body.note === 'string' ? body.note : undefined,
            isFavorite: false,
            createdAt: now,
            updatedAt: now,
        };
        MOCK_TEAM_SONGS.push(teamSong);
        if (Array.isArray(body.songForm)) {
            MOCK_TEAM_SONG_FORMS[teamSong.id] = body.songForm;
        }
        return success(teamSong);
    }

    const teamSongFormMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/songs\/([a-zA-Z0-9-]+)\/form$/);
    if (teamSongFormMatch && methodUpper === 'GET') {
        const teamSongId = teamSongFormMatch[2];
        const parts =
            MOCK_TEAM_SONG_FORMS[teamSongId] ??
            MOCK_CONTI_SONGS.find((contiSong) => contiSong.teamSongId === teamSongId)?.songForm ??
            [];

        return success({
            teamSongId,
            parts,
        });
    }

    if (teamSongFormMatch && methodUpper === 'PUT') {
        const teamSongId = teamSongFormMatch[2];
        const body = data ? JSON.parse(data) : {};
        const parts = Array.isArray(body.parts) ? body.parts as ContiSong['songForm'] : [];
        MOCK_TEAM_SONG_FORMS[teamSongId] = parts;

        MOCK_CONTI_SONGS.forEach((contiSong) => {
            if (contiSong.teamSongId === teamSongId) {
                contiSong.songForm = parts;
                contiSong.updatedAt = new Date().toISOString();
            }
        });

        return success({
            teamSongId,
            parts,
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

    if (teamSongDetailMatch && methodUpper === 'DELETE') {
        const songId = teamSongDetailMatch[2];
        const index = MOCK_TEAM_SONGS.findIndex((song) => song.id === songId);
        if (index < 0) return failure(404, 'Team song not found');

        MOCK_TEAM_SONGS.splice(index, 1);
        delete MOCK_TEAM_SONG_FORMS[songId];
        return success(null);
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
