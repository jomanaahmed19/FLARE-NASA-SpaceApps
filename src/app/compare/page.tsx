import type { Metadata } from 'next'
import ComparisonExplorer from '@/components/compare/ComparisonExplorer'

export const metadata: Metadata = {
  title: 'Scientific Comparison — FLARE',
  description: 'Compare NASA combustion experiments and FLARE simulation scenarios side by side.',
}

export default function ComparePage() {
  return <ComparisonExplorer />
}

