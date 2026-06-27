import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog-data'
import BlogGrid from '@/components/BlogGrid'

export const metadata: Metadata = {
  title: 'Blog | Onyx',
  description: 'Style guides, delivery news, and menswear notes from Onyx. Same-day delivery in Jamnagar, Gujarat.',
  alternates: { canonical: '/blog' },
}

export default function BlogListingPage() {
  const posts = getAllPosts()
  return <BlogGrid posts={posts} />
}
