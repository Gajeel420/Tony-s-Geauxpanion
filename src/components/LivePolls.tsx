'use client';

import { useState, useEffect, useCallback } from 'react';
import PollCard from './PollCard';
import {
  Poll,
  getPolls,
  vote,
  simulateCrowdVote,
  getMyVote,
  saveMyVote,
} from '@/lib/polls-client';

export default function LivePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    setPolls(getPolls());
    setLastUpdated(new Date());
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
    setLoaded(true);
  }, [refresh]);

  // Simulate crowd activity every 4–8 seconds
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const next = simulateCrowdVote();
      setPolls(next);
      setLastUpdated(new Date());
      const delay = 4000 + Math.random() * 4000;
      timeout = setTimeout(tick, delay);
    }

    timeout = setTimeout(tick, 4000 + Math.random() * 4000);
    return () => clearTimeout(timeout);
  }, []);

  function handleVote(pollId: string, optionId: string) {
    saveMyVote(pollId, optionId);
    const updated = vote(pollId, optionId);
    setPolls(updated);
    setLastUpdated(new Date());
  }

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-4xl animate-bounce">🐯</div>
        <p className="text-white/60 text-sm">Loading polls from Death Valley...</p>
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
            Updated{' '}
            {lastUpdated.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Polls */}
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
              votedOption={getMyVote(poll.id)}
              onVote={handleVote}
            />
          ))
        )}
      </div>

      <p className="text-center text-white/20 text-xs mt-6">
        Crowd votes update in real time · One vote per poll per session
      </p>
    </div>
  );
}
