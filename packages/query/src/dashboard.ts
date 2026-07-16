export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (teamId?: string | null) =>
    [...dashboardKeys.all, 'data', teamId] as const,
}
