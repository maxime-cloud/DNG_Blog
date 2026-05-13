import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/composables/queryKeys'
import { toast } from 'vue-sonner'

export function useLearningPathsList(filters?: MaybeRef<{ difficulty?: string }>) {
  return useQuery({
    queryKey: computed(() => [...queryKeys.learningPaths.all, toValue(filters)]),
    queryFn: () => $fetch('/api/learning-paths', { query: toValue(filters) })
  })
}

export function useLearningPath(slug: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.learningPaths.detail(toValue(slug))),
    queryFn: () => $fetch(`/api/learning-paths/${toValue(slug)}`),
    enabled: computed(() => !!toValue(slug))
  })
}

export function useLearningPathStep(pathSlug: MaybeRef<string>, stepSlug: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.learningPaths.step(toValue(pathSlug), toValue(stepSlug))),
    queryFn: () => $fetch(`/api/learning-paths/${toValue(pathSlug)}/steps/${toValue(stepSlug)}`),
    enabled: computed(() => !!toValue(pathSlug) && !!toValue(stepSlug))
  })
}

export function useMarkStepComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pathSlug, stepId }: { pathSlug: string, stepId: number }) =>
      $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, { method: 'POST' }),
    onSuccess: (_data, { pathSlug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(pathSlug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.progress })
      toast.success('Étape complétée !')
    },
    onError: () => toast.error('Erreur lors de la mise à jour de la progression')
  })
}

export function useMarkStepIncomplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pathSlug, stepId }: { pathSlug: string, stepId: number }) =>
      $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, { method: 'DELETE' }),
    onSuccess: (_data, { pathSlug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(pathSlug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.progress })
    },
    onError: () => toast.error('Erreur lors de la mise à jour de la progression')
  })
}

export function useResetProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pathSlug: string) =>
      $fetch(`/api/learning-paths/${pathSlug}/progress`, { method: 'DELETE' }),
    onSuccess: (_data, pathSlug) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(pathSlug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.progress })
      toast.success('Progression réinitialisée')
    },
    onError: () => toast.error('Erreur lors de la réinitialisation')
  })
}

export const useLearningPaths = () => {
  const fetchPaths = async (filters?: { difficulty?: string }) =>
    await $fetch('/api/learning-paths', { query: filters })

  const fetchPath = async (slug: string) => await $fetch(`/api/learning-paths/${slug}`)

  const fetchStep = async (pathSlug: string, stepSlug: string) =>
    await $fetch(`/api/learning-paths/${pathSlug}/steps/${stepSlug}`)

  const markStepComplete = async (pathSlug: string, stepId: number) =>
    await $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, { method: 'POST' })

  const markStepIncomplete = async (pathSlug: string, stepId: number) =>
    await $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, { method: 'DELETE' })

  const resetProgress = async (pathSlug: string) =>
    await $fetch(`/api/learning-paths/${pathSlug}/progress`, { method: 'DELETE' })

  return { fetchPaths, fetchPath, fetchStep, markStepComplete, markStepIncomplete, resetProgress }
}
