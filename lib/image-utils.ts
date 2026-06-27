/**
 * Resolves an image URL to a full HTTPS URL.
 * - If the URL already starts with http/https, return as-is
 * - Otherwise, construct the full Supabase Storage public URL
 */
export function resolveImageUrl(url: string): string {
  if (!url) return '/placeholder-tee.png'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Relative path: construct full URL
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co'
  return `${baseUrl}/storage/v1/object/public/product-images/${url}`
}
