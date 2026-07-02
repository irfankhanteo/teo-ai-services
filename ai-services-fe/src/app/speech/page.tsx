'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Mic, Square, Volume2, Type, Languages, User, Globe } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import AudioVisualizer from '@/components/AudioVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { textToSpeech, speechToTextWithLanguage, translateSpeech, getVoices } from '@/lib/api';
import { ServiceStatus, Voice, TranslationResponse } from '@/types';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'da-DK', name: 'Danish (Denmark)' },
  { code: 'ur-IN', name: 'Urdu (Pakistan)' }
];

export default function SpeechPage() {
  // TTS state
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('en-US-JennyNeural');
  const [ttsStatus, setTtsStatus] = useState<ServiceStatus>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);

  // STT state
  const [sttLanguage, setSttLanguage] = useState('en-US');
  const [sttResult, setSttResult] = useState<string | null>(null);
  const [sttStatus, setSttStatus] = useState<ServiceStatus>('idle');
  const [sttError, setSttError] = useState<string | null>(null);

  // Translation state
  const [translationSourceLang, setTranslationSourceLang] = useState('en-US');
  const [translationTargetLang, setTranslationTargetLang] = useState('es-ES');
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [translationStatus, setTranslationStatus] = useState<ServiceStatus>('idle');
  const [translationError, setTranslationError] = useState<string | null>(null);

  const sttRecorder = useAudioRecorder();
  const translationRecorder = useAudioRecorder();
  const player = useAudioPlayer();

  // Load voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      setVoicesLoading(true);
      try {
        const response = await getVoices();
        setVoices(response.voices);
      } catch (error) {
        console.error('Failed to load voices:', error);
      } finally {
        setVoicesLoading(false);
      }
    };
    loadVoices();
  }, []);

  // Filter voices by selected language (for TTS)
  const filteredVoices = voices.filter(voice => 
    voice.locale.toLowerCase().startsWith(ttsVoice.split('-').slice(0, 2).join('-').toLowerCase())
  );

  async function handleTTS(e: FormEvent) {
    e.preventDefault();
    if (!ttsText.trim()) return;

    setTtsStatus('loading');
    setTtsError(null);

    try {
      const blob = await textToSpeech(ttsText, ttsVoice);
      player.play(blob);
      setTtsStatus('success');
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'TTS failed');
      setTtsStatus('error');
    }
  }

  async function handleSTTRecord() {
    if (sttRecorder.isRecording) {
      setSttStatus('loading');
      setSttError(null);

      try {
        const blob = await sttRecorder.stopRecording();
        const result = await speechToTextWithLanguage(blob, sttLanguage);
        setSttResult(result.text);
        setSttStatus('success');
      } catch (err) {
        setSttError(err instanceof Error ? err.message : 'STT failed');
        setSttStatus('error');
      }
    } else {
      setSttResult(null);
      setSttError(null);
      await sttRecorder.startRecording();
    }
  }

  async function handleTranslationRecord() {
    if (translationRecorder.isRecording) {
      setTranslationStatus('loading');
      setTranslationError(null);

      try {
        const blob = await translationRecorder.stopRecording();
        const result = await translateSpeech(blob, translationSourceLang, translationTargetLang);
        setTranslationResult(result);
        setTranslationStatus('success');
        
        // Automatically play the translated audio
        if (result.audio) {
          const audioBlob = base64ToBlob(result.audio, 'audio/wav');
          player.play(audioBlob);
        }
      } catch (err) {
        setTranslationError(err instanceof Error ? err.message : 'Translation failed');
        setTranslationStatus('error');
      }
    } else {
      setTranslationResult(null);
      setTranslationError(null);
      await translationRecorder.startRecording();
    }
  }

  function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async function playTranslatedText() {
    if (!translationResult?.audio) return;
    const audioBlob = base64ToBlob(translationResult.audio, 'audio/wav');
    player.play(audioBlob);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Text-to-Speech */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-accent" /> Text to Speech
        </h2>

        <form onSubmit={handleTTS} className="space-y-4">
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={4}
            className="w-full rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-2">Voice Language</label>
              <select
                value={ttsVoice.split('-').slice(0, 2).join('-')}
                onChange={(e) => {
                  // Find first voice for this language
                  const firstVoice = voices.find(v => v.locale.toLowerCase().startsWith(e.target.value.toLowerCase()));
                  if (firstVoice) setTtsVoice(firstVoice.short_name);
                }}
                className="w-full rounded-xl bg-surface border border-card-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-2">Voice</label>
              <select
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
                className="w-full rounded-xl bg-surface border border-card-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={voicesLoading || filteredVoices.length === 0}
              >
                {voicesLoading ? (
                  <option>Loading voices...</option>
                ) : filteredVoices.length > 0 ? (
                  filteredVoices.map(voice => (
                    <option key={voice.short_name} value={voice.short_name}>
                      {voice.local_name} ({voice.gender})
                    </option>
                  ))
                ) : (
                  <option>No voices available</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={!ttsText.trim() || ttsStatus === 'loading' || voicesLoading}>
              {ttsStatus === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Generating...
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
          <div>
            <label className="block text-xs text-muted mb-2">Source Language</label>
            <select
              value={sttLanguage}
              onChange={(e) => setSttLanguage(e.target.value)}
              className="w-full max-w-xs rounded-xl bg-surface border border-card-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={sttRecorder.isRecording ? 'danger' : 'primary'}
              onClick={handleSTTRecord}
              disabled={sttStatus === 'loading'}
            >
              {sttStatus === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Transcribing...
                </>
              ) : sttRecorder.isRecording ? (
                <>
                  <Square className="h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Record
                </>
              )}
            </Button>

            {sttRecorder.isRecording && (
              <>
                <AudioVisualizer isActive />
                <span className="text-sm text-muted">{sttRecorder.duration}s</span>
              </>
            )}
          </div>

          {sttRecorder.error && <p className="text-sm text-danger">{sttRecorder.error}</p>}
          {sttError && <p className="text-sm text-danger">{sttError}</p>}

          {sttResult && (
            <div className="rounded-xl bg-surface p-4">
              <h4 className="text-xs uppercase tracking-wider text-muted mb-2">Transcription</h4>
              <p className="text-sm whitespace-pre-wrap">{sttResult}</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Speech Translation */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Languages className="h-5 w-5 text-accent" /> Speech Translation
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-2 flex items-center gap-1">
                <User className="h-3 w-3" /> From
              </label>
              <select
                value={translationSourceLang}
                onChange={(e) => setTranslationSourceLang(e.target.value)}
                className="w-full rounded-xl bg-surface border border-card-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {LANGUAGES.map(lang => (
                  <option key={`source-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-2 flex items-center gap-1">
                <Globe className="h-3 w-3" /> To
              </label>
              <select
                value={translationTargetLang}
                onChange={(e) => setTranslationTargetLang(e.target.value)}
                className="w-full rounded-xl bg-surface border border-card-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {LANGUAGES.map(lang => (
                  <option key={`target-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={translationRecorder.isRecording ? 'danger' : 'primary'}
              onClick={handleTranslationRecord}
              disabled={translationStatus === 'loading'}
            >
              {translationStatus === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Translating...
                </>
              ) : translationRecorder.isRecording ? (
                <>
                  <Square className="h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Record & Translate
                </>
              )}
            </Button>

            {translationRecorder.isRecording && (
              <>
                <AudioVisualizer isActive />
                <span className="text-sm text-muted">{translationRecorder.duration}s</span>
              </>
            )}
          </div>

          {translationRecorder.error && <p className="text-sm text-danger">{translationRecorder.error}</p>}
          {translationError && <p className="text-sm text-danger">{translationError}</p>}

          {translationResult && (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface p-4">
                <h4 className="text-xs uppercase tracking-wider text-muted mb-2">Original ({LANGUAGES.find(l => l.code === translationSourceLang)?.name})</h4>
                <p className="text-sm whitespace-pre-wrap">{translationResult.text}</p>
              </div>
              
              <div className="rounded-xl bg-accent-muted/30 p-4 border border-accent-muted">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase tracking-wider text-accent font-semibold">
                    Translation ({LANGUAGES.find(l => l.code === translationTargetLang)?.name})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playTranslatedText}
                    className="h-8 px-3"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap text-accent-hover">
                  {translationResult.translations[translationTargetLang]}
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
