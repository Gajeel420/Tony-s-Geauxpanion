'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { SUGGESTED_QUESTIONS } from '@/lib/lsu-knowledge';
import { ChatMessage } from '@/lib/claude';

interface DisplayMessage extends ChatMessage {
  id: string;
  isStreaming?: boolean;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AskTheTiger() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "ROAR! I'm Tiger, your LSU game-day guide powered by AI! 🐯\n\nAsk me anything about Tiger Stadium, LSU history, game-day logistics, or what to expect in Death Valley tonight. I'm prowling for your questions!\n\nGeaux Tigers! 💜💛",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMessage: DisplayMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
    };

    const assistantMsgId = generateId();
    const assistantMessage: DisplayMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    // Build history (exclude welcome message and streaming placeholders)
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome' && !m.isStreaming)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get response');
      }

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulated }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }

      // Finalize message (remove streaming flag)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      // Remove the incomplete assistant message
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleSuggestion(q: string) {
    sendMessage(q);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'flex gap-3 animate-slide-in',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shadow-lg',
                msg.role === 'assistant'
                  ? 'bg-lsu-gold text-black'
                  : 'bg-lsu-purple-light text-white'
              )}
            >
              {msg.role === 'assistant' ? '🐯' : '👤'}
            </div>

            {/* Bubble */}
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
                msg.role === 'assistant'
                  ? 'bg-lsu-purple border border-lsu-gold/20 text-white rounded-tl-sm'
                  : 'bg-lsu-gold text-black rounded-tr-sm font-medium'
              )}
            >
              {msg.content ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                msg.isStreaming && (
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-2 h-2 bg-lsu-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-lsu-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-lsu-gold rounded-full animate-bounce" />
                  </div>
                )
              )}
              {msg.isStreaming && msg.content && (
                <span className="inline-block w-0.5 h-4 bg-lsu-gold ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/50 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-xl max-w-sm text-center">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (only show when conversation is short) */}
      {messages.length <= 3 && !isLoading && (
        <div className="py-3">
          <p className="text-white/40 text-xs mb-2 text-center">Try asking Tiger about...</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-lsu-purple border border-lsu-gold/30 text-lsu-gold hover:bg-lsu-gold hover:text-black transition-all duration-150 hover:scale-105"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask Tiger anything about LSU..."
          maxLength={500}
          className={clsx(
            'flex-1 bg-lsu-purple border border-lsu-gold/30 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm',
            'focus:outline-none focus:border-lsu-gold/70 focus:ring-1 focus:ring-lsu-gold/30 transition-all',
            isLoading && 'opacity-60'
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={clsx(
            'px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150',
            input.trim() && !isLoading
              ? 'bg-lsu-gold text-black hover:bg-lsu-gold-dark hover:scale-105 active:scale-95'
              : 'bg-lsu-gold/30 text-black/30 cursor-not-allowed'
          )}
        >
          {isLoading ? '🐾' : 'Ask 🐯'}
        </button>
      </form>

      <p className="text-center text-white/20 text-xs mt-2">
        Tiger is an AI assistant — always verify critical info with official sources
      </p>
    </div>
  );
}
