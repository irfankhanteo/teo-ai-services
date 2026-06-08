'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  error: string | null;
  play: (blob: Blob) => void;
  pause: () => void;
  stop: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeCurrentUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
  }, []);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    revokeCurrentUrl();
    resetState();
  }, [revokeCurrentUrl, resetState]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const play = useCallback(
    (blob: Blob) => {
      setError(null);

      // Clean up any previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      revokeCurrentUrl();

      try {
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
          if (audio.duration > 0) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        });

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(audio.duration);
          setProgress(100);
        });

        audio.addEventListener('error', () => {
          const message = 'Failed to play audio. The format may not be supported.';
          setError(message);
          setIsPlaying(false);
          revokeCurrentUrl();
        });

        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          const message = err instanceof Error ? err.message : 'Failed to play audio.';
          setError(message);
          setIsPlaying(false);
        });
      } catch {
        setError('Failed to create audio from the provided data.');
        resetState();
      }
    },
    [revokeCurrentUrl, resetState]
  );

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    error,
    play,
    pause,
    stop,
  };
}
