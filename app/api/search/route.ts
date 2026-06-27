import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { parseFacets, buildSearchQuery } from '@/lib/search-config'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim() || ''
  const limitParam = searchParams.get('limit')
  const limit = Math.min(Math.max(parseInt(limitParam || '8', 10) || 8, 1), 48)

  if (!query) {
    return NextResponse.json(
      { results: [], query: '', facets: null },
      {
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=30'
        }
      }
    )
  }

  // Parse facets from the query (synonym resolution)
  const facets = parseFacets(query)

  // Build the resolved search string for the RPC
  const resolvedQuery = buildSearchQuery(facets)

  const supabase = createAdminClient()

  // Run rate limit check and search RPC in parallel
  const [rateLimitRes, rpcRes] = await Promise.all([
    checkRateLimit(ip, 'search', 20, 60),
    supabase.rpc('search_products', {
      search_query: resolvedQuery || query,
      result_limit: limit,
    })
  ])

  if (!rateLimitRes.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { data, error } = rpcRes

  if (error) {
    console.error('[/api/search] RPC error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  // If facets extracted a category, additionally filter results to that category
  // (the RPC does full-text matching; we do post-filtering for exact facet matches)
  let results = data || []

  if (facets.category) {
    const categoryFiltered = results.filter(
      (r: any) => r.category === facets.category
    )
    // Only apply category filter if it doesn't eliminate all results
    if (categoryFiltered.length > 0) {
      results = categoryFiltered
    }
  }

  if (facets.fit) {
    const fitFiltered = results.filter(
      (r: any) => r.fit === facets.fit
    )
    if (fitFiltered.length > 0) {
      results = fitFiltered
    }
  }

  return NextResponse.json(
    {
      results,
      query,
      facets: {
        category: facets.category,
        color: facets.color,
        fit: facets.fit,
        designTag: facets.designTag,
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30'
      }
    }
  )
}
