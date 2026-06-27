// ============================================================================
// Search & Tag Taxonomy Configuration
// Single shared source for synonym dictionaries, category-fit maps,
// design tag vocabulary, and the facet parser.
// Used by: /api/search route, admin ProductForm, CategoryClient filters
// ============================================================================

// ── Category → Valid Fit Values ──────────────────────────────────────────────

export const CATEGORY_FIT_MAP: Record<string, string[]> = {
  't-shirts': ['Regular Fit', 'Oversized', 'Boxy Fit', 'Dropshoulder'],
  'shirts':   ['Slim Fit', 'Regular Fit', 'Oversized', 'Boxy Fit'],
  'jeans':    ['Slim Fit', 'Straight Fit', 'Bootcut', 'Baggy / Relaxed Fit', 'Tapered Fit'],
  'outerwear': ['Regular Fit', 'Oversized', 'Boxy Fit', 'Dropshoulder'],
}

// All unique fit values across all categories
export const ALL_FIT_VALUES: string[] = [
  ...new Set(Object.values(CATEGORY_FIT_MAP).flat())
]

// ── Design Tags Vocabulary ───────────────────────────────────────────────────

export const DESIGN_TAGS_VOCABULARY: string[] = ['Backprint']

// ── Synonym Dictionaries ─────────────────────────────────────────────────────
// Maps customer/search terms (lowercase) → canonical value

export const CATEGORY_SYNONYMS: Record<string, string> = {
  'tshirt': 't-shirts',
  'tshirts': 't-shirts',
  't-shirt': 't-shirts',
  't shirt': 't-shirts',
  'tee': 't-shirts',
  'tees': 't-shirts',
  'tshrt': 't-shirts',
  'shirt': 'shirts',
  'button-down': 'shirts',
  'button down': 'shirts',
  'button up': 'shirts',
  'buttondown': 'shirts',
  'buttonup': 'shirts',
  'jeans': 'jeans',
  'denim': 'jeans',
  'denims': 'jeans',
  'jean': 'jeans',
  'jacket': 'outerwear',
  'jackets': 'outerwear',
  'hoodie': 'outerwear',
  'hoodies': 'outerwear',
  'sweatshirt': 'outerwear',
  'sweatshirts': 'outerwear',
  'sweater': 'outerwear',
  'sweaters': 'outerwear',
}

export const COLOR_SYNONYMS: Record<string, string> = {
  'navy': 'Navy',
  'navy blue': 'Navy',
  'grey': 'Grey',
  'gray': 'Grey',
  'khaki': 'Beige',
  'beige': 'Beige',
  'olive': 'Olive',
  'green': 'Olive',
  'tan': 'Brown',
  'brown': 'Brown',
  'maroon': 'Maroon',
  'wine': 'Maroon',
  'black': 'Black',
  'white': 'White',
  'blue': 'Blue',
  'red': 'Red',
  'pink': 'Pink',
  'cream': 'Cream',
  'charcoal': 'Charcoal',
  'off-black': 'Off-Black',
  'off black': 'Off-Black',
  'offblack': 'Off-Black',
}

export const FIT_SYNONYMS: Record<string, string> = {
  'loose': 'Baggy / Relaxed Fit',
  'relaxed': 'Baggy / Relaxed Fit',
  'slouchy': 'Baggy / Relaxed Fit',
  'baggy': 'Baggy / Relaxed Fit',
  'slim': 'Slim Fit',
  'fitted': 'Slim Fit',
  'skinny': 'Slim Fit',
  'regular': 'Regular Fit',
  'classic': 'Regular Fit',
  'boxy': 'Boxy Fit',
  'square cut': 'Boxy Fit',
  'oversized': 'Oversized',
  'big fit': 'Oversized',
  'loose fit': 'Oversized',
  'drop shoulder': 'Dropshoulder',
  'dropped shoulder': 'Dropshoulder',
  'relaxed shoulder': 'Dropshoulder',
  'dropshoulder': 'Dropshoulder',
  'straight': 'Straight Fit',
  'straight leg': 'Straight Fit',
  'bootcut': 'Bootcut',
  'boot cut': 'Bootcut',
  'tapered': 'Tapered Fit',
}

export const DESIGN_TAG_SYNONYMS: Record<string, string> = {
  'backprint': 'Backprint',
  'back print': 'Backprint',
  'back graphic': 'Backprint',
  'back design': 'Backprint',
  'back hit': 'Backprint',
}

// ── Facet Parser ─────────────────────────────────────────────────────────────

export interface ParsedFacets {
  category: string | null
  color: string | null
  fit: string | null
  designTag: string | null
  freeTextTokens: string[]
}

/**
 * Tokenizes a search query and resolves known tokens to structured facets.
 * Remaining unresolved tokens are returned as free-text for full-text search.
 *
 * Example: "black tshirt oversized" →
 *   { category: 't-shirts', color: 'Black', fit: 'Oversized', freeTextTokens: [] }
 */
export function parseFacets(query: string): ParsedFacets {
  const result: ParsedFacets = {
    category: null,
    color: null,
    fit: null,
    designTag: null,
    freeTextTokens: [],
  }

  if (!query || !query.trim()) return result

  const normalized = query.toLowerCase().trim()

  // Try multi-word matches first (e.g., "navy blue", "drop shoulder", "boot cut")
  // by checking against all synonym dictionaries for 2-word and 3-word phrases
  const words = normalized.split(/\s+/)
  const consumed = new Set<number>()

  // Check 2-word and 3-word phrases first
  for (let len = 3; len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      if ([...Array(len)].some((_, j) => consumed.has(i + j))) continue

      const phrase = words.slice(i, i + len).join(' ')

      if (CATEGORY_SYNONYMS[phrase] && !result.category) {
        result.category = CATEGORY_SYNONYMS[phrase]
        for (let j = 0; j < len; j++) consumed.add(i + j)
      } else if (COLOR_SYNONYMS[phrase] && !result.color) {
        result.color = COLOR_SYNONYMS[phrase]
        for (let j = 0; j < len; j++) consumed.add(i + j)
      } else if (FIT_SYNONYMS[phrase] && !result.fit) {
        result.fit = FIT_SYNONYMS[phrase]
        for (let j = 0; j < len; j++) consumed.add(i + j)
      } else if (DESIGN_TAG_SYNONYMS[phrase] && !result.designTag) {
        result.designTag = DESIGN_TAG_SYNONYMS[phrase]
        for (let j = 0; j < len; j++) consumed.add(i + j)
      }
    }
  }

  // Check single words
  for (let i = 0; i < words.length; i++) {
    if (consumed.has(i)) continue

    const word = words[i]

    if (CATEGORY_SYNONYMS[word] && !result.category) {
      result.category = CATEGORY_SYNONYMS[word]
    } else if (COLOR_SYNONYMS[word] && !result.color) {
      result.color = COLOR_SYNONYMS[word]
    } else if (FIT_SYNONYMS[word] && !result.fit) {
      result.fit = FIT_SYNONYMS[word]
    } else if (DESIGN_TAG_SYNONYMS[word] && !result.designTag) {
      result.designTag = DESIGN_TAG_SYNONYMS[word]
    } else {
      result.freeTextTokens.push(word)
    }
  }

  return result
}

/**
 * Build a query string for the RPC from parsed facets.
 * Combines resolved canonical names with leftover free-text tokens
 * to produce a single search string that the Postgres RPC can rank against.
 */
export function buildSearchQuery(facets: ParsedFacets): string {
  const parts: string[] = []

  if (facets.category) parts.push(facets.category)
  if (facets.color) parts.push(facets.color)
  if (facets.fit) parts.push(facets.fit)
  if (facets.designTag) parts.push(facets.designTag)
  parts.push(...facets.freeTextTokens)

  return parts.join(' ')
}
