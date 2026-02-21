import Anthropic from '@anthropic-ai/sdk';
import { BLOCKED_TERMS } from './lsu-knowledge';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Simple pre-screen: check if a message contains blocked terms before sending to Claude.
 * Claude's system prompt also handles contextual moderation.
 */
export function preScreenMessage(text: string): { blocked: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const term of BLOCKED_TERMS) {
    if (lower.includes(term)) {
      return { blocked: true, reason: `Message contains inappropriate content.` };
    }
  }
  if (text.trim().length > 1000) {
    return { blocked: true, reason: 'Message is too long. Please keep it under 1000 characters.' };
  }
  return { blocked: false };
}

/**
 * Rate-limiting: simple in-memory store keyed by IP.
 * Limits to 30 requests per minute per IP.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const maxRequests = 30;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}
