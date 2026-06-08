'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Link as LinkIcon, ImageIcon, FileText, Tag, Box } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { analyzeImageByUrl, analyzeImageByUpload } from '@/lib/api';
import { VisionAnalysisResponse, ServiceStatus } from '@/types';

export default function VisionPage() {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VisionAnalysisResponse | null>(null);
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      let res: VisionAnalysisResponse;

      if (mode === 'url') {
        if (!imageUrl.trim()) {
          setError('Please enter an image URL.');
          setStatus('error');
          return;
        }
        setPreviewUrl(imageUrl);
        res = await analyzeImageByUrl(imageUrl);
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          setError('Please select a file.');
          setStatus('error');
          return;
        }
        res = await analyzeImageByUpload(file);
      }

      setResult(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input controls */}
      <GlassCard>
        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'upload' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('upload')}
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <Button
            variant={mode === 'url' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('url')}
          >
            <LinkIcon className="h-4 w-4" /> URL
          </Button>
        </div>

        {mode === 'upload' ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-card-border p-8 hover:border-accent/40 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="h-10 w-10 text-muted mb-3" />
            <p className="text-sm text-muted">Click to select an image</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        )}

        <Button className="mt-4 w-full" onClick={handleAnalyze} disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <LoadingSpinner size="sm" /> Analyzing…
            </>
          ) : (
            'Analyze Image'
          )}
        </Button>
      </GlassCard>

      {/* Error */}
      {error && (
        <GlassCard className="border-danger/30 text-danger text-sm">{error}</GlassCard>
      )}

      {/* Results */}
      {(previewUrl || result) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preview */}
          {previewUrl && (
            <GlassCard>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-accent" /> Preview
              </h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg object-contain max-h-80"
              />
            </GlassCard>
          )}

          {/* Analysis result */}
          {result && (
            <GlassCard className="space-y-4">
              {result.captionResult && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Caption
                  </h4>
                  <p className="text-sm">{result.captionResult.text}</p>
                  <span className="text-xs text-muted">
                    Confidence: {(result.captionResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {result.readResult?.blocks?.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Extracted Text (OCR)
                  </h4>
                  <pre className="text-sm bg-surface rounded-lg p-3 whitespace-pre-wrap font-mono">
                    {result.readResult.blocks
                      .flatMap((block) => block.lines.map((line) => line.text))
                      .join('\n')}
                  </pre>
                </div>
              )}

              {result.tagsResult?.values?.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.tagsResult.values.map((tag) => (
                      <span
                        key={tag.name}
                        className="rounded-full bg-accent-muted px-3 py-1 text-xs text-accent-hover"
                      >
                        {tag.name} ({(tag.confidence * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.objectsResult?.values?.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                    <Box className="h-3 w-3" /> Objects
                  </h4>
                  <p className="text-sm text-muted">
                    {result.objectsResult.values.length} object(s) detected
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
