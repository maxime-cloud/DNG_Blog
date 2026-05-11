export interface DocPage {
  path: string
  title?: string
  description?: string
  body?: unknown
  [key: string]: unknown
}

export interface SearchResult {
  path: string
  title?: string
  description?: string
  [key: string]: unknown
}

export function useDocs() {
  async function fetchDocsNav(): Promise<any> {
    try {
      // @ts-ignore — 'docs' collection defined in content.config.ts; types regenerated at build
      return await queryCollectionNavigation('docs')
    } catch (error) {
      console.error('[useDocs] fetchDocsNav error:', error)
      throw error
    }
  }

  async function fetchDocPage(path: string): Promise<DocPage | null> {
    try {
      // @ts-ignore — 'docs' collection defined in content.config.ts; types regenerated at build
      return (await queryCollection('docs').path(path).first()) as DocPage | null
    } catch (error) {
      console.error(`[useDocs] fetchDocPage error for path "${path}":`, error)
      throw error
    }
  }

  async function searchDocs(query: string): Promise<SearchResult[]> {
    try {
      // @ts-ignore — 'docs' collection defined in content.config.ts; types regenerated at build
      const sections: SearchResult[] = (await queryCollectionSearchSections(
        'docs'
      )) as SearchResult[]
      const lowerQuery = query.toLowerCase()

      return sections
        .filter((section: SearchResult) => {
          const inTitle = section.title?.toLowerCase().includes(lowerQuery) ?? false
          const inDescription = section.description?.toLowerCase().includes(lowerQuery) ?? false
          return inTitle || inDescription
        })
        .slice(0, 10)
    } catch (error) {
      console.error(`[useDocs] searchDocs error for query "${query}":`, error)
      throw error
    }
  }

  return {
    fetchDocsNav,
    fetchDocPage,
    searchDocs
  }
}
