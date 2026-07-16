export const songKeys = {
  all: ['songs'] as const,
  list: (teamId: string) => [...songKeys.all, 'list', teamId] as const,
  form: (teamId: string, songId: string) =>
    [...songKeys.all, 'form', teamId, songId] as const,
}
