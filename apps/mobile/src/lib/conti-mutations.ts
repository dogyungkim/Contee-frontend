import { createContiRepository } from '@contee/api-client'
import type { UpdateContiRequestDto } from '@contee/domain'
import { contiKeys } from '@contee/query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import apiClient from './api'

const contiRepository = createContiRepository(apiClient)

interface ContiMutationInput {
  id: string
  teamId: string
}

export function useMobileUpdateConti() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: ContiMutationInput & { request: UpdateContiRequestDto }) =>
      contiRepository.update(id, request),
    onSuccess: (conti, { id, teamId }) => {
      queryClient.setQueryData(contiKeys.detail(id), conti)
      return queryClient.invalidateQueries({
        queryKey: contiKeys.teamLists(teamId),
      })
    },
  })
}

export function useMobilePublishConti() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: ContiMutationInput) => contiRepository.publish(id),
    onSuccess: (conti, { id, teamId }) => {
      queryClient.setQueryData(contiKeys.detail(id), conti)
      return queryClient.invalidateQueries({
        queryKey: contiKeys.teamLists(teamId),
      })
    },
  })
}

export function useMobileRemoveConti() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: ContiMutationInput) => contiRepository.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.removeQueries({ queryKey: contiKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: contiKeys.all })
    },
  })
}
