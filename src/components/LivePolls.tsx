'use client';

import { useState, useEffect, useCallback } from 'react';
import PollCard from './PollCard';
import { Poll } from '@/lib/polls';

// Track votes in sessionStorage so they persist across re-renders
// but reset each browser session
function getVoteKey(pollId: string) {
  return `lsu-vote-${pollId}`;
}

function getSavedVote(pollId: string): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(getVoteKey(pollId));
}

function saveVote(pollId: string, optionId: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(getVoteKey(pollId), optionId);
}

export default function LivePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch('/api/polls');
      if (!res.ok) throw new Error('Failed to fetch polls');
      const data = await res.json();
      setPolls(data.polls);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 5 seconds for live vote counts
  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  async function handleVote(pollId: string, optionId: string) {
    // Optimistic update
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        return {
          ...poll,
          options: poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      })
    );

    saveVote(pollId, optionId);

    // Confirm with server
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (data.poll) {
        setPolls((prev) => prev.map((p) => (p.id === pollId ? data.poll : p)));
      }
    } catch {
      // Revert optimistic update on error
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll;
          return {
            ...poll,
            options: poll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes - 1 } : opt
            ),
          };
        })
      );
      sessionStorage.removeItem(getVoteKey(pollId));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-4xl animate-bounce">🐯</div>
        <p className="text-white/60 text-sm">Loading polls from Death Valley...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">😿</div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPolls}
          className="px-4 py-2 bg-lsu-gold text-black rounded-lg font-bold text-sm hover:bg-lsu-gold-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-green-400 text-sm font-medium">Live</span>
          <span className="text-white/40 text-sm">· {polls.length} active polls</span>
        </div>
        {lastUpdated && (
          <span className="text-white/30 text-xs">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {/* Polls grid */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <div className="text-4xl mb-3">📊</div>
            <p>No active polls right now. Check back during game time!</p>
          </div>
        ) : (
          polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              votedOption={getSavedVote(poll.id)}
              onVote={handleVote}
            />
          ))
        )}
      </div>

      <p className="text-center text-white/20 text-xs mt-6">
        Votes refresh every 5 seconds · One vote per session per poll
      </p>
    </div>
  );
}
