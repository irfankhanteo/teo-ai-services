'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Eye,
  AudioLines,
  Languages,
  Sparkles,
  Activity,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat Completion', icon: MessageSquare },
  { href: '/vision', label: 'Vision / OCR', icon: Eye },
  { href: '/speech', label: 'Speech Studio', icon: AudioLines },
  { href: '/language', label: 'Language', icon: Languages },
  { href: '/ml', label: 'ML Prediction', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[var(--sidebar-width)] flex-col border-r border-card-border bg-surface">
      {/* Brand */}
      <div className="flex h-[var(--header-height)] items-center gap-2 px-6 border-b border-card-border">
        <Sparkles className="h-6 w-6 text-accent" />
        <span className="text-lg font-semibold tracking-tight">AI&nbsp;Services</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent-muted text-accent-hover'
                      : 'text-muted hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-card-border px-4 py-3">
        <p className="text-xs text-muted">v0.1.0 &middot; Next.js + FastAPI</p>
      </div>
    </aside>
  );
}
