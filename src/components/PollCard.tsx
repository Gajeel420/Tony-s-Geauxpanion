'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Poll, getOptionPercentage, getPollTotalVotes } from '@/lib/polls-client';

interface PollCardProps {
  poll: Poll;
  votedOption: string | null;
  onVote: (pollId: string, optionId: string) => void;
}

const TYPE_LABELS: Record<Poll['type'], string> = {
  opinion: 'Fan Vote',
  prediction: 'Prediction',
  trivia: 'Trivia',
  fun: 'Fun Poll',
};

const TYPE_COLORS: Record<Poll['type'], string> = {
  opinion: 'bg-red-700 text-white',
  prediction: 'bg-lsu-purple text-white',
  trivia: 'bg-amber-600 text-white',
  fun: 'bg-teal-700 text-white',
};

export default function PollCard({ poll, votedOption, onVote }: PollCardProps) {
  const [localVoted, setLocalVoted] = useState<string | null>(votedOption);
  const totalVotes = getPollTotalVotes(poll);
  const hasVoted = localVoted !== null;

  function handleVote(optionId: string) {
    if (hasVoted) return;
    setLocalVoted(optionId);
    onVote(poll.id, optionId);
  }

  return (
    <div className="rounded-2xl bg-lsu-purple border border-lsu-gold/20 overflow-hidden shadow-xl animate-slide-in">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-3xl">{poll.emoji || '📊'}</span>
          <span
            className={clsx(
              'text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full',
              TYPE_COLORS[poll.type]
            )}
          >
            {TYPE_LABELS[poll.type]}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg leading-snug">{poll.question}</h3>
        {poll.prize && (
          <div className="mt-2 flex items-center gap-1.5 text-lsu-gold text-sm">
            <span>🏆</span>
            <span>Prize: {poll.prize}</span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="px-5 pb-5 space-y-3">
        {poll.options.map((option) => {
          const pct = getOptionPercentage(poll, option.id);
          const isVotedFor = localVoted === option.id;
          const isCorrect = hasVoted && option.isCorrect === true;
          const isWrongVote = hasVoted && isVotedFor && option.isCorrect === false;
          const isLeading =
            hasVoted && option.votes === Math.max(...poll.options.map((o) => o.votes));

          return (
            <button
              key={option.id}
              disabled={hasVoted}
              onClick={() => handleVote(option.id)}
              className={clsx(
                'w-full text-left rounded-xl overflow-hidden relative transition-all duration-200',
                !hasVoted
                  ? 'hover:scale-[1.02] active:scale-[0.99] cursor-pointer'
                  : 'cursor-default',
                isVotedFor && 'ring-2 ring-lsu-gold',
                isCorrect && 'ring-2 ring-green-400'
              )}
            >
              {/* Animated progress bar */}
              {hasVoted && (
                <div
                  className={clsx(
                    'absolute inset-0 transition-all duration-700 ease-out',
                    isCorrect
                      ? 'bg-green-700/60'
                      : isWrongVote
                      ? 'bg-red-800/60'
                      : 'bg-lsu-purple-light/60'
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div
                className={clsx(
                  'relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors',
                  !hasVoted
                    ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-lsu-gold/50'
                    : isCorrect
                    ? 'bg-green-900/40 border-green-500/50'
                    : isWrongVote
                    ? 'bg-red-900/40 border-red-500/30'
                    : 'bg-white/5 border-white/10'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {hasVoted && isVotedFor && (
                    <span className="text-lsu-gold text-sm flex-shrink-0">▶</span>
                  )}
                  {hasVoted && isCorrect && (
                    <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                  )}
                  <span
                    className={clsx(
                      'text-sm font-medium truncate',
                      isCorrect ? 'text-green-300' : 'text-white'
                    )}
                  >
                    {option.text}
                  </span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLeading && <span className="text-lsu-gold text-xs">🔥</span>}
                    <span
                      className={clsx(
                        'text-sm font-bold',
                        isCorrect ? 'text-green-300' : 'text-lsu-gold'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between text-xs text-white/50">
        <span>{totalVotes.toLocaleString()} votes</span>
        {hasVoted && poll.type === 'trivia' && (
          <span className="text-lsu-gold/80">
            {poll.options.find((o) => o.id === localVoted)?.isCorrect
              ? '✓ Correct! Geaux Tigers!'
              : '✗ Not quite — study up!'}
          </span>
        )}
        {hasVoted && poll.type !== 'trivia' && (
          <span className="text-lsu-gold/80">Thanks for voting!</span>
        )}
      </div>
    </div>
  );
}
