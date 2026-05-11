export function useAnalytics() {
  async function trackView(slug: string): Promise<void> {
    if (import.meta.server) {
      try {
        await $fetch(`/api/articles/${slug}/views`, { method: 'POST' })
      } catch {
        // Silently fail — analytics must never break UX
      }
    }
  }

  return {
    trackView
  }
}
