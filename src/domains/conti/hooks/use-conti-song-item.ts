import { useEffect, useMemo, useState } from 'react';
import { useUpdateContiSongDetail } from '@/domains/conti/hooks/use-conti';
import { useUpdateTeamSong } from '@/domains/song/hooks/use-songs';
import { getSongFormSummary } from '@/domains/song/utils/song-form';
import { UI_DELAY_MS, SONG_FORM_CONFIG } from '@/constants/ui-constants';
import type { ContiSong } from '@/types/conti';
import type { SongFormPart, ApiSongFormPart } from '@/types/song';

const PART_TYPE_MAP: Record<string, SongFormPart['type']> = {
  INTRO: 'Intro',
  VERSE: 'Verse',
  PRE_CHORUS: 'Pre-chorus',
  CHORUS: 'Chorus',
  BRIDGE: 'Bridge',
  INTERLUDE: 'Interlude',
  OUTRO: 'Outro',
  TAG: 'Tag',
  INSTRUMENTAL: 'Instrumental',
};

interface ContiSongFormState {
  keySignature: string;
  bpm: number;
  note: string;
}

interface UseContiSongItemParams {
  contiId: string;
  contiSong: ContiSong;
}

const toUiSongForm = (apiParts: ApiSongFormPart[]): SongFormPart[] => {
  return apiParts.map((part, index) => ({
    id: `${part.id ?? index}`,
    type: PART_TYPE_MAP[part.partType] || 'Intro',
    label: part.customPartName || part.partType,
    bars: SONG_FORM_CONFIG.DEFAULT_BARS,
    abbr: part.customPartName?.substring(0, SONG_FORM_CONFIG.CUSTOM_ABBR_MAX_LENGTH),
  }));
};

export function useContiSongItem({ contiId, contiSong }: UseContiSongItemParams) {
  const { mutate: updateDetail } = useUpdateContiSongDetail();
  const { mutate: updateTeamSong } = useUpdateTeamSong();
  const [isTeamNoteOpen, setIsTeamNoteOpen] = useState(false);
  const [form, setForm] = useState<ContiSongFormState>({
    keySignature: '',
    bpm: 0,
    note: '',
  });

  const teamSong = contiSong.teamSong;
  const songFormParts = useMemo(
    () => (contiSong.songForm ? toUiSongForm(contiSong.songForm) : []),
    [contiSong.songForm]
  );
  const groupedFlow = useMemo(() => getSongFormSummary(songFormParts), [songFormParts]);

  useEffect(() => {
    setForm({
      keySignature: contiSong.keyOverride || '',
      bpm: contiSong.bpmOverride || 0,
      note: contiSong.note || '',
    });
  }, [contiSong.keyOverride, contiSong.bpmOverride, contiSong.note]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        form.keySignature !== (contiSong.keyOverride || '') ||
        form.bpm !== (contiSong.bpmOverride || 0) ||
        form.note !== (contiSong.note || '')
      ) {
        updateDetail({
          contiId,
          contiSongId: contiSong.id,
          request: {
            keyOverride: form.keySignature,
            bpmOverride: form.bpm,
            contiNote: form.note,
          },
        });
      }
    }, UI_DELAY_MS.CONTI_SONG_AUTOSAVE);

    return () => clearTimeout(timer);
  }, [contiId, contiSong, form, updateDetail]);

  const isKeyOverridden = !!form.keySignature && form.keySignature !== teamSong?.keySignature;
  const isBpmOverridden = !!form.bpm && form.bpm !== teamSong?.bpm;
  const isNoteOverridden = !!form.note;

  const handleToggleFavorite = () => {
    if (!teamSong) return;
    updateTeamSong({
      teamId: teamSong.teamId,
      songId: teamSong.id,
      request: { isFavorite: !teamSong.isFavorite },
    });
  };

  const resetField = (field: 'keySignature' | 'bpm') => {
    if (!teamSong) return;
    setForm((prev) => ({ ...prev, [field]: teamSong[field] || (field === 'bpm' ? 0 : '') }));
  };

  return {
    form,
    setForm,
    isTeamNoteOpen,
    setIsTeamNoteOpen,
    teamSong,
    songFormParts,
    groupedFlow,
    isKeyOverridden,
    isBpmOverridden,
    isNoteOverridden,
    handleToggleFavorite,
    resetField,
  };
}
