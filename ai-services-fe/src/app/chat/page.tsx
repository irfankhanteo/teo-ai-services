'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Trash2, Bot, User } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { sendChatMessage } from '@/lib/api';
import { ChatMessage, ServiceStatus } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === 'loading') return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStatus('loading');

    try {
      const apiMessages = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await sendChatMessage({
        messages: apiMessages, max_tokens: 1000,
        temperature: 0.7
      });

      console.log('Chat response:', response);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStatus('success');
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStatus('error');
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-3rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <GlassCard className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <Bot className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">Start a conversation with the AI assistant.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 rounded-full bg-accent-muted p-2 h-fit">
                <Bot className="h-4 w-4 text-accent" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-accent text-white rounded-br-md'
                : 'bg-surface-hover text-foreground rounded-bl-md'
                }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 rounded-full bg-surface-hover p-2 h-fit">
                <User className="h-4 w-4 text-muted" />
              </div>
            )}
          </div>
        ))}

        {status === 'loading' && (
          <div className="flex gap-3 items-center">
            <div className="rounded-full bg-accent-muted p-2">
              <Bot className="h-4 w-4 text-accent" />
            </div>
            <LoadingSpinner size="sm" />
          </div>
        )}

        <div ref={bottomRef} />
      </GlassCard>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl bg-surface border border-card-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <Button type="submit" disabled={!input.trim() || status === 'loading'}>
          <Send className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setMessages([]);
            setStatus('idle');
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
