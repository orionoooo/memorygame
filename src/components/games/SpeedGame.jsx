import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from '../../lib/sounds'
import { getRandomCorrectMessage } from '../../data/encouragement'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Find the Different: Look at the items and tap the one that's different from the others.",
    vi: "Tìm cái khác: Nhìn các vật phẩm và chạm vào cái khác với những cái còn lại."
  },
  {
    en: "Quick Tap: Tap the button as fast as you can when it appears!",
    vi: "Chạm nhanh: Chạm vào nút nhanh nhất có thể khi nó xuất hiện!"
  },
  {
    en: "Matching: Find and tap the two items that are the same.",
    vi: "Ghép đôi: Tìm và chạm vào hai vật phẩm giống nhau."
  },
  {
    en: "These games help keep your mind sharp and quick!",
    vi: "Những trò chơi này giúp giữ tâm trí bạn nhanh nhạy!"
  }
]

const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠']
const ANIMALS = ['🐧', '🐱', '🐶', '🐰', '🐻', '🦊']
const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑']

export function SpeedGame() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null, 'findDifferent', 'reaction', 'matching'
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [gameData, setGameData] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [reactionStart, setReactionStart] = useState(null)
  const [times, setTimes] = useState([])
  const [gameComplete, setGameComplete] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const timeoutRef = useRef(null)
  const sessionId = useRef(null)

  const TOTAL_ROUNDS = 10

  // Save progress whenever round or score changes
  useEffect(() => {
    if (sessionId.current && round > 0) {
      updateGameSession(sessionId.current, 'speed-game', {
        score,
        completed: round,
        total: TOTAL_ROUNDS,
        mode,
        accuracy: Math.round((score / (round * 10)) * 100),
        isComplete: gameComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (gameComplete) {
        markGameCompleted('speed-game')
      }
    }
  }, [round, score, mode, gameComplete, startTime])

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

  // Find the Different Game
  const generateFindDifferent = useCallback(() => {
    const itemSets = [SHAPES, ANIMALS, FRUITS]
    const items = itemSets[Math.floor(Math.random() * itemSets.length)]
    const mainItem = items[Math.floor(Math.random() * items.length)]
    let differentItem = items[Math.floor(Math.random() * items.length)]
    while (differentItem === mainItem) {
      differentItem = items[Math.floor(Math.random() * items.length)]
    }

    const gridSize = 9 // 3x3 grid
    const differentPosition = Math.floor(Math.random() * gridSize)
    const grid = Array(gridSize).fill(mainItem)
    grid[differentPosition] = differentItem

    return {
      grid,
      correctIndex: differentPosition,
      mainItem,
      differentItem
    }
  }, [])

  // Reaction Time Game
  const startReactionRound = useCallback(() => {
    setIsWaiting(true)
    setGameData({ showTarget: false, tooEarly: false })

    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000
    timeoutRef.current = setTimeout(() => {
      setGameData({ showTarget: true, tooEarly: false })
      setReactionStart(Date.now())
      setIsWaiting(false)
    }, delay)
  }, [])

  // Matching Game
  const generateMatching = useCallback(() => {
    const itemSets = [SHAPES, ANIMALS, FRUITS]
    const items = itemSets[Math.floor(Math.random() * itemSets.length)]
    const targetItem = items[Math.floor(Math.random() * items.length)]

    // Create 4 options, one is correct
    const options = [targetItem]
    while (options.length < 4) {
      const randomItem = items[Math.floor(Math.random() * items.length)]
      if (!options.includes(randomItem)) {
        options.push(randomItem)
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

    return {
      target: targetItem,
      options,
      correctIndex: options.indexOf(targetItem)
    }
  }, [])

  const startGame = (selectedMode) => {
    sessionId.current = Date.now()
    setMode(selectedMode)
    setRound(1)
    setScore(0)
    setTimes([])
    setFeedback(null)
    setGameComplete(false)
    setStartTime(Date.now())

    if (selectedMode === 'findDifferent') {
      setGameData(generateFindDifferent())
    } else if (selectedMode === 'reaction') {
      startReactionRound()
    } else if (selectedMode === 'matching') {
      setGameData(generateMatching())
    }
  }

  const handleFindDifferentClick = (index) => {
    const isCorrect = index === gameData.correctIndex
    const responseTime = Date.now() - (reactionStart || startTime)

    if (isCorrect) {
      playCorrectSound()
      setScore(score + 1)
      setTimes([...times, responseTime])
      setFeedback({ correct: true, message: getRandomCorrectMessage() })
    } else {
      setFeedback({ correct: false, correctIndex: gameData.correctIndex })
    }

    setTimeout(() => nextRound(), 1500)
  }

  const handleReactionClick = () => {
    if (gameData?.showTarget) {
      playCorrectSound()
      const responseTime = Date.now() - reactionStart
      setTimes([...times, responseTime])
      setScore(score + 1)
      setFeedback({ correct: true, time: responseTime, message: getRandomCorrectMessage() })
      setTimeout(() => nextRound(), 1500)
    } else if (isWaiting) {
      // Clicked too early
      clearTimeout(timeoutRef.current)
      setIsWaiting(false)
      setGameData({ showTarget: false, tooEarly: true })
      setFeedback({ correct: false, tooEarly: true })
      setTimeout(() => nextRound(), 1500)
    }
  }

  const handleMatchingClick = (index) => {
    const isCorrect = index === gameData.correctIndex
    const responseTime = Date.now() - (reactionStart || startTime)

    if (isCorrect) {
      playCorrectSound()
      setScore(score + 1)
      setTimes([...times, responseTime])
      setFeedback({ correct: true, message: getRandomCorrectMessage() })
    } else {
      setFeedback({ correct: false, correctIndex: gameData.correctIndex })
    }

    setTimeout(() => nextRound(), 1500)
  }

  const nextRound = () => {
    setFeedback(null)

    if (round >= TOTAL_ROUNDS) {
      // Game complete - results are automatically saved by useEffect
      setGameComplete(true)
      return
    }

    setRound(round + 1)
    setReactionStart(Date.now())

    if (mode === 'findDifferent') {
      setGameData(generateFindDifferent())
    } else if (mode === 'reaction') {
      startReactionRound()
    } else if (mode === 'matching') {
      setGameData(generateMatching())
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Speed Games ⚡
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Trò chơi nhanh
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Quick and fun exercises to keep your mind sharp!
          </p>
          <p className="text-md text-gray-400 mt-2">
            Based on research shown to help brain health 🧠
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
            Choose a game:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('findDifferent')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">👀</span>
              Find the Different One
              <br />
              <span className="text-lg opacity-75">Tìm cái khác biệt</span>
            </Button>
            <Button onClick={() => startGame('reaction')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">🎯</span>
              Reaction Time
              <br />
              <span className="text-lg opacity-75">Phản xạ nhanh</span>
            </Button>
            <Button onClick={() => startGame('matching')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">🔍</span>
              Quick Match
              <br />
              <span className="text-lg opacity-75">Ghép nhanh</span>
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
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <div className="text-6xl mb-4">⚡🐧⚡</div>

          <h1 className="text-3xl font-bold text-[#5cb85c] mb-2">
            Quick thinking! Nhanh trí lắm!
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            Speed exercises help keep your brain young and sharp!
            <br />
            <span className="text-[#4a90a4]">Bài tập nhanh giúp não trẻ và nhạy bén!</span>
          </p>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-3">
            <p className="text-2xl">
              Score: <span className="font-bold text-[#4a90a4]">{score}/{TOTAL_ROUNDS}</span>
            </p>
            {avgTime > 0 && (
              <p className="text-xl text-gray-600">
                Average response: <span className="font-bold text-[#5cb85c]">{avgTime}ms</span>
              </p>
            )}
          </div>

          <p className="text-lg text-gray-500 mb-6">
            Every time you practice, your brain gets faster! 🧠✨
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setMode(null)}>
              Try Another Game
            </Button>
            <Button onClick={() => navigate('/done')} className="bg-[#5cb85c] hover:bg-[#4cae4c]">
              ✨ All Done for Today!
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
          <h1 className="text-2xl font-bold text-[#2c3e50]">
            {mode === 'findDifferent' && 'Find the Different One 👀'}
            {mode === 'reaction' && 'Reaction Time 🎯'}
            {mode === 'matching' && 'Quick Match 🔍'}
          </h1>
          <p className="text-lg text-gray-500">Take your time - speed comes with practice!</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">
            Round <span className="font-bold text-[#4a90a4]">{round}</span> of {TOTAL_ROUNDS}
          </p>
          <p className="text-lg text-gray-600">
            Score: <span className="font-bold text-[#5cb85c]">{score}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-[#4a90a4] h-3 rounded-full transition-all duration-300"
          style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }}
        />
      </div>

      {/* Find Different Game */}
      {mode === 'findDifferent' && gameData && (
        <Card className="py-8">
          <p className="text-center text-xl text-gray-600 mb-6">
            Tap the one that's different!
            <br />
            <span className="text-[#4a90a4]">Chạm vào cái khác biệt!</span>
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {gameData.grid.map((item, index) => (
              <button
                key={index}
                onClick={() => !feedback && handleFindDifferentClick(index)}
                disabled={!!feedback}
                className={`
                  text-5xl p-4 rounded-xl transition-all
                  ${feedback?.correctIndex === index ? 'bg-green-200 ring-4 ring-green-500' : ''}
                  ${feedback && !feedback.correct && index === gameData.correctIndex ? 'bg-blue-200 ring-4 ring-blue-500' : ''}
                  ${!feedback ? 'hover:bg-gray-100 hover:scale-110 cursor-pointer' : ''}
                  bg-white shadow-md
                `}
              >
                {item}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`text-center mt-6 p-4 rounded-xl ${feedback.correct ? 'bg-green-100' : 'bg-blue-100'}`}>
              {feedback.correct ? (
                <p className="text-xl text-[#5cb85c]">✓ {feedback.message?.en} {feedback.message?.vi}</p>
              ) : (
                <p className="text-xl text-[#4a90a4]">Good try! The different one is highlighted 👍</p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Reaction Time Game */}
      {mode === 'reaction' && (
        <Card className="py-8">
          <div className="text-center">
            {isWaiting && !gameData?.tooEarly && (
              <>
                <p className="text-xl text-gray-600 mb-6">
                  Wait for the penguin...
                  <br />
                  <span className="text-[#4a90a4]">Đợi chim cánh cụt...</span>
                </p>
                <div className="text-8xl opacity-30 my-12">⏳</div>
              </>
            )}

            {gameData?.showTarget && !feedback && (
              <>
                <p className="text-xl text-[#5cb85c] mb-6 animate-pulse">
                  TAP NOW! CHẠM NGAY!
                </p>
                <button
                  onClick={handleReactionClick}
                  className="text-9xl animate-bounce cursor-pointer hover:scale-110 transition-transform"
                >
                  🐧
                </button>
              </>
            )}

            {gameData?.tooEarly && (
              <>
                <p className="text-xl text-orange-500 mb-6">
                  Too early! Wait for the penguin 😊
                  <br />
                  <span className="text-gray-500">Sớm quá! Đợi chim cánh cụt nhé</span>
                </p>
                <div className="text-6xl my-8">🙈</div>
              </>
            )}

            {feedback?.correct && (
              <div className="bg-green-100 rounded-xl p-6">
                <p className="text-2xl text-[#5cb85c] mb-2">
                  ✓ {feedback.message?.en}!
                </p>
                <p className="text-xl text-gray-600">
                  Response time: <span className="font-bold">{feedback.time}ms</span>
                </p>
              </div>
            )}

            {!gameData?.showTarget && !isWaiting && !feedback && (
              <button
                onClick={handleReactionClick}
                className="w-full py-12 bg-gray-100 rounded-xl text-gray-400 text-xl"
              >
                Tap anywhere when you see the penguin!
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Matching Game */}
      {mode === 'matching' && gameData && (
        <Card className="py-8">
          <p className="text-center text-xl text-gray-600 mb-4">
            Find the matching one!
            <br />
            <span className="text-[#4a90a4]">Tìm cái giống nhau!</span>
          </p>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-500 mb-2">Find this:</p>
            <span className="text-7xl">{gameData.target}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {gameData.options.map((item, index) => (
              <button
                key={index}
                onClick={() => !feedback && handleMatchingClick(index)}
                disabled={!!feedback}
                className={`
                  text-5xl p-6 rounded-xl transition-all
                  ${feedback?.correct && index === gameData.correctIndex ? 'bg-green-200 ring-4 ring-green-500' : ''}
                  ${feedback && !feedback.correct && index === gameData.correctIndex ? 'bg-blue-200 ring-4 ring-blue-500' : ''}
                  ${!feedback ? 'hover:bg-gray-100 hover:scale-105 cursor-pointer' : ''}
                  bg-white shadow-md
                `}
              >
                {item}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`text-center mt-6 p-4 rounded-xl ${feedback.correct ? 'bg-green-100' : 'bg-blue-100'}`}>
              {feedback.correct ? (
                <p className="text-xl text-[#5cb85c]">✓ {feedback.message?.en} {feedback.message?.vi}</p>
              ) : (
                <p className="text-xl text-[#4a90a4]">Good try! The match is highlighted 👍</p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Always show option to stop */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/done')}
          className="bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 px-6 py-3 rounded-xl text-lg transition-all border-2 border-slate-200 hover:border-emerald-400 shadow-sm"
        >
          Done for today? / Xong rồi?
        </button>
      </div>

      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Speed Games"
        gameTitleVi="Trò chơi nhanh"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
