import { Link, useNavigate } from 'react-router-dom'
import { GameTile, HeroButton, SectionHeader } from '../components/ui/GameTile'
import { getTimeBasedGreeting } from '../data/themes'
import { getNextGamePath, getTodayProgress } from '../lib/storage'

// Game data with gradient colors and icons
const games = [
  {
    id: 'date-check',
    title: 'What Day Is It?',
    titleVi: 'Hôm nay là ngày mấy?',
    description: 'Practice remembering today\'s date',
    icon: 'calendar',
    gradient: 'focus',
    path: '/games/date-check'
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    titleVi: 'Trò chơi ghép đôi',
    description: 'Match Vietnamese and English pairs',
    icon: 'cards',
    gradient: 'memory',
    path: '/games/memory-cards'
  },
  {
    id: 'pattern-recall',
    title: 'Pattern Recall',
    titleVi: 'Nhớ mẫu',
    description: 'Remember and repeat sequences',
    icon: 'pattern',
    gradient: 'pattern',
    path: '/games/pattern-recall'
  },
  {
    id: 'translation',
    title: 'Translation',
    titleVi: 'Luyện dịch',
    description: 'Translate between languages',
    icon: 'translate',
    gradient: 'language',
    path: '/games/translation'
  },
  {
    id: 'word-puzzle',
    title: 'Word Puzzles',
    titleVi: 'Đố chữ',
    description: 'Unscramble and complete words',
    icon: 'puzzle',
    gradient: 'logic',
    path: '/games/word-puzzle'
  },
  {
    id: 'typing',
    title: 'Typing Practice',
    titleVi: 'Luyện đánh máy',
    description: 'Learn to type letters and words',
    icon: 'keyboard',
    gradient: 'typing',
    path: '/games/typing'
  },
  {
    id: 'math',
    title: 'Math Games',
    titleVi: 'Trò chơi toán học',
    description: 'Simple math and number patterns',
    icon: 'math',
    gradient: 'math',
    path: '/games/math'
  },
  {
    id: 'speed',
    title: 'Speed Games',
    titleVi: 'Trò chơi nhanh',
    description: 'Quick thinking challenges',
    icon: 'speed',
    gradient: 'speed',
    path: '/games/speed'
  }
]

export function Home() {
  const navigate = useNavigate()
  const timeGreeting = getTimeBasedGreeting()
  const nextGamePath = getNextGamePath()
  const progress = getTodayProgress()

  const progressPercent = progress.totalGames > 0
    ? Math.round((progress.completedCount / progress.totalGames) * 100)
    : 0

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <div className="text-center pt-4 animate-slide-up">
        {/* Greeting */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
          {timeGreeting.en}
        </h1>
        <p className="text-2xl text-indigo-600 font-semibold mb-6">
          {timeGreeting.vi}
        </p>

        {/* Subtitle */}
        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
          Play any game you like, for as long as you want.
          <br />
          <span className="text-indigo-500">
            Chơi bất kỳ trò nào mẹ thích, bao lâu cũng được.
          </span>
        </p>
      </div>

      {/* Progress Card (if started) */}
      {progress.completedCount > 0 && !progress.isComplete && (
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 px-8 py-5 flex items-center gap-6">
            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 1.76} 176`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-700">{progressPercent}%</span>
              </div>
            </div>

            {/* Progress text */}
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {progress.completedCount} of {progress.totalGames} games
              </p>
              <p className="text-sm text-slate-500">Keep going, you're doing great!</p>
            </div>
          </div>
        </div>
      )}

      {/* Main CTA */}
      <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <HeroButton onClick={() => navigate(nextGamePath)}>
          {progress.completedCount === 0 ? (
            <span className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Playing
            </span>
          ) : progress.isComplete ? (
            <span className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See Results
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Continue
            </span>
          )}
        </HeroButton>
      </div>

      {/* Games Grid */}
      <div>
        <SectionHeader
          title="Choose a Game"
          subtitle="Pick any game to play"
          className="mb-6"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {games.map((game, index) => (
            <Link key={game.id} to={game.path} className="block">
              <div
                className="animate-slide-up"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <GameTile
                  title={game.title}
                  titleVi={game.titleVi}
                  description={game.description}
                  icon={game.icon}
                  gradient={game.gradient}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Encouragement Footer */}
      <div className="text-center pt-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <p className="text-slate-500 text-lg">
          There's no right or wrong — just have fun!
        </p>
        <p className="text-indigo-500 text-base mt-1">
          Không có đúng sai — chỉ cần vui thôi!
        </p>
      </div>
    </div>
  )
}
