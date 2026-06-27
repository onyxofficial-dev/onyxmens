import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogHeader } from '@/components/BlogHeader'
import { Footer } from '@/components/footer'
import { getAllPosts, getPostBySlug } from '@/lib/blog-data'
import { SITE_URL } from '@/lib/site-config'
import BlogCollectionGrid from '@/components/BlogCollectionGrid'

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const post = getPostBySlug(resolvedParams.slug)
  if (!post) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: [post.heroImage.src],
      tags: post.tags,
    },
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const post = getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <BlogHeader />

      {/* JSON-LD BlogPosting Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.publishedAt,
            "image": post.heroImage.src,
            "author": { "@type": "Organization", "name": "Onyx" },
            "publisher": { "@type": "Organization", "name": "Onyx", "url": SITE_URL },
            "url": `${SITE_URL}/blog/${post.slug}`,
          }),
        }}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-16 py-12 flex flex-col gap-8">
        {/* 1. Breadcrumbs */}
        <nav className="font-inter text-xs text-white/40 flex items-center gap-2 select-none uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-white/20">/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/30 truncate max-w-[200px] md:max-w-none">
            {post.title}
          </span>
        </nav>

        {/* 2. Post Title */}
        <h1 className="font-bebas-neue text-4xl md:text-6xl text-white tracking-widest leading-none mt-2">
          {post.title}
        </h1>

        {/* 3. Meta Row */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-inter border border-white/10 text-white/30 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="font-inter text-white/30 text-xs tracking-wider">
            {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            <span className="mx-2">&middot;</span>
            {post.readTime} MIN READ
          </div>
        </div>

        {/* 4. Hero Image */}
        <div className="w-full h-[260px] md:h-[480px] overflow-hidden bg-white/5 border border-white/10">
          <img
            src={post.heroImage.src}
            alt={post.heroImage.alt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 5. Section Renderer */}
        <div className="flex flex-col w-full">
          {post.sections.map((section, idx) => {
            switch (section.type) {
              case 'heading':
                if (section.level === 2) {
                  return (
                    <h2
                      key={idx}
                      className="font-bebas-neue text-2xl md:text-4xl text-white tracking-widest mt-12 mb-4 border-l-2 border-white/20 pl-4 uppercase"
                    >
                      {section.text}
                    </h2>
                  )
                } else {
                  return (
                    <h3
                      key={idx}
                      className="font-bebas-neue text-xl md:text-2xl text-white tracking-wider mt-8 mb-3 uppercase"
                    >
                      {section.text}
                    </h3>
                  )
                }

              case 'paragraph':
                return (
                  <p
                    key={idx}
                    className="font-inter text-[15px] md:text-base text-white/75 leading-8 max-w-[680px] mx-auto w-full mb-6"
                  >
                    {section.text}
                  </p>
                )

              case 'image':
                return (
                  <div key={idx} className="my-8 flex flex-col gap-2 w-full">
                    <div className="w-full h-[200px] md:h-[320px] overflow-hidden bg-white/5 border border-white/10">
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {section.image.caption && (
                      <p className="font-inter text-white/35 text-xs italic text-center md:text-left">
                        {section.image.caption}
                      </p>
                    )}
                  </div>
                )

              case 'image-grid':
                return (
                  <div
                    key={idx}
                    className={`my-8 grid gap-4 w-full ${
                      section.columns === 4
                        ? 'grid-cols-2 md:grid-cols-4'
                        : 'grid-cols-2'
                    }`}
                  >
                    {section.images.map((img, sIdx) => (
                      <div
                        key={sIdx}
                        className={`overflow-hidden bg-white/5 border border-white/10 ${
                          section.columns === 4 ? 'aspect-square' : 'aspect-video'
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )

              case 'product-strip':
                return (
                  <div key={idx} className="w-full my-6">
                    <Link
                      href={section.href}
                      className="flex items-center justify-between border border-white/10 bg-white/[0.02] px-6 py-4 hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="font-bebas-neue text-xl text-white tracking-widest">
                        {section.categoryLabel}
                      </span>
                      <span className="font-inter text-xs text-white/50 uppercase tracking-widest">
                        Explore &rarr;
                      </span>
                    </Link>
                  </div>
                )

              case 'cta':
                return (
                  <div key={idx} className="w-full my-4">
                    <Link href={section.href} className="block w-full">
                      <div className="w-full py-4 border border-white/20 bg-black hover:bg-white/10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1">
                        <span className="font-bebas-neue text-lg text-white tracking-widest uppercase">
                          {section.label}
                        </span>
                        {section.sublabel && (
                          <span className="font-inter text-[10px] md:text-xs text-white/40 tracking-wider">
                            {section.sublabel}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                )

              default:
                return null
            }
          })}
        </div>

        {/* 6. End-of-Post Internal Link Block */}
        <BlogCollectionGrid />
      </main>

      <Footer />
    </div>
  )
}
