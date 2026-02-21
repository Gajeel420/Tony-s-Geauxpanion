'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { getStoredApiKey, saveApiKey, clearApiKey, hasApiKey } from '@/lib/anthropic-browser';

export default function Settings() {
  const [keyInput, setKeyInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [masked, setMasked] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const existing = getStoredApiKey();
    if (existing) {
      setKeyInput(existing);
      setHasSaved(true);
    }
  }, []);

  function handleSave() {
    if (!keyInput.trim()) return;
    saveApiKey(keyInput.trim());
    setHasSaved(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleClear() {
    clearApiKey();
    setKeyInput('');
    setHasSaved(false);
  }

  const isValid = keyInput.trim().startsWith('sk-ant-');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-2xl bg-lsu-purple border border-lsu-gold/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚙️</span>
          <div>
            <h2 className="text-white font-black text-lg">App Settings</h2>
            <p className="text-white/50 text-sm">Configure your Geauxpanion experience</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-lsu-gold font-bold mb-1">Anthropic API Key</h3>
          <p className="text-white/60 text-xs mb-4 leading-relaxed">
            Required to enable the{' '}
            <span className="text-lsu-gold font-semibold">Ask the Tiger</span> AI chat.{' '}
            Get your free key at{' '}
            <span className="text-lsu-gold underline">console.anthropic.com</span>. Your key
            is stored only on this device and never sent to any server.
          </p>

          {/* Status pill */}
          <div className="mb-3 flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold',
                hasApiKey()
                  ? 'bg-green-900/50 text-green-300 border border-green-500/30'
                  : 'bg-red-900/50 text-red-300 border border-red-500/30'
              )}
            >
              {hasApiKey() ? '✓ API key configured' : '✗ No API key'}
            </span>
          </div>

          {/* Key input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={masked ? 'password' : 'text'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-ant-api03-..."
                className={clsx(
                  'w-full bg-black/30 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30',
                  'focus:outline-none focus:ring-1 transition-all font-mono',
                  isValid
                    ? 'border-green-500/50 focus:ring-green-500/30'
                    : keyInput
                    ? 'border-red-500/40 focus:ring-red-500/20'
                    : 'border-white/20 focus:ring-lsu-gold/30 focus:border-lsu-gold/50'
                )}
              />
              <button
                type="button"
                onClick={() => setMasked((m) => !m)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs"
              >
                {masked ? '👁' : '🙈'}
              </button>
            </div>
          </div>

          {keyInput && !isValid && (
            <p className="text-red-400 text-xs mt-1.5">
              Key should start with <code className="bg-black/30 px-1 rounded">sk-ant-</code>
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={clsx(
                'flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-150',
                isValid
                  ? 'bg-lsu-gold text-black hover:bg-lsu-gold-dark active:scale-95'
                  : 'bg-lsu-gold/30 text-black/30 cursor-not-allowed'
              )}
            >
              {saved ? '✓ Saved!' : 'Save API Key'}
            </button>
            {hasSaved && (
              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-900/40 border border-red-500/30 text-red-300 hover:bg-red-800/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About card */}
      <div className="rounded-2xl bg-lsu-purple border border-lsu-gold/20 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🐯</span>
          <h3 className="text-lsu-gold font-bold">About Tony&apos;s Geauxpanion</h3>
        </div>
        <div className="text-white/60 text-sm space-y-2">
          <p>The ultimate LSU fan companion. Built with purple and gold in mind. 💜💛</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-lsu-gold font-bold">📊 Live Polls</div>
              <div className="text-white/50 mt-0.5">Vote with Death Valley</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-lsu-gold font-bold">🐯 Ask Tiger</div>
              <div className="text-white/50 mt-0.5">AI game-day guide</div>
            </div>
          </div>
          <p className="text-white/30 text-xs pt-2">
            Version 1.0 · Not affiliated with LSU Athletics
          </p>
        </div>
      </div>
    </div>
  );
}
