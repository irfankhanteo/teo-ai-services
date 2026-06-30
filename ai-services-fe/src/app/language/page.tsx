'use client';

import { useState, FormEvent } from 'react';
import {
  Smile,
  Frown,
  Meh,
  Shuffle,
  Key,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { analyzeSentiment, extractKeyPhrases } from '@/lib/api';
import { SentimentResponse, KeyPhrasesResponse, ServiceStatus } from '@/types';

const sentimentConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  positive: { icon: Smile, color: 'text-success', bg: 'bg-success/15' },
  negative: { icon: Frown, color: 'text-danger', bg: 'bg-danger/15' },
  neutral: { icon: Meh, color: 'text-warning', bg: 'bg-warning/15' },
  mixed: { icon: Shuffle, color: 'text-accent', bg: 'bg-accent-muted' },
};

export default function LanguagePage() {
  const [text, setText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentResponse | null>(null);
  const [keyPhrasesResult, setKeyPhrasesResult] = useState<KeyPhrasesResponse | null>(null);
  const [sentimentStatus, setSentimentStatus] = useState<ServiceStatus>('idle');
  const [keyPhrasesStatus, setKeyPhrasesStatus] = useState<ServiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showSentences, setShowSentences] = useState(false);

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setSentimentResult(null);
    setKeyPhrasesResult(null);
    setSentimentStatus('loading');
    setKeyPhrasesStatus('loading');

    const request = { text: trimmed };

    // Run both in parallel
    const sentimentPromise = analyzeSentiment(request)
      .then((res) => {
        setSentimentResult(res);
        setSentimentStatus('success');
      })
      .catch((err) => {
        setSentimentStatus('error');
        throw err;
      });

    const keyPhrasesPromise = extractKeyPhrases(request)
      .then((res) => {
        setKeyPhrasesResult(res);
        setKeyPhrasesStatus('success');
      })
      .catch((err) => {
        setKeyPhrasesStatus('error');
        throw err;
      });

    try {
      await Promise.all([sentimentPromise, keyPhrasesPromise]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  }

  function handleClear() {
    setText('');
    setSentimentResult(null);
    setKeyPhrasesResult(null);
    setSentimentStatus('idle');
    setKeyPhrasesStatus('idle');
    setError(null);
    setShowSentences(false);
  }

  const isLoading = sentimentStatus === 'loading' || keyPhrasesStatus === 'loading';
  const hasResults = sentimentResult || keyPhrasesResult;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input */}
      <GlassCard>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <textarea
            id="language-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze sentiment and extract key phrases…"
            rows={5}
            className="w-full rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="flex gap-3">
            <Button
              id="analyze-btn"
              type="submit"
              className="flex-1"
              disabled={!text.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" /> Analyzing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Analyze
                </>
              )}
            </Button>
            <Button
              id="clear-btn"
              type="button"
              variant="ghost"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Error */}
      {error && (
        <GlassCard className="border-danger/30 text-danger text-sm">
          {error}
        </GlassCard>
      )}

      {/* Results */}
      {hasResults && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sentiment Analysis */}
          {sentimentResult && (
            <GlassCard className="space-y-5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Smile className="h-4 w-4 text-accent" /> Sentiment Analysis
              </h3>

              {/* Overall Sentiment Badge */}
              {(() => {
                const cfg = sentimentConfig[sentimentResult.sentiment] ?? sentimentConfig.neutral;
                const Icon = cfg.icon;
                return (
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                    <span className={`text-sm font-semibold capitalize ${cfg.color}`}>
                      {sentimentResult.sentiment}
                    </span>
                  </div>
                );
              })()}

              {/* Confidence Bars */}
              <div className="space-y-3">
                {(['positive', 'negative', 'neutral'] as const).map((key) => {
                  const value = sentimentResult.confidence_scores[key];
                  const pct = (value * 100).toFixed(1);
                  const barColors: Record<string, string> = {
                    positive: 'bg-success',
                    negative: 'bg-danger',
                    neutral: 'bg-warning',
                  };
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize text-muted">{key}</span>
                        <span className="text-foreground font-medium">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColors[key]} transition-all duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Per-sentence breakdown */}
              {sentimentResult.sentences?.length > 0 && (
                <div>
                  <button
                    id="toggle-sentences-btn"
                    type="button"
                    onClick={() => setShowSentences(!showSentences)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    {showSentences ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {sentimentResult.sentences.length} sentence(s) breakdown
                  </button>

                  {showSentences && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {sentimentResult.sentences.map((sentence, i) => {
                        const cfg =
                          sentimentConfig[sentence.sentiment] ?? sentimentConfig.neutral;
                        return (
                          <div
                            key={i}
                            className="rounded-lg bg-surface p-3 text-xs space-y-1"
                          >
                            <p className="text-foreground leading-relaxed">
                              &ldquo;{sentence.text}&rdquo;
                            </p>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${cfg.bg} ${cfg.color}`}
                            >
                              {sentence.sentiment}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {/* Key Phrases */}
          {keyPhrasesResult && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" /> Key Phrases
              </h3>

              {keyPhrasesResult.key_phrases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keyPhrasesResult.key_phrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="rounded-full bg-accent-muted px-3 py-1.5 text-xs text-accent-hover font-medium"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No key phrases found.</p>
              )}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
