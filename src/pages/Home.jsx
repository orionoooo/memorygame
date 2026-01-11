import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { getTodayTheme, getRandomPenguinMessage } from '../data/themes'
import { getNextGamePath, getTodayProgress } from '../lib/storage'

const exercises = [
  {
    id: 'date-check',
    title: 'What Day Is It?',
    titleVi: 'Hôm nay là ngày mấy?',
    description: 'Practice remembering today\'s date',
    icon: '📅',
    path: '/games/date-check'
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    titleVi: 'Trò chơi ghép đôi',
    description: 'Match Vietnamese and English word pairs',
    icon: '🃏',
    path: '/games/memory-cards'
  },
  {
    id: 'pattern-recall',
    title: 'Pattern Recall',
    titleVi: 'Nhớ mẫu',
    description: 'Remember and repeat color sequences',
    icon: '🎨',
    path: '/games/pattern-recall'
  },
  {
    id: 'translation',
    title: 'Translation Practice',
    titleVi: 'Luyện dịch',
    description: 'Translate between Vietnamese and English',
    icon: '🔤',
    path: '/games/translation'
  },
  {
    id: 'word-puzzle',
    title: 'Word Puzzles',
    titleVi: 'Đố chữ',
    description: 'Unscramble words and fill in letters',
    icon: '🧩',
    path: '/games/word-puzzle'
  },
  {
    id: 'typing',
    title: 'Typing Practice',
    titleVi: 'Luyện đánh máy',
    description: 'Learn to type letters, words, and phrases',
    icon: '⌨️',
    path: '/games/typing'
  },
  {
    id: 'math',
    title: 'Math Games',
    titleVi: 'Trò chơi toán học',
    description: 'Simple math, counting money, and number patterns',
    icon: '🔢',
    path: '/games/math'
  },
  {
    id: 'speed',
    title: 'Speed Games',
    titleVi: 'Trò chơi nhanh',
    description: 'Quick thinking and reaction games',
    icon: '⚡',
    path: '/games/speed'
  }
]

export function Home() {
  const theme = getTodayTheme()
  const penguinMsg = getRandomPenguinMessage()
  const nextGamePath = getNextGamePath()
  const progress = getTodayProgress()

  return (
    <div className="space-y-8">
      {/* Penguin welcome with daily theme */}
      <div className="text-center">
        <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
          🐧
        </div>
        <h1 className="text-4xl font-bold text-[#2c3e50] mb-2">
          {theme.greeting}
        </h1>
        <p className="text-2xl text-[#4a90a4] mb-4">
          {theme.greetingVi}
        </p>
        <p className="text-xl text-gray-600">
          Play any game you like, for as long as you want.
        </p>
        <p className="text-lg text-[#4a90a4] mt-1">
          Chơi bất kỳ trò nào mẹ thích, bao lâu cũng được.
        </p>
        <p className="text-lg text-gray-500 mt-4">
          There's no right or wrong - just have fun! {theme.decoration}
        </p>
      </div>

      {/* Start Playing button */}
      <div className="text-center">
        <Link to={nextGamePath}>
          <Button size="large" className="text-2xl px-12 py-6">
            {progress.completedCount === 0 ? (
              <>
                🎮 Start Playing!
                <br />
                <span className="text-lg opacity-90">Bắt đầu chơi!</span>
              </>
            ) : progress.isComplete ? (
              <>
                🎉 See Today's Results!
                <br />
                <span className="text-lg opacity-90">Xem kết quả hôm nay!</span>
              </>
            ) : (
              <>
                🎮 Continue Playing!
                <br />
                <span className="text-lg opacity-90">Tiếp tục chơi! ({progress.completedCount}/{progress.totalGames})</span>
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Games list */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6 text-center">
          Pick any game to play:
        </h2>
        <div className="grid gap-4">
          {exercises.map((exercise) => (
            <Link key={exercise.id} to={exercise.path}>
              <Card hoverable padding="medium" className="flex items-center gap-6">
                <span className="text-5xl" role="img" aria-hidden="true">
                  {exercise.icon}
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-[#2c3e50]">
                    {exercise.title}
                  </h3>
                  <p className="text-lg text-[#4a90a4]">{exercise.titleVi}</p>
                  <p className="text-lg text-gray-500">{exercise.description}</p>
                </div>
                <span className="text-3xl">→</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom encouragement with penguin message */}
      <div className="text-center py-6">
        <div className="text-4xl mb-2">{penguinMsg.emoji}</div>
        <p className="text-xl text-[#4a90a4]">
          {penguinMsg.en}
        </p>
        <p className="text-lg text-gray-500">
          {penguinMsg.vi}
        </p>
      </div>
    </div>
  )
}
