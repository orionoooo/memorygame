import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Confetti } from '../ui/Confetti'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { HelpButton } from '../ui/HelpButton'
import { getRandomWords, shuffleArray } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Tap any card to flip it over and see the word.",
    vi: "Chạm vào thẻ bất kỳ để lật và xem từ."
  },
  {
    en: "Try to find the matching pair - one Vietnamese word and one English word that mean the same thing.",
    vi: "Tìm cặp phù hợp - một từ tiếng Việt và một từ tiếng Anh có cùng nghĩa."
  },
  {
    en: "If the cards match, they stay face up. If not, they flip back over.",
    vi: "Nếu các thẻ khớp nhau, chúng sẽ giữ nguyên. Nếu không, chúng sẽ lật lại."
  },
  {
    en: "Match all the pairs to win! Take your time - there's no rush.",
    vi: "Ghép tất cả các cặp để chiến thắng! Từ từ thôi - không cần vội."
  }
]

export function MemoryCards() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState(null) // null, 'easy', 'medium', 'hard'
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const sessionId = useRef(null)

  const pairCounts = { easy: 4, medium: 6, hard: 8 }

  // Save progress whenever matches change
  useEffect(() => {
    if (difficulty && matched.length > 0) {
      const totalPairs = pairCounts[difficulty]
      const isComplete = matched.length === totalPairs
      const score = Math.max(100 - (moves * 2), 50) * (matched.length / totalPairs)

      updateGameSession(sessionId.current, 'memory-cards', {
        score: Math.round(score),
        completed: matched.length,
        total: totalPairs,
        difficulty,
        moves,
        accuracy: Math.round((matched.length / Math.max(moves, 1)) * 100),
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('memory-cards')
      }
    }
  }, [matched, moves, difficulty, startTime])

  // Handle game completion - play sound and auto-advance
  useEffect(() => {
    if (gameComplete) {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [gameComplete, navigate])

  const startGame = (level) => {
    setDifficulty(level)
    sessionId.current = Date.now() // Create new session
    const pairCount = pairCounts[level]
    const words = getRandomWords(pairCount)

    // Create pairs: one card with Vietnamese, one with English
    const cardPairs = words.flatMap((word, index) => [
      { id: `${index}-vi`, pairId: index, text: word.vi, lang: 'vi', word },
      { id: `${index}-en`, pairId: index, text: word.en, lang: 'en', word }
    ])

    setCards(shuffleArray(cardPairs))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setStartTime(Date.now())
    setGameComplete(false)
  }

  const handleCardClick = (card) => {
    // Don't allow clicking if already flipped or matched
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.pairId)) {
      return
    }

    const newFlipped = [...flipped, card.id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)

      const [firstId, secondId] = newFlipped
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)

      if (firstCard.pairId === secondCard.pairId) {
        // Match found!
        playCorrectSound()
        const newMatched = [...matched, firstCard.pairId]
        setMatched(newMatched)
        setFlipped([])

        // Check if game is complete
        if (newMatched.length === cards.length / 2) {
          setEndTime(Date.now())
          setGameComplete(true)
          // Results are automatically saved by the useEffect
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([])
        }, 1500)
      }
    }
  }

  const getTimeElapsed = () => {
    if (!startTime) return 0
    const end = endTime || Date.now()
    return Math.round((end - startTime) / 1000)
  }

  if (!difficulty) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Memory Cards
          </h1>
          <p className="text-xl text-indigo-600">
            Trò chơi ghép đôi
          </p>
          <p className="text-lg text-slate-500 mt-4">
            Match Vietnamese words with their English translations
          </p>
        </div>

        <Card className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-semibold text-center text-slate-800">
            Choose difficulty:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('easy')} className="w-full" variant="secondary">
              Easy - 4 pairs (8 cards)
              <br />
              <span className="text-lg opacity-75">Dễ - 4 cặp</span>
            </Button>
            <Button onClick={() => startGame('medium')} className="w-full" variant="secondary">
              Medium - 6 pairs (12 cards)
              <br />
              <span className="text-lg opacity-75">Trung bình - 6 cặp</span>
            </Button>
            <Button onClick={() => startGame('hard')} className="w-full" variant="secondary">
              Hard - 8 pairs (16 cards)
              <br />
              <span className="text-lg opacity-75">Khó - 8 cặp</span>
            </Button>
          </div>
        </Card>

        <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back Home
          </Button>
        </div>
      </div>
    )
  }

  if (gameComplete) {
    const timeTaken = getTimeElapsed()
    const pairCount = cards.length / 2

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Confetti />

        <Card className="text-center animate-slide-up" variant="gradient">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Excellent!</span>
          </h1>
          <p className="text-2xl text-indigo-500 mb-6">Tuyệt vời!</p>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 mb-6 space-y-4 border border-slate-100">
            <p className="text-2xl text-slate-700">
              You matched all <span className="font-bold text-emerald-500">{pairCount}</span> pairs!
            </p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-600">
                  <AnimatedNumber value={moves} duration={600} />
                </p>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Moves</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-600">
                  <AnimatedNumber value={timeTaken} duration={600} suffix="s" />
                </p>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Time</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setDifficulty(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/games/pattern-recall')} glow>
              Next Exercise →
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const gridCols = difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Memory Cards</h1>
          <p className="text-slate-500">Find matching pairs</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{moves}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Moves</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">{matched.length}/{cards.length / 2}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Matched</p>
          </div>
        </div>
      </div>

      {/* Game grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id)
          const isMatched = matched.includes(card.pairId)

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched}
              className={`
                aspect-square rounded-2xl text-xl font-semibold
                transition-all duration-300 transform
                ${isFlipped || isMatched
                  ? 'bg-white shadow-lg'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105 cursor-pointer shadow-lg shadow-indigo-500/20'
                }
                ${isMatched ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400' : ''}
                ${isFlipped && !isMatched ? 'ring-4 ring-indigo-400' : ''}
                focus:outline-none focus:ring-4 focus:ring-indigo-400/50
              `}
              aria-label={isFlipped || isMatched ? card.text : 'Hidden card'}
            >
              {(isFlipped || isMatched) ? (
                <div className="p-2">
                  <span className={`${card.lang === 'vi' ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {card.text}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">
                    {card.lang === 'vi' ? 'Vietnamese' : 'English'}
                  </p>
                </div>
              ) : (
                <span className="text-white text-3xl">?</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="text-center">
        <Button variant="secondary" onClick={() => setDifficulty(null)}>
          Restart Game
        </Button>
      </div>


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Memory Cards"
        gameTitleVi="Trò chơi ghép đôi"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
