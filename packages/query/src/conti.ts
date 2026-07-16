export interface ContiListKeyParams {
  q?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export const contiKeys = {
  all: ['contis'] as const,
  lists: () => [...contiKeys.all, 'list'] as const,
  teamLists: (teamId: string) => [...contiKeys.lists(), teamId] as const,
  list: (teamId: string, params?: ContiListKeyParams) =>
    [...contiKeys.teamLists(teamId), params] as const,
  detail: (id: string) => [...contiKeys.all, 'detail', id] as const,
  shared: (token: string) => [...contiKeys.all, 'shared', token] as const,
}
