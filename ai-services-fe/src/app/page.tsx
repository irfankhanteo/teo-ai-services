import { MessageSquare, Eye, AudioLines, Languages, Zap } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Link from 'next/link';

const services = [
  {
    href: '/chat',
    title: 'Chat Completion',
    description: 'Conversational AI powered by large language models. Send messages and get intelligent responses.',
    icon: MessageSquare,
    color: 'text-indigo-400',
  },
  {
    href: '/vision',
    title: 'Vision / OCR',
    description: 'Analyze images, extract text, and detect objects using computer vision models.',
    icon: Eye,
    color: 'text-emerald-400',
  },
  {
    href: '/speech',
    title: 'Speech Studio',
    description: 'Convert text to speech and speech to text with high-quality voice models.',
    icon: AudioLines,
    color: 'text-amber-400',
  },
  {
    href: '/language',
    title: 'Language',
    description: 'Analyze sentiment and extract key phrases from text using Azure AI Language.',
    icon: Languages,
    color: 'text-cyan-400',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <GlassCard className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-accent-muted p-4">
            <Zap className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          AI Services Dashboard
        </h2>
        <p className="text-muted max-w-lg mx-auto">
          Explore AI-powered services for chat, vision, and speech. Select a service below to get started.
        </p>
      </GlassCard>

      {/* Service cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ href, title, description, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <GlassCard className="h-full hover:border-accent/30 transition-colors cursor-pointer group">
              <Icon className={`h-8 w-8 ${color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
