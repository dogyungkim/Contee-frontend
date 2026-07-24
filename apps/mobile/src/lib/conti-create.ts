import { createContiRepository } from '@contee/api-client'
import type { CreateContiRequestDto } from '@contee/domain'
import { contiKeys } from '@contee/query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import apiClient from './api'

const contiRepository = createContiRepository(apiClient)

export function useMobileCreateConti() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateContiRequestDto) =>
      contiRepository.create(request),
    onSuccess: (_, request) =>
      queryClient.invalidateQueries({
        queryKey: contiKeys.teamLists(request.teamId),
      }),
  })
}
