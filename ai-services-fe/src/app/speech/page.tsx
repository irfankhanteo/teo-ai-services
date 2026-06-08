'use client';

import { useState, FormEvent } from 'react';
import { Mic, Square, Volume2, Type } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import AudioVisualizer from '@/components/AudioVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { textToSpeech, speechToText } from '@/lib/api';
import { ServiceStatus } from '@/types';

export default function SpeechPage() {
  // TTS state
  const [ttsText, setTtsText] = useState('');
  const [ttsStatus, setTtsStatus] = useState<ServiceStatus>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);

  // STT state
  const [sttResult, setSttResult] = useState<string | null>(null);
  const [sttStatus, setSttStatus] = useState<ServiceStatus>('idle');
  const [sttError, setSttError] = useState<string | null>(null);

  const recorder = useAudioRecorder();
  const player = useAudioPlayer();

  async function handleTTS(e: FormEvent) {
    e.preventDefault();
    if (!ttsText.trim()) return;

    setTtsStatus('loading');
    setTtsError(null);

    try {
      const blob = await textToSpeech(ttsText);
      player.play(blob);
      setTtsStatus('success');
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'TTS failed');
      setTtsStatus('error');
    }
  }

  async function handleRecord() {
    if (recorder.isRecording) {
      setSttStatus('loading');
      setSttError(null);

      try {
        const blob = await recorder.stopRecording();
        const result = await speechToText(blob);
        setSttResult(result.text);
        setSttStatus('success');
      } catch (err) {
        setSttError(err instanceof Error ? err.message : 'STT failed');
        setSttStatus('error');
      }
    } else {
      setSttResult(null);
      setSttError(null);
      await recorder.startRecording();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Text-to-Speech */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-accent" /> Text to Speech
        </h2>

        <form onSubmit={handleTTS} className="space-y-4">
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text to convert to speech…"
            rows={4}
            className="w-full rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={!ttsText.trim() || ttsStatus === 'loading'}>
              {ttsStatus === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Generating…
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" /> Speak
                </>
              )}
            </Button>

            {player.isPlaying && <AudioVisualizer isActive />}

            {player.duration > 0 && (
              <span className="text-xs text-muted">
                {player.currentTime.toFixed(1)}s / {player.duration.toFixed(1)}s
              </span>
            )}
          </div>

          {ttsError && <p className="text-sm text-danger">{ttsError}</p>}
        </form>
      </GlassCard>

      {/* Speech-to-Text */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-accent" /> Speech to Text
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={recorder.isRecording ? 'danger' : 'primary'}
              onClick={handleRecord}
              disabled={sttStatus === 'loading'}
            >
              {sttStatus === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Transcribing…
                </>
              ) : recorder.isRecording ? (
                <>
                  <Square className="h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Record
                </>
              )}
            </Button>

            {recorder.isRecording && (
              <>
                <AudioVisualizer isActive />
                <span className="text-sm text-muted">{recorder.duration}s</span>
              </>
            )}
          </div>

          {recorder.error && <p className="text-sm text-danger">{recorder.error}</p>}
          {sttError && <p className="text-sm text-danger">{sttError}</p>}

          {sttResult && (
            <div className="rounded-xl bg-surface p-4">
              <h4 className="text-xs uppercase tracking-wider text-muted mb-2">Transcription</h4>
              <p className="text-sm whitespace-pre-wrap">{sttResult}</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
