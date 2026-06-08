'use client';

interface AudioVisualizerProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export default function AudioVisualizer({
  isActive,
  barCount = 5,
  className = '',
}: AudioVisualizerProps) {
  return (
    <div className={`flex items-end gap-0.5 h-6 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            isActive ? 'bg-accent audio-bar' : 'bg-muted h-1'
          }`}
          style={
            isActive
              ? { animationDelay: `${i * 0.15}s`, height: '100%' }
              : undefined
          }
        />
      ))}
    </div>
  );
}
