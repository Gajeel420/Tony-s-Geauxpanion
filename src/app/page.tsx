'use client';

import { useState } from 'react';
import clsx from 'clsx';
import LivePolls from '@/components/LivePolls';
import AskTheTiger from '@/components/AskTheTiger';
import Settings from '@/components/Settings';

type Tab = 'polls' | 'chat' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'polls', label: 'Live Polls', icon: '📊' },
  { id: 'chat', label: 'Ask Tiger', icon: '🐯' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('polls');

  return (
    <div className="min-h-screen bg-lsu-darker flex flex-col">
      {/* Header */}
      <header className="bg-lsu-purple border-b border-lsu-gold/20 sticky top-0 z-20 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lsu-gold rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🐯
              </div>
              <div>
                <h1 className="text-white font-black text-lg leading-none tracking-tight">
                  Tony&apos;s Geauxpanion
                </h1>
                <p className="text-lsu-gold text-xs mt-0.5 font-medium tracking-wide">
                  GEAUX TIGERS 💜💛
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-lsu-darker border-b border-white/10 sticky top-[68px] z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2',
                  activeTab === tab.id
                    ? 'border-lsu-gold text-lsu-gold'
                    : 'border-transparent text-white/50 hover:text-white/80'
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {activeTab === 'polls' && (
          <div>
            <div className="mb-5">
              <h2 className="text-lsu-gold font-black text-xl">Game Day Polls</h2>
              <p className="text-white/50 text-sm mt-1">
                Vote with 100,000+ fans in Death Valley — real-time results
              </p>
            </div>
            <LivePolls />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-lsu-gold font-black text-xl">Ask the Tiger</h2>
              <p className="text-white/50 text-sm mt-1">
                AI-powered game-day guide — venue info, LSU history, and more
              </p>
            </div>
            <AskTheTiger />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-5">
              <h2 className="text-lsu-gold font-black text-xl">Settings</h2>
              <p className="text-white/50 text-sm mt-1">
                Configure your Geauxpanion app
              </p>
            </div>
            <Settings />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 mt-auto">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-white/20 text-xs">
            Tony&apos;s Geauxpanion · Not affiliated with LSU Athletics · Geaux Tigers! 🐯
          </p>
        </div>
      </footer>
    </div>
  );
}
