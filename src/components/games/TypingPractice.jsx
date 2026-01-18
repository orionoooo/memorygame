import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { getRandomWords } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Look at the letter or word shown on screen.",
    vi: "Nhìn vào chữ cái hoặc từ hiển thị trên màn hình."
  },
  {
    en: "Find that key on your keyboard and press it.",
    vi: "Tìm phím đó trên bàn phím và nhấn nó."
  },
  {
    en: "For words, type each letter one by one.",
    vi: "Đối với từ, gõ từng chữ cái một."
  },
  {
    en: "Don't rush - accuracy is more important than speed!",
    vi: "Đừng vội - chính xác quan trọng hơn tốc độ!"
  }
]

export function TypingPractice() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const sessionId = useRef(null)
  const [mode, setMode] = useState(null) // null, 'letters', 'words', 'sentences'
  const [items, setItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [results, setResults] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [keyStrokes, setKeyStrokes] = useState(0)

  const ITEM_COUNT = 10

  // Save progress whenever results change
  useEffect(() => {
    if (sessionId.current && results.length > 0) {
      const correctCount = results.filter(r => r.isCorrect).length
      const isComplete = results.length >= ITEM_COUNT
      updateGameSession(sessionId.current, 'typing-practice', {
        score: correctCount * 10,
        completed: results.length,
        total: ITEM_COUNT,
        correct: correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        mode,
        keyStrokes,
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('typing-practice')
      }
    }
  }, [results, mode, keyStrokes, startTime])

  // Handle game completion - play sound and auto-advance
  const isGameComplete = items.length > 0 && currentIndex >= items.length
  useEffect(() => {
    if (isGameComplete) {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isGameComplete, navigate])

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const sentences = [
    { text: 'I love you', vi: 'Con yêu mẹ' },
    { text: 'Good morning', vi: 'Chào buổi sáng' },
    { text: 'How are you', vi: 'Mẹ khỏe không' },
    { text: 'I am happy', vi: 'Con vui lắm' },
    { text: 'Thank you', vi: 'Cảm ơn mẹ' },
    { text: 'See you soon', vi: 'Hẹn gặp lại' },
    { text: 'Have a good day', vi: 'Chúc một ngày tốt lành' },
    { text: 'I miss you', vi: 'Con nhớ mẹ' },
    { text: 'Take care', vi: 'Giữ gìn sức khỏe' },
    { text: 'Sleep well', vi: 'Ngủ ngon nhé' },
  ]

  const startGame = (selectedMode) => {
    let gameItems = []

    if (selectedMode === 'letters') {
      // Random letters
      gameItems = Array.from({ length: ITEM_COUNT }, () => ({
        text: letters[Math.floor(Math.random() * letters.length)],
        type: 'letter'
      }))
    } else if (selectedMode === 'words') {
      // Vietnamese and English words
      const words = getRandomWords(ITEM_COUNT)
      gameItems = words.map(w => ({
        text: w.en,
        vi: w.vi,
        type: 'word'
      }))
    } else if (selectedMode === 'sentences') {
      // Simple sentences
      const shuffled = [...sentences].sort(() => Math.random() - 0.5)
      gameItems = shuffled.slice(0, ITEM_COUNT).map(s => ({
        text: s.text,
        vi: s.vi,
        type: 'sentence'
      }))
    }

    sessionId.current = Date.now()
    setItems(gameItems)
    setMode(selectedMode)
    setCurrentIndex(0)
    setUserInput('')
    setResults([])
    setShowResult(false)
    setStartTime(Date.now())
    setKeyStrokes(0)

    // Focus input after a short delay
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const currentItem = items[currentIndex]

  const handleInputChange = (e) => {
    const value = e.target.value
    setUserInput(value)
    setKeyStrokes(prev => prev + 1)

    // Check if complete (case-insensitive)
    if (value.toLowerCase() === currentItem?.text.toLowerCase()) {
      // Correct!
      playCorrectSound()
      setResults([...results, { item: currentItem, correct: true, typed: value }])
      setShowResult(true)
      // Auto-advance after correct answer
      setTimeout(() => nextItem(), 400)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showResult) {
      nextItem()
    }
  }

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserInput('')
      setShowResult(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Game complete - results are automatically saved by useEffect
      setCurrentIndex(items.length) // Trigger completion screen
    }
  }

  const skipItem = () => {
    setResults([...results, { item: currentItem, correct: false, typed: userInput }])
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserInput('')
      setShowResult(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setCurrentIndex(items.length)
    }
  }

  // Render character comparison
  const renderTypedText = () => {
    if (!currentItem) return null

    const target = currentItem.text.toLowerCase()
    const typed = userInput.toLowerCase()

    return (
      <div className="font-mono text-4xl tracking-wider flex justify-center flex-wrap gap-1">
        {currentItem.text.split('').map((char, i) => {
          const typedChar = userInput[i]?.toLowerCase()
          const targetChar = char.toLowerCase()

          let colorClass = 'text-gray-300' // Not yet typed
          if (typedChar) {
            colorClass = typedChar === targetChar ? 'text-[#5cb85c]' : 'text-[#d9534f]'
          }

          return (
            <span key={i} className={`${colorClass} transition-colors`}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          )
        })}
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Typing Practice
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Luyện đánh máy
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Practice typing to keep your fingers and mind active!
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
            Choose difficulty:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('letters')} className="w-full" variant="secondary">
              Single Letters (Easy)
              <br />
              <span className="text-lg opacity-75">Chữ cái đơn - Dễ</span>
            </Button>
            <Button onClick={() => startGame('words')} className="w-full" variant="secondary">
              Words (Medium)
              <br />
              <span className="text-lg opacity-75">Từ vựng - Trung bình</span>
            </Button>
            <Button onClick={() => startGame('sentences')} className="w-full">
              Short Phrases (Challenge)
              <br />
              <span className="text-lg opacity-75">Cụm từ ngắn - Thử thách</span>
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

  if (currentIndex >= items.length) {
    const correctCount = results.filter(r => r.correct).length
    const accuracy = Math.round((correctCount / ITEM_COUNT) * 100)
    const timeTaken = Math.round((Date.now() - startTime) / 1000)

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Great typing! Đánh máy giỏi lắm!
          </h1>

          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '⌨️' : accuracy >= 60 ? '👍' : '💪'}
          </div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              Completed: <span className="font-bold text-[#4a90a4]">{correctCount}/{ITEM_COUNT}</span>
            </p>
            <p className="text-xl text-gray-600">
              Time: <span className="font-bold">{timeTaken} seconds</span>
            </p>
            <p className="text-xl text-gray-600">
              Keystrokes: <span className="font-bold">{keyStrokes}</span>
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setMode(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/')}>
              Back Home
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
          <h1 className="text-2xl font-bold text-[#2c3e50]">Typing Practice</h1>
          <p className="text-lg text-gray-500">
            {mode === 'letters' ? 'Type the letter' : mode === 'words' ? 'Type the word' : 'Type the phrase'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">
            <span className="font-bold text-[#4a90a4]">{currentIndex + 1}</span> of {ITEM_COUNT}
          </p>
          <p className="text-lg text-gray-600">
            Completed: <span className="font-bold text-[#5cb85c]">{results.filter(r => r.correct).length}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-[#4a90a4] h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / ITEM_COUNT) * 100}%` }}
        />
      </div>

      <Card className="space-y-8 py-12">
        {/* Vietnamese hint for words/sentences */}
        {currentItem?.vi && (
          <div className="text-center">
            <p className="text-lg text-gray-500">Vietnamese:</p>
            <p className="text-2xl text-[#4a90a4] font-semibold">{currentItem.vi}</p>
          </div>
        )}

        {/* Target text with live feedback */}
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">Type this:</p>
          {renderTypedText()}
        </div>

        {/* Input field */}
        <div className="max-w-md mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            className={`w-full text-center text-3xl font-mono py-4 px-6 rounded-xl border-2
              ${showResult
                ? 'border-[#5cb85c] bg-green-50'
                : 'border-gray-300 focus:border-[#4a90a4]'
              }
              focus:outline-none focus:ring-4 focus:ring-[#4a90a4]/20
              transition-all`}
            placeholder={mode === 'letters' ? 'Press the key...' : 'Start typing...'}
          />
        </div>

        {/* Success message */}
        {showResult && (
          <div className="text-center">
            <p className="text-2xl text-[#5cb85c] mb-4">✓ Perfect! Hoàn hảo!</p>
            <Button onClick={nextItem}>
              {currentIndex < items.length - 1 ? 'Next →' : 'See Results'}
            </Button>
          </div>
        )}

        {/* Skip button */}
        {!showResult && (
          <div className="text-center">
            <button
              onClick={skipItem}
              className="text-gray-400 hover:text-gray-600 underline"
            >
              Skip this one
            </button>
          </div>
        )}
      </Card>

      {/* Keyboard hint for letters mode */}
      {mode === 'letters' && (
        <div className="text-center text-gray-500">
          <p>Look at your keyboard and find the letter!</p>
          <p className="text-sm">Nhìn bàn phím và tìm chữ cái!</p>
        </div>
      )}


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Typing Practice"
        gameTitleVi="Luyện đánh máy"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
