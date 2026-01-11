import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { updateGameSession, markGameCompleted } from '../../lib/storage'

const COLORS = [
  { name: 'red', bg: 'bg-red-600', activeBg: 'bg-red-300', vi: 'đỏ' },
  { name: 'blue', bg: 'bg-blue-600', activeBg: 'bg-blue-300', vi: 'xanh dương' },
  { name: 'green', bg: 'bg-green-600', activeBg: 'bg-green-300', vi: 'xanh lá' },
  { name: 'yellow', bg: 'bg-yellow-500', activeBg: 'bg-yellow-200', vi: 'vàng' },
]

export function PatternRecall() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('ready') // 'ready', 'showing', 'input', 'success', 'fail', 'complete'
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [activeColor, setActiveColor] = useState(null)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [highestLevel, setHighestLevel] = useState(0)
  const [showingIndex, setShowingIndex] = useState(-1)
  const [startTime, setStartTime] = useState(null)
  const sessionId = useRef(null)

  // Save progress whenever level or score changes
  useEffect(() => {
    if (sessionId.current && startTime) {
      const isComplete = gameState === 'complete'
      updateGameSession(sessionId.current, 'pattern-recall', {
        score,
        completed: level - 1,
        total: 5,
        highestLevel: Math.max(highestLevel, level),
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('pattern-recall')
      }
    }
  }, [level, score, highestLevel, gameState, startTime])

  const generateSequence = useCallback((length) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4))
  }, [])

  const startGame = () => {
    sessionId.current = Date.now()
    const newSequence = generateSequence(3)
    setSequence(newSequence)
    setPlayerSequence([])
    setLevel(1)
    setScore(0)
    setHighestLevel(0)
    setStartTime(Date.now())
    setGameState('showing')
  }

  const nextLevel = () => {
    const newLength = 3 + level
    const newSequence = generateSequence(newLength)
    setSequence(newSequence)
    setPlayerSequence([])
    setLevel(level + 1)
    setGameState('showing')
  }

  // Show the sequence
  useEffect(() => {
    if (gameState !== 'showing') return

    let index = 0
    setShowingIndex(-1)

    const showNext = () => {
      if (index < sequence.length) {
        setActiveColor(sequence[index])
        setShowingIndex(index)

        setTimeout(() => {
          setActiveColor(null)
          index++
          setTimeout(showNext, 300)
        }, 800)
      } else {
        setShowingIndex(-1)
        setGameState('input')
      }
    }

    // Wait a moment before starting
    setTimeout(showNext, 1000)
  }, [gameState, sequence])

  const handleColorClick = (colorIndex) => {
    if (gameState !== 'input') return

    setActiveColor(colorIndex)
    setTimeout(() => setActiveColor(null), 200)

    const newPlayerSequence = [...playerSequence, colorIndex]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1

    // Check if correct
    if (sequence[currentIndex] !== colorIndex) {
      // Wrong!
      setHighestLevel(Math.max(highestLevel, level))
      if (level >= 5) {
        // Complete after reaching level 5
        const finalScore = score + (level * 10)
        setScore(finalScore)
        setGameState('complete')
        // Results are automatically saved by useEffect
      } else {
        setGameState('fail')
      }
      return
    }

    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      const levelScore = level * 10
      setScore(score + levelScore)
      setHighestLevel(Math.max(highestLevel, level))

      if (level >= 5) {
        // Game complete!
        const finalScore = score + levelScore
        setGameState('complete')
        // Results are automatically saved by useEffect
      } else {
        setGameState('success')
      }
    }
  }

  if (gameState === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Pattern Recall
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Nhớ mẫu
          </p>
        </div>

        <Card className="space-y-6 text-center">
          <p className="text-xl text-gray-600">
            Watch the color sequence, then repeat it!
          </p>
          <p className="text-lg text-gray-500">
            Xem chuỗi màu sắc, sau đó lặp lại!
          </p>

          <div className="flex justify-center gap-4 my-8">
            {COLORS.map((color, index) => (
              <div
                key={color.name}
                className={`w-16 h-16 rounded-xl ${color.bg}`}
              />
            ))}
          </div>

          <Button onClick={startGame} size="xlarge" className="w-full max-w-xs mx-auto">
            Start Game
            <br />
            <span className="text-xl">Bắt đầu</span>
          </Button>
        </Card>

        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back Home
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === 'complete') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Amazing! Tuyệt vời!
          </h1>

          <div className="text-6xl mb-6">🏆</div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              You completed all 5 levels!
            </p>
            <p className="text-xl text-gray-600">
              Final Score: <span className="font-bold text-[#4a90a4]">{score}</span>
            </p>
            <p className="text-xl text-gray-600">
              Highest Level: <span className="font-bold text-[#5cb85c]">{highestLevel}</span>
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={startGame}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/games/translation')}>
              Next Exercise →
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Pattern Recall</h1>
          <p className="text-lg text-gray-500">Level {level} of 5</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">Score: <span className="font-bold text-[#4a90a4]">{score}</span></p>
          <p className="text-lg text-gray-600">Sequence: <span className="font-bold">{sequence.length} colors</span></p>
        </div>
      </div>

      <Card className="py-12">
        <div className="text-center mb-8">
          {gameState === 'showing' && (
            <p className="text-2xl text-[#4a90a4] animate-pulse">
              Watch carefully... Xem kỹ nhé...
            </p>
          )}
          {gameState === 'input' && (
            <p className="text-2xl text-[#2c3e50]">
              Your turn! Đến lượt bạn!
              <br />
              <span className="text-lg text-gray-500">
                {playerSequence.length} / {sequence.length}
              </span>
            </p>
          )}
          {gameState === 'success' && (
            <p className="text-2xl text-[#5cb85c]">
              Correct! Đúng rồi! 🎉
            </p>
          )}
          {gameState === 'fail' && (
            <p className="text-2xl text-[#d9534f]">
              Not quite! Chưa đúng!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          {COLORS.map((color, index) => (
            <button
              key={color.name}
              onClick={() => handleColorClick(index)}
              disabled={gameState !== 'input'}
              className={`
                aspect-square rounded-2xl text-white text-2xl font-bold
                transition-all duration-150 transform
                ${activeColor === index
                  ? color.activeBg + ' scale-125 ring-8 ring-white'
                  : color.bg}
                ${gameState === 'input' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                ${gameState === 'showing' && activeColor !== index ? 'opacity-40' : ''}
                focus:outline-none
              `}
              style={{
                boxShadow: activeColor === index
                  ? '0 0 60px 20px rgba(255,255,255,0.8), 0 0 100px 40px rgba(255,255,255,0.4)'
                  : '0 4px 6px rgba(0,0,0,0.2)'
              }}
            >
              <span className="drop-shadow-lg">{color.vi}</span>
            </button>
          ))}
        </div>
      </Card>

      {(gameState === 'success' || gameState === 'fail') && (
        <div className="text-center space-y-4">
          {gameState === 'success' && (
            <Button onClick={nextLevel} size="large">
              Next Level →
            </Button>
          )}
          {gameState === 'fail' && (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                The correct sequence was: {sequence.map(i => COLORS[i].vi).join(' → ')}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" onClick={startGame}>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/games/translation')}>
                  Next Exercise →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
