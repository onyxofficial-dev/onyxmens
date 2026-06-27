import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Onyx — Indian Menswear Brand',
  description: 'Onyx is a premium urban Indian menswear brand. Minimal. Premium. No hype.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <AboutClient />
}
