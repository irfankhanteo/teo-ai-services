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
  User,
  MapPin,
  Building,
  AlertTriangle,
  FileText
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  analyzeSentiment,
  extractKeyPhrases,
  recognizeEntities,
  recognizePII,
  extractSummary
} from '@/lib/api';
import {
  SentimentResponse,
  KeyPhrasesResponse,
  EntitiesResponse,
  PIIResponse,
  SummaryResponse,
  ServiceStatus
} from '@/types';

const sentimentConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  positive: { icon: Smile, color: 'text-success', bg: 'bg-success/15' },
  negative: { icon: Frown, color: 'text-danger', bg: 'bg-danger/15' },
  neutral: { icon: Meh, color: 'text-warning', bg: 'bg-warning/15' },
  mixed: { icon: Shuffle, color: 'text-accent', bg: 'bg-accent-muted' },
};

const categoryIcons: Record<string, React.ElementType> = {
  Person: User,
  Location: MapPin,
  Organization: Building,
  Email: FileText,
  PhoneNumber: FileText,
  PersonName: User,
  Address: MapPin,
  Company: Building,
};

export default function LanguagePage() {
  const [text, setText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentResponse | null>(null);
  const [keyPhrasesResult, setKeyPhrasesResult] = useState<KeyPhrasesResponse | null>(null);
  const [entitiesResult, setEntitiesResult] = useState<EntitiesResponse | null>(null);
  const [piiResult, setPiiResult] = useState<PIIResponse | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResponse | null>(null);
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showSentences, setShowSentences] = useState(false);

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setSentimentResult(null);
    setKeyPhrasesResult(null);
    setEntitiesResult(null);
    setPiiResult(null);
    setSummaryResult(null);
    setStatus('loading');

    const request = { text: trimmed };

    try {
      const [
        sentimentRes,
        keyPhrasesRes,
        entitiesRes,
        piiRes,
        summaryRes
      ] = await Promise.all([
        analyzeSentiment(request),
        extractKeyPhrases(request),
        recognizeEntities(request),
        recognizePII(request),
        extractSummary(request)
      ]);

      setSentimentResult(sentimentRes);
      setKeyPhrasesResult(keyPhrasesRes);
      setEntitiesResult(entitiesRes);
      setPiiResult(piiRes);
      setSummaryResult(summaryRes);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStatus('error');
    }
  }

  function handleClear() {
    setText('');
    setSentimentResult(null);
    setKeyPhrasesResult(null);
    setEntitiesResult(null);
    setPiiResult(null);
    setSummaryResult(null);
    setStatus('idle');
    setError(null);
    setShowSentences(false);
  }

  const hasResults = status === 'success';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <GlassCard>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <textarea
            id="language-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze sentiment, extract key phrases, recognize entities, detect PII, and summarize..."
            rows={6}
            className="w-full rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="flex gap-3">
            <Button
              id="analyze-btn"
              type="submit"
              className="flex-1"
              disabled={!text.trim() || status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <LoadingSpinner size="sm" /> Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Analyze All
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

          {/* Named Entities */}
          {entitiesResult && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-accent" /> Named Entities
              </h3>

              {entitiesResult.entities.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {entitiesResult.entities.map((entity, i) => {
                    const Icon = categoryIcons[entity.category] || User;
                    return (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface">
                        <Icon className="h-4 w-4 text-muted mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium">{entity.text}</p>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span>{entity.category}</span>
                            {entity.subcategory && <span>• {entity.subcategory}</span>}
                            <span>• {(entity.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">No entities found.</p>
              )}
            </GlassCard>
          )}

          {/* PII Detection */}
          {piiResult && (
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent" /> PII Detection
              </h3>

              {piiResult.pii_entities.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {piiResult.pii_entities.map((entity, i) => {
                    const Icon = categoryIcons[entity.category] || AlertTriangle;
                    return (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-danger/5 border border-danger/20">
                        <Icon className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium">{entity.text}</p>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span>{entity.category}</span>
                            {entity.subcategory && <span>• {entity.subcategory}</span>}
                            <span>• {(entity.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">No PII detected.</p>
              )}
            </GlassCard>
          )}

          {/* Summary */}
          {summaryResult && (
            <GlassCard className="space-y-4 lg:col-span-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> Text Summary
              </h3>

              {summaryResult.summary.length > 0 ? (
                <div className="space-y-3">
                  {summaryResult.summary.map((sentence, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-muted flex items-center justify-center text-xs font-semibold text-accent-hover">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{sentence.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No summary available.</p>
              )}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
