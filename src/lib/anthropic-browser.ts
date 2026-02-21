/**
 * Browser-side Anthropic client for Capacitor/static builds.
 * The API key is stored in localStorage and retrieved at call time.
 * Uses dangerouslyAllowBrowser since this runs in a native Capacitor WebView.
 */
import Anthropic from '@anthropic-ai/sdk';

const API_KEY_STORAGE = 'lsu-anthropic-key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveApiKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

export function clearApiKey() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE);
}

export function hasApiKey(): boolean {
  return getStoredApiKey().startsWith('sk-ant-');
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Stream a chat response from Anthropic.
 * Yields text chunks as they arrive.
 * Throws if no API key is configured.
 */
export async function* streamChat(
  message: string,
  history: ChatMessage[],
  systemPrompt: string
): AsyncGenerator<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('NO_KEY');
  }

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const messages: ChatMessage[] = [...history.slice(-10), { role: 'user', content: message }];

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system: systemPrompt,
    messages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}
