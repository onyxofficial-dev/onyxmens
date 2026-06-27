import { createClient } from '@/lib/supabase/server'
import SearchResultsClient from './SearchResultsClient'
import { Metadata } from 'next'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  return {
    title: query ? `Search: ${query}` : 'Search',
    description: query ? `Search results for "${query}" on ONYX.` : 'Search the ONYX collection.',
  }
}

export const revalidate = 0 // No caching for search results

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const query = (resolvedParams.q || '').trim()

  let results: any[] = []

  if (query) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('search_products', {
      search_query: query,
      result_limit: 48,
    })

    if (!error && data) {
      results = data
    }
  }

  return (
    <SearchResultsClient
      query={query}
      initialResults={results}
    />
  )
}
