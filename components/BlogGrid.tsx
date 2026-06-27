'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BlogHeader } from '@/components/BlogHeader'
import { Footer } from '@/components/footer'
import type { BlogPost } from '@/lib/blog-data'

type BlogGridProps = {
  posts: BlogPost[]
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <BlogHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col gap-12">
        {/* Section 1: Page Header */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <h1 className="font-bebas-neue text-5xl md:text-7xl font-bold tracking-widest leading-none text-white select-none">
            BLOG
          </h1>
          <p className="font-inter text-white/40 text-xs md:text-sm tracking-widest uppercase">
            Menswear. Style. Jamnagar.
          </p>
        </div>

        {/* Section 2: Featured Post */}
        {featuredPost && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block border border-white/10 bg-black hover:border-white/30 transition-colors"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Hero Image */}
              <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[450px] overflow-hidden bg-white/5">
                <img
                  src={featuredPost.heroImage.src}
                  alt={featuredPost.heroImage.alt}
                  className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Right: Info */}
              <div className="p-8 md:p-12 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-inter border border-white/10 text-white/40 text-[10px] md:text-xs px-2.5 py-1 uppercase font-bold tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-bebas-neue text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight group-hover:text-white/80 transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="font-inter text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="font-inter text-white/30 text-xs tracking-wider">
                    {featuredPost.readTime} MIN READ &middot; {new Date(featuredPost.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </p>

                  <span className="font-bebas-neue text-sm tracking-widest border border-white/20 px-6 py-2.5 hover:bg-white hover:text-black transition-colors self-start">
                    READ &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Section 3: Remaining Posts Grid */}
        <div className="flex flex-col gap-6">
          {remainingPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {remainingPosts.map((post, idx) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (idx % 16) * 0.05 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full border border-white/10 bg-black hover:border-white/30 transition-colors"
                  >
                    {/* Top: Image */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/5">
                      <img
                        src={post.heroImage.src}
                        alt={post.heroImage.alt}
                        className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>

                    {/* Bottom: Info */}
                    <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-bebas-neue text-2xl md:text-3xl text-white tracking-wider leading-tight group-hover:text-white/80 transition-colors">
                          {post.title}
                        </h3>
                        <p className="font-inter text-white/50 text-xs md:text-sm line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <p className="font-inter text-white/30 text-xs tracking-wider">
                        {post.readTime} MIN READ &middot; {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            posts.length <= 1 && (
              <div className="py-20 text-center border border-white/10 bg-black">
                <p className="font-inter text-white/30 text-sm tracking-widest uppercase">
                  Nothing yet.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
