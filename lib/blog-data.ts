export type BlogImage = {
  src: string       // External internet URL — Pexels CDN or Unsplash CDN only. No /public paths.
  alt: string       // Descriptive, keyword-conscious. See per-post image specs.
  caption?: string  // Optional. Rendered below image in Inter, small, italic.
}

export type BlogSection =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; image: BlogImage }
  | { type: 'image-grid'; images: BlogImage[]; columns: 2 | 4 }
  | { type: 'cta'; label: string; href: string; sublabel?: string }
  | { type: 'product-strip'; categorySlug: string; categoryLabel: string; href: string }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string        // Max 155 chars. Used as meta description AND card preview text.
  publishedAt: string    // ISO date string e.g. "2026-06-28"
  readTime: number       // Integer, minutes
  heroImage: BlogImage   // Full-width image shown at top of post
  tags: string[]         // Lowercase hyphenated strings
  sections: BlogSection[]
}

const POSTS: BlogPost[] = [
  {
    slug: 'same-day-delivery-jamnagar',
    title: 'Onyx Now Delivers Same-Day Across Jamnagar',
    excerpt: 'Order any product from the Onyx catalog and receive it the same day — anywhere in Jamnagar. Emergency shopping, last-minute outfits, solved.',
    publishedAt: '2026-06-28',
    readTime: 4,
    tags: ['jamnagar', 'delivery', 'same-day', 'menswear'],
    heroImage: {
      src: 'https://i.pinimg.com/736x/28/c2/e8/28c2e894d4e2027cf2dbbd0e915c4972.jpg',
      alt: 'Same-day menswear delivery in Jamnagar — Onyx collection',
    },
    sections: [
      {
        type: 'paragraph',
        text: 'If you need something to wear today, your options in Jamnagar have always been limited — whatever is in stock at the nearest store, or waiting days for an online delivery. Onyx changes that. Every product in our catalog is now available for same-day delivery anywhere in Jamnagar.',
      },
      {
        type: 'image',
        image: {
          src: 'https://i.pinimg.com/736x/19/42/19/19421994ce5c357228b4f1d41d75bd15.jpg',
          alt: 'Premium mens shirts available for same-day delivery in Jamnagar',
          caption: 'Every shirt in the Onyx catalog, delivered today.',
        },
      },
      {
        type: 'heading',
        level: 2,
        text: 'How It Works',
      },
      {
        type: 'paragraph',
        text: 'Place your order on the Onyx website. You will receive a WhatsApp confirmation from us. We deliver to your door the same day, within Jamnagar. No app. No account. No waiting.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Emergency Shopping, Solved',
      },
      {
        type: 'paragraph',
        text: 'Wedding tomorrow. Last-minute event. An outfit that did not survive the day. A gift you forgot until tonight. These are real situations — and standard delivery does not help. Same-day delivery from Onyx is built for exactly this.',
      },
      {
        type: 'image',
        image: {
          src: 'https://i.pinimg.com/736x/ad/b3/f9/adb3f9b056cf3452584120678f10edee.jpg',
          alt: 'Onyx mens jeans — quality denim delivered same day in Jamnagar',
          caption: 'No compromises on quality just because you need it today.',
        },
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Full Onyx Catalog, Available Today',
      },
      {
        type: 'paragraph',
        text: 'The complete Onyx collection — t-shirts, shirts, jeans, outerwear — is eligible for same-day delivery within Jamnagar. Everything you see on the site is available today.',
      },
      {
        type: 'image-grid',
        columns: 4,
        images: [
          {
            src: 'https://i.pinimg.com/736x/74/99/4d/74994d40facfd941c0516eba2c98e4da.jpg',
            alt: 'Mens t-shirts Jamnagar same day delivery — Onyx',
          },
          {
            src: 'https://i.pinimg.com/736x/f4/06/f7/f406f7c9fc35597be6fa55f90a7da0b5.jpg',
            alt: 'Mens shirts Jamnagar same day delivery — Onyx',
          },
          {
            src: 'https://i.pinimg.com/736x/80/f4/d5/80f4d5b570141ad8cddaf5669b8e0e5a.jpg',
            alt: 'Mens jeans Jamnagar same day delivery — Onyx',
          },
          {
            src: 'https://i.pinimg.com/736x/9c/95/54/9c955417f9e2dac5c234bb4081cafa80.jpg',
            alt: 'Mens outerwear Jamnagar same day delivery — Onyx',
          },
        ],
      },
      {
        type: 'product-strip',
        categorySlug: 't-shirts',
        categoryLabel: 'T-SHIRTS',
        href: '/shop/t-shirts',
      },
      {
        type: 'product-strip',
        categorySlug: 'shirts',
        categoryLabel: 'SHIRTS',
        href: '/shop/shirts',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Order Now, Wear Today',
      },
      {
        type: 'cta',
        label: 'Shop All Products',
        href: '/shop',
        sublabel: 'Same-day delivery available in Jamnagar',
      },
      {
        type: 'cta',
        label: 'See New Drops',
        href: '/new-drops',
        sublabel: 'Fresh styles, in your hands today',
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug)
}
