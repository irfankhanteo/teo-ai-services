'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Eye, AudioLines } from 'lucide-react';

const pageTitles: Record<string, { label: string; icon: React.ElementType }> = {
  '/': { label: 'Dashboard', icon: LayoutDashboard },
  '/chat': { label: 'Chat Completion', icon: MessageSquare },
  '/vision': { label: 'Vision / OCR', icon: Eye },
  '/speech': { label: 'Speech Studio', icon: AudioLines },
};

export default function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { label: 'AI Services', icon: LayoutDashboard };
  const Icon = page.icon;

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center gap-3 border-b border-card-border bg-surface/80 px-6 backdrop-blur-md">
      <Icon className="h-5 w-5 text-accent" />
      <h1 className="text-lg font-semibold tracking-tight">{page.label}</h1>
    </header>
  );
}
