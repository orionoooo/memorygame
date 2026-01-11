import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { getRandomWords, shuffleArray } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted } from '../../lib/storage'

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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Memory Cards
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Trò chơi ghép đôi
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Match Vietnamese words with their English translations
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
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

        <div className="text-center">
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
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Excellent! Tuyệt vời!
          </h1>

          <div className="text-6xl mb-6">🎉</div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              You matched all {pairCount} pairs!
            </p>
            <p className="text-xl text-gray-600">
              Moves: <span className="font-bold text-[#4a90a4]">{moves}</span>
            </p>
            <p className="text-xl text-gray-600">
              Time: <span className="font-bold text-[#4a90a4]">{timeTaken} seconds</span>
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setDifficulty(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/games/pattern-recall')}>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Memory Cards</h1>
          <p className="text-lg text-gray-500">Find matching pairs</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">Moves: <span className="font-bold text-[#4a90a4]">{moves}</span></p>
          <p className="text-lg text-gray-600">Matched: <span className="font-bold text-[#5cb85c]">{matched.length}/{cards.length / 2}</span></p>
        </div>
      </div>

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
                aspect-square rounded-xl text-xl font-semibold
                transition-all duration-300 transform
                ${isFlipped || isMatched
                  ? 'bg-white shadow-md'
                  : 'bg-[#4a90a4] hover:bg-[#357a8c] hover:scale-105 cursor-pointer'
                }
                ${isMatched ? 'bg-[#5cb85c]/20 border-2 border-[#5cb85c]' : ''}
                ${isFlipped && !isMatched ? 'ring-4 ring-[#4a90a4]' : ''}
                focus:outline-none focus:ring-4 focus:ring-[#4a90a4]/50
              `}
              aria-label={isFlipped || isMatched ? card.text : 'Hidden card'}
            >
              {(isFlipped || isMatched) ? (
                <div className="p-2">
                  <span className={`${card.lang === 'vi' ? 'text-[#4a90a4]' : 'text-[#2c3e50]'}`}>
                    {card.text}
                  </span>
                  <p className="text-sm text-gray-400 mt-1">
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

      {/* Always show option to stop */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/done')}
          className="bg-gray-100 hover:bg-[#5cb85c]/20 text-gray-600 hover:text-[#5cb85c] px-6 py-3 rounded-xl text-lg transition-all border-2 border-gray-200 hover:border-[#5cb85c]"
        >
          ✨ Done for today? / Xong rồi? ✨
        </button>
      </div>
    </div>
  )
}
