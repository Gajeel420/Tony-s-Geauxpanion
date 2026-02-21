/**
 * Client-side poll management using localStorage.
 * Polls are seeded on first load and votes accumulate locally.
 * A simulated "crowd" effect incrementally adds votes to make it feel live.
 */

export type PollType = 'opinion' | 'prediction' | 'trivia' | 'fun';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean;
}

export interface Poll {
  id: string;
  question: string;
  type: PollType;
  options: PollOption[];
  isActive: boolean;
  createdAt: string;
  prize?: string;
  emoji?: string;
}

const STORAGE_KEY = 'lsu-polls-v2';

const SEED_POLLS: Poll[] = [
  {
    id: 'poll-oc-fire',
    question: 'Should Coach Kelly fire the Offensive Coordinator?',
    type: 'opinion',
    emoji: '🔥',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'oc-yes', text: 'Yes — this offense is embarrassing!', votes: 142 },
      { id: 'oc-no', text: 'No — give him more time', votes: 87 },
      { id: 'oc-scheme', text: 'Keep him, change the scheme', votes: 63 },
    ],
  },
  {
    id: 'poll-mvp',
    question: "Who will be LSU's MVP tonight?",
    type: 'prediction',
    emoji: '⭐',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'mvp-qb', text: '🏈 The Quarterback', votes: 198 },
      { id: 'mvp-rb', text: '🏃 The Running Back', votes: 134 },
      { id: 'mvp-wr', text: '🙌 A Wide Receiver', votes: 112 },
      { id: 'mvp-def', text: '🛡️ The Defense', votes: 89 },
    ],
  },
  {
    id: 'poll-trivia-championships',
    question: 'TRIVIA: How many national championships has LSU football won?',
    type: 'trivia',
    emoji: '🏆',
    prize: 'Tiger Pride Badge',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'champ-3', text: '3 championships', votes: 24, isCorrect: false },
      { id: 'champ-4', text: '4 championships', votes: 51, isCorrect: false },
      { id: 'champ-5', text: '5 championships', votes: 203, isCorrect: true },
      { id: 'champ-6', text: '6 championships', votes: 18, isCorrect: false },
    ],
  },
  {
    id: 'poll-game-prediction',
    question: "What's your game prediction?",
    type: 'prediction',
    emoji: '🔮',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'pred-big-w', text: '🐯 Tigers win big (14+ pts)', votes: 287 },
      { id: 'pred-close-w', text: '🎯 Tigers win close (1–13 pts)', votes: 156 },
      { id: 'pred-ot', text: '⚡ Goes to overtime', votes: 94 },
      { id: 'pred-upset', text: '😱 Upset alert — rivals win', votes: 22 },
    ],
  },
  {
    id: 'poll-tailgate-food',
    question: 'Best tailgate food at Death Valley?',
    type: 'fun',
    emoji: '🍺',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'food-boudin', text: '🌭 Boudin balls', votes: 312 },
      { id: 'food-crawfish', text: '🦞 Crawfish étouffée', votes: 178 },
      { id: 'food-jambalaya', text: '🍲 Jambalaya', votes: 234 },
      { id: 'food-gumbo', text: '🥣 Gumbo', votes: 189 },
    ],
  },
  {
    id: 'poll-trivia-capacity',
    question: "TRIVIA: What is Tiger Stadium's seating capacity?",
    type: 'trivia',
    emoji: '🏟️',
    prize: 'Stadium Expert Badge',
    isActive: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: 'cap-87k', text: '87,000', votes: 34, isCorrect: false },
      { id: 'cap-95k', text: '95,000', votes: 67, isCorrect: false },
      { id: 'cap-102k', text: '102,321', votes: 189, isCorrect: true },
      { id: 'cap-110k', text: '110,000', votes: 29, isCorrect: false },
    ],
  },
];

function loadPolls(): Poll[] {
  if (typeof window === 'undefined') return SEED_POLLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePolls(SEED_POLLS);
      return SEED_POLLS;
    }
    return JSON.parse(raw) as Poll[];
  } catch {
    return SEED_POLLS;
  }
}

function savePolls(polls: Poll[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  } catch {
    // Storage full — ignore
  }
}

export function getPolls(): Poll[] {
  return loadPolls().filter((p) => p.isActive);
}

export function vote(pollId: string, optionId: string): Poll[] {
  const polls = loadPolls();
  const updated = polls.map((poll) => {
    if (poll.id !== pollId) return poll;
    return {
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    };
  });
  savePolls(updated);
  return updated.filter((p) => p.isActive);
}

/**
 * Simulate crowd activity: randomly add 1–3 votes to a random option
 * across polls. Call this on a timer to make polls feel live.
 */
export function simulateCrowdVote(): Poll[] {
  const polls = loadPolls();
  const activePoll = polls[Math.floor(Math.random() * polls.length)];
  if (!activePoll) return polls.filter((p) => p.isActive);

  const option = activePoll.options[Math.floor(Math.random() * activePoll.options.length)];
  const delta = Math.floor(Math.random() * 4) + 1; // 1–4 votes

  const updated = polls.map((poll) => {
    if (poll.id !== activePoll.id) return poll;
    return {
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === option.id ? { ...opt, votes: opt.votes + delta } : opt
      ),
    };
  });
  savePolls(updated);
  return updated.filter((p) => p.isActive);
}

export function getPollTotalVotes(poll: Poll): number {
  return poll.options.reduce((sum, o) => sum + o.votes, 0);
}

export function getOptionPercentage(poll: Poll, optionId: string): number {
  const total = getPollTotalVotes(poll);
  if (total === 0) return 0;
  const option = poll.options.find((o) => o.id === optionId);
  if (!option) return 0;
  return Math.round((option.votes / total) * 100);
}

const VOTE_KEY = (pollId: string) => `lsu-vote-${pollId}`;

export function getMyVote(pollId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(VOTE_KEY(pollId));
}

export function saveMyVote(pollId: string, optionId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOTE_KEY(pollId), optionId);
}
