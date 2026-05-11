export const useLearningPaths = () => {
  const fetchPaths = async (filters?: { difficulty?: string }) => {
    return await $fetch('/api/learning-paths', { query: filters })
  }

  const fetchPath = async (slug: string) => {
    return await $fetch(`/api/learning-paths/${slug}`)
  }

  const fetchStep = async (pathSlug: string, stepSlug: string) => {
    return await $fetch(`/api/learning-paths/${pathSlug}/steps/${stepSlug}`)
  }

  const markStepComplete = async (pathSlug: string, stepId: number) => {
    return await $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, {
      method: 'POST'
    })
  }

  const markStepIncomplete = async (pathSlug: string, stepId: number) => {
    return await $fetch(`/api/learning-paths/${pathSlug}/progress/${stepId}`, {
      method: 'DELETE'
    })
  }

  const resetProgress = async (pathSlug: string) => {
    return await $fetch(`/api/learning-paths/${pathSlug}/progress`, {
      method: 'DELETE'
    })
  }

  return {
    fetchPaths,
    fetchPath,
    fetchStep,
    markStepComplete,
    markStepIncomplete,
    resetProgress
  }
}
