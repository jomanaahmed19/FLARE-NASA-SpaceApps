import type { Metadata } from 'next'
import ResearchExplorer from '@/components/research/ResearchExplorer'

export const metadata: Metadata = {
  title: 'Scientific Insights — FLARE',
  description:
    'Evidence-backed scientific relationships connecting NASA microgravity combustion investigations and FLARE simulation results.',
}

export default function InsightsPage() {
  return <ResearchExplorer initialTab="insights" />
}

