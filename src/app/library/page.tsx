import type { Metadata } from 'next'
import ResearchExplorer from '@/components/research/ResearchExplorer'

export const metadata: Metadata = {
  title: 'NASA Research Library — FLARE',
  description:
    'Verified NASA combustion science literature, Saffire reports, Apollo 1 & 13 investigations, 1997 Mir fire documentation, smoke detection research, and firefighter safety spinoffs.',
}

export default function LibraryPage() {
  return <ResearchExplorer initialTab="library" />
}

