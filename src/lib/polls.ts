export type PollType = 'opinion' | 'prediction' | 'trivia' | 'fun';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean; // for trivia polls
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

// In-memory poll store (module-level singleton)
// In production this would be Redis or a database
const pollStore = new Map<string, Poll>();

function createPoll(poll: Omit<Poll, 'createdAt'>): Poll {
  const fullPoll: Poll = { ...poll, createdAt: new Date().toISOString() };
  pollStore.set(fullPoll.id, fullPoll);
  return fullPoll;
}

// Seed with game-day polls
function seedPolls() {
  const seededPolls: Omit<Poll, 'createdAt'>[] = [
    {
      id: 'poll-oc-fire',
      question: 'Should Coach Kelly fire the Offensive Coordinator?',
      type: 'opinion',
      emoji: '🔥',
      isActive: true,
      options: [
        { id: 'oc-yes', text: 'Yes — this offense is embarrassing!', votes: 142 },
        { id: 'oc-no', text: 'No — give him more time', votes: 87 },
        { id: 'oc-scheme', text: 'Keep him, change the scheme', votes: 63 },
      ],
    },
    {
      id: 'poll-mvp',
      question: 'Who will be LSU\'s MVP tonight?',
      type: 'prediction',
      emoji: '⭐',
      isActive: true,
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
      options: [
        { id: 'champ-3', text: '3 championships', votes: 24, isCorrect: false },
        { id: 'champ-4', text: '4 championships', votes: 51, isCorrect: false },
        { id: 'champ-5', text: '5 championships', votes: 203, isCorrect: true },
        { id: 'champ-6', text: '6 championships', votes: 18, isCorrect: false },
      ],
    },
    {
      id: 'poll-game-prediction',
      question: 'What\'s your game prediction?',
      type: 'prediction',
      emoji: '🔮',
      isActive: true,
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
      options: [
        { id: 'food-boudin', text: '🌭 Boudin balls', votes: 312 },
        { id: 'food-crawfish', text: '🦞 Crawfish étouffée', votes: 178 },
        { id: 'food-jambalaya', text: '🍲 Jambalaya', votes: 234 },
        { id: 'food-gumbo', text: '🥣 Gumbo', votes: 189 },
      ],
    },
    {
      id: 'poll-trivia-capacity',
      question: 'TRIVIA: What is Tiger Stadium\'s seating capacity?',
      type: 'trivia',
      emoji: '🏟️',
      prize: 'Stadium Expert Badge',
      isActive: true,
      options: [
        { id: 'cap-87k', text: '87,000', votes: 34, isCorrect: false },
        { id: 'cap-95k', text: '95,000', votes: 67, isCorrect: false },
        { id: 'cap-102k', text: '102,321', votes: 189, isCorrect: true },
        { id: 'cap-110k', text: '110,000', votes: 29, isCorrect: false },
      ],
    },
  ];

  for (const poll of seededPolls) {
    if (!pollStore.has(poll.id)) {
      createPoll(poll);
    }
  }
}

// Initialize seed data
seedPolls();

export function getAllPolls(): Poll[] {
  return Array.from(pollStore.values()).filter((p) => p.isActive);
}

export function getPoll(id: string): Poll | undefined {
  return pollStore.get(id);
}

export function voteOnPoll(
  pollId: string,
  optionId: string
): { success: boolean; poll?: Poll; error?: string } {
  const poll = pollStore.get(pollId);
  if (!poll) return { success: false, error: 'Poll not found' };

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) return { success: false, error: 'Option not found' };

  option.votes += 1;
  pollStore.set(pollId, poll);

  return { success: true, poll };
}

export function addPoll(
  data: Omit<Poll, 'id' | 'createdAt'>
): Poll {
  const id = `poll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return createPoll({ ...data, id });
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
