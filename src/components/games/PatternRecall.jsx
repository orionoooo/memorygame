import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Watch the colors light up and listen to their names.",
    vi: "Xem các màu sáng lên và nghe tên của chúng."
  },
  {
    en: "After the sequence finishes, tap the colors in the same order.",
    vi: "Sau khi chuỗi kết thúc, chạm vào các màu theo cùng thứ tự."
  },
  {
    en: "Each level adds one more color to remember.",
    vi: "Mỗi cấp độ thêm một màu nữa để nhớ."
  },
  {
    en: "Don't worry if you make a mistake - just try again!",
    vi: "Đừng lo nếu bạn nhầm - cứ thử lại!"
  }
]

const COLORS = [
  { name: 'red', bg: 'bg-red-600', activeBg: 'bg-red-300', vi: 'đỏ' },
  { name: 'blue', bg: 'bg-blue-600', activeBg: 'bg-blue-300', vi: 'xanh dương' },
  { name: 'green', bg: 'bg-green-600', activeBg: 'bg-green-300', vi: 'xanh lá' },
  { name: 'yellow', bg: 'bg-yellow-500', activeBg: 'bg-yellow-200', vi: 'vàng' },
]

// Speak a color name using text-to-speech
function speakColor(colorIndex) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const color = COLORS[colorIndex]
    const utterance = new SpeechSynthesisUtterance(color.vi)

    // Try to use Vietnamese voice if available, otherwise use default
    const voices = window.speechSynthesis.getVoices()
    const vietnameseVoice = voices.find(v => v.lang.startsWith('vi'))
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice
    }

    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.1 // Slightly higher pitch for friendliness
    utterance.volume = 1

    window.speechSynthesis.speak(utterance)
  }
}

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

  // Handle game completion - play sound and auto-advance
  useEffect(() => {
    if (gameState === 'complete') {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [gameState, navigate])

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
        const colorIndex = sequence[index]
        setActiveColor(colorIndex)
        setShowingIndex(index)

        // Speak the color name
        speakColor(colorIndex)

        setTimeout(() => {
          setActiveColor(null)
          index++
          setTimeout(showNext, 400) // Slightly longer pause between colors
        }, 900) // Slightly longer display to allow speech
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
    speakColor(colorIndex) // Speak the color when player clicks
    setTimeout(() => setActiveColor(null), 200)

    const newPlayerSequence = [...playerSequence, colorIndex]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1

    // Check if correct
    if (sequence[currentIndex] !== colorIndex) {
      // Wrong!
      playIncorrectSound()
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
      playCorrectSound()
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
        // Auto-advance to next level after correct sequence
        setTimeout(() => nextLevel(), 400)
      }
    }
  }

  if (gameState === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Pattern Recall
          </h1>
          <p className="text-xl text-indigo-600">
            Nhớ mẫu
          </p>
        </div>

        <Card className="space-y-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xl text-slate-600">
            Watch the color sequence, then repeat it!
          </p>
          <p className="text-lg text-slate-500">
            Xem chuỗi màu sắc, sau đó lặp lại!
          </p>
          <p className="text-base text-indigo-500">
            Listen to the colors being spoken aloud
          </p>

          <div className="flex justify-center gap-4 my-8">
            {COLORS.map((color, index) => (
              <div
                key={color.name}
                className={`w-16 h-16 rounded-xl ${color.bg} shadow-lg`}
              />
            ))}
          </div>

          <Button onClick={startGame} size="xlarge" className="w-full max-w-xs mx-auto">
            Start Game
            <br />
            <span className="text-xl">Bắt đầu</span>
          </Button>
        </Card>

        <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
        <Card className="text-center animate-slide-up">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Amazing!</span> Tuyệt vời!
          </h1>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 mb-6 space-y-4 border border-slate-100">
            <p className="text-2xl text-slate-700">
              You completed all 5 levels!
            </p>
            <p className="text-xl text-slate-600">
              Final Score: <span className="font-bold text-indigo-600">{score}</span>
            </p>
            <p className="text-xl text-slate-600">
              Highest Level: <span className="font-bold text-emerald-500">{highestLevel}</span>
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
      {/* Header with stats */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pattern Recall</h1>
          <p className="text-slate-500">Level {level} of 5</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{score}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{sequence.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Colors</p>
          </div>
        </div>
      </div>

      <Card className="py-12">
        <div className="text-center mb-8">
          {gameState === 'showing' && (
            <p className="text-2xl text-indigo-600 animate-pulse">
              Watch and listen... Xem và nghe nhé...
            </p>
          )}
          {gameState === 'input' && (
            <p className="text-2xl text-slate-800">
              Your turn! Đến lượt bạn!
              <br />
              <span className="text-lg text-slate-500">
                {playerSequence.length} / {sequence.length}
              </span>
            </p>
          )}
          {gameState === 'success' && (
            <p className="text-2xl text-emerald-500">
              Correct! Đúng rồi!
            </p>
          )}
          {gameState === 'fail' && (
            <p className="text-2xl text-red-500">
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


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Pattern Recall"
        gameTitleVi="Nhớ mẫu"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
