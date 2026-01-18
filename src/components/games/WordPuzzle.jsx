import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { getRandomWords, shuffleArray } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Unscramble: The letters are mixed up - put them in the right order to spell the word.",
    vi: "Sắp xếp chữ: Các chữ cái bị xáo trộn - đặt chúng đúng thứ tự để đánh vần từ."
  },
  {
    en: "Fill in the Blank: Some letters are missing - type the complete word.",
    vi: "Điền vào chỗ trống: Một số chữ cái bị thiếu - gõ từ hoàn chỉnh."
  },
  {
    en: "Use the hint button if you need help seeing which letters are in the word.",
    vi: "Sử dụng nút gợi ý nếu bạn cần trợ giúp xem những chữ cái nào có trong từ."
  },
  {
    en: "Take your time - there's no rush!",
    vi: "Từ từ thôi - không cần vội!"
  }
]

export function WordPuzzle() {
  const navigate = useNavigate()
  const [gameType, setGameType] = useState(null) // null, 'unscramble', 'fillBlank'
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // null, 'correct', 'incorrect', 'tryAgain'
  const [results, setResults] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [hint, setHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const sessionId = useRef(null)
  const inputRef = useRef(null)

  const WORD_COUNT = 8

  // Save progress whenever results change
  useEffect(() => {
    if (sessionId.current && results.length > 0) {
      const correctCount = results.filter(r => r.isCorrect).length
      const isComplete = results.length >= WORD_COUNT
      updateGameSession(sessionId.current, 'word-puzzle', {
        score: correctCount * 10,
        completed: results.length,
        total: WORD_COUNT,
        correct: correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        gameType,
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('word-puzzle')
      }
    }
  }, [results, gameType, startTime])

  // Handle game completion - play sound and auto-advance
  const isGameComplete = words.length > 0 && currentIndex >= words.length
  useEffect(() => {
    if (isGameComplete) {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isGameComplete, navigate])

  const scrambleWord = (word) => {
    const letters = word.split('')
    let scrambled = shuffleArray(letters).join('')
    // Make sure it's actually scrambled
    while (scrambled === word && word.length > 1) {
      scrambled = shuffleArray(letters).join('')
    }
    return scrambled
  }

  const createFillBlank = (word) => {
    const letters = word.split('')
    const hideCount = Math.max(1, Math.floor(letters.length / 2))
    const indicesToHide = []

    while (indicesToHide.length < hideCount) {
      const idx = Math.floor(Math.random() * letters.length)
      if (!indicesToHide.includes(idx)) {
        indicesToHide.push(idx)
      }
    }

    return letters.map((letter, i) =>
      indicesToHide.includes(i) ? '_' : letter
    ).join('')
  }

  const startGame = (type) => {
    sessionId.current = Date.now()
    const randomWords = getRandomWords(WORD_COUNT)
    const puzzleWords = randomWords.map(word => ({
      ...word,
      // Use English for puzzles (learning new language is beneficial)
      puzzle: type === 'unscramble'
        ? scrambleWord(word.en)
        : createFillBlank(word.en),
      answer: word.en
    }))

    setWords(puzzleWords)
    setGameType(type)
    setCurrentIndex(0)
    setAnswer('')
    setFeedback(null)
    setResults([])
    setShowAnswer(false)
    setHint(false)
    setAttempts(0)
    setStartTime(Date.now())
  }

  const currentWord = words[currentIndex]

  const checkAnswer = () => {
    if (!currentWord) return

    const userAnswer = answer.toLowerCase().trim()
    const correctAnswer = currentWord.answer.toLowerCase()

    const isCorrect = userAnswer === correctAnswer

    if (isCorrect) {
      // Correct answer!
      setFeedback('correct')
      setShowAnswer(true)
      setResults([...results, { word: currentWord, userAnswer, isCorrect: true, usedHint: hint }])
      playCorrectSound()
      setTimeout(() => nextWord(), 400)
    } else if (attempts === 0) {
      // First wrong attempt - give another chance with hint
      setFeedback('tryAgain')
      setAttempts(1)
      setAnswer('')
      setHint(true) // Show hint automatically on retry
      playIncorrectSound()
      // Re-focus input for retry
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Second wrong attempt - show answer
      setFeedback('incorrect')
      setShowAnswer(true)
      setResults([...results, { word: currentWord, userAnswer, isCorrect: false, usedHint: hint }])
      playIncorrectSound()
    }
  }

  const skipWord = () => {
    // Allow skipping without penalty - just move on
    setResults([...results, { word: currentWord, userAnswer: '(skipped)', isCorrect: false, usedHint: hint }])
    nextWord()
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setFeedback(null)
      setShowAnswer(false)
      setHint(false)
      setAttempts(0)
      // Re-focus input for next question
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Game complete - trigger completion screen
      setCurrentIndex(words.length)
    }
  }

  const showHint = () => {
    setHint(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showAnswer) {
        nextWord()
      } else if (answer.trim()) {
        checkAnswer()
      }
    }
  }

  if (!gameType) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Word Puzzles
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Đố chữ
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
            Choose puzzle type:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('unscramble')} className="w-full" variant="secondary">
              Unscramble Words
              <br />
              <span className="text-lg opacity-75">Sắp xếp lại chữ cái</span>
            </Button>
            <Button onClick={() => startGame('fillBlank')} className="w-full" variant="secondary">
              Fill in Missing Letters
              <br />
              <span className="text-lg opacity-75">Điền chữ cái còn thiếu</span>
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

  if (currentIndex >= words.length) {
    const correctCount = results.filter(r => r.isCorrect).length
    const accuracy = Math.round((correctCount / WORD_COUNT) * 100)
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    // Results are automatically saved by useEffect

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Great work! Làm tốt lắm!
          </h1>

          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '🎯' : accuracy >= 60 ? '👍' : '💪'}
          </div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              Score: <span className="font-bold text-[#4a90a4]">{correctCount}/{WORD_COUNT}</span>
            </p>
            <p className="text-xl text-gray-600">
              Accuracy: <span className="font-bold text-[#5cb85c]">{accuracy}%</span>
            </p>
            <p className="text-xl text-gray-600">
              Time: <span className="font-bold">{timeTaken} seconds</span>
            </p>
          </div>

          {/* Show missed words */}
          {results.filter(r => !r.isCorrect).length > 0 && (
            <div className="text-left bg-red-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#d9534f]">
                Words to review:
              </h3>
              <ul className="space-y-2">
                {results.filter(r => !r.isCorrect).map((r, i) => (
                  <li key={i} className="text-lg">
                    <span className="font-semibold">{r.word.en}</span>
                    {' = '}
                    <span className="text-[#4a90a4]">{r.word.vi}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setGameType(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/')}>
              Finish Exercises ✓
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
          <h1 className="text-2xl font-bold text-[#2c3e50]">Word Puzzles</h1>
          <p className="text-lg text-gray-500">
            {gameType === 'unscramble' ? 'Unscramble the word' : 'Fill in the blanks'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">
            Word <span className="font-bold text-[#4a90a4]">{currentIndex + 1}</span> of {WORD_COUNT}
          </p>
          <p className="text-lg text-gray-600">
            Correct: <span className="font-bold text-[#5cb85c]">{results.filter(r => r.isCorrect).length}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-[#4a90a4] h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / WORD_COUNT) * 100}%` }}
        />
      </div>

      <Card className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">
            {gameType === 'unscramble'
              ? 'Rearrange these letters to form an English word:'
              : 'Fill in the missing letters:'
            }
          </p>
          <p className="text-5xl font-mono font-bold text-[#4a90a4] tracking-wider">
            {currentWord.puzzle}
          </p>

          {/* Vietnamese hint */}
          <div className="mt-6 p-4 bg-[#f5f7fa] rounded-xl">
            <p className="text-lg text-gray-500">Vietnamese meaning:</p>
            <p className="text-2xl text-[#2c3e50] font-semibold">
              {currentWord.vi}
            </p>
          </div>

          {/* Additional hint */}
          {hint && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-xl">
              <p className="text-lg text-yellow-700">
                First letter: <span className="font-bold">{currentWord.answer[0].toUpperCase()}</span>
                {' | '}
                Length: <span className="font-bold">{currentWord.answer.length} letters</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Input
            ref={inputRef}
            value={answer}
            onChange={setAnswer}
            placeholder="Type your answer..."
            size="xlarge"
            autoFocus
            disabled={showAnswer}
            onKeyDown={handleKeyPress}
          />
        </div>

        {feedback && (
          <div className={`text-center p-4 rounded-xl ${
            feedback === 'correct' ? 'bg-green-100' :
            feedback === 'tryAgain' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {feedback === 'correct' ? (
              <p className="text-2xl text-[#5cb85c]">✓ Correct! Đúng rồi!</p>
            ) : feedback === 'tryAgain' ? (
              <div>
                <p className="text-2xl text-[#f0ad4e] mb-2">Try again! Thử lại nhé!</p>
                <p className="text-lg text-gray-600">Look at the hint above</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl text-[#d9534f] mb-2">Good try!</p>
                <p className="text-xl">
                  The answer is: <span className="font-bold text-[#4a90a4]">{currentWord.answer}</span>
                </p>
                <p className="text-lg text-gray-500 mt-1">Now you know! 👍</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!showAnswer && (
            <>
              {!hint && (
                <Button
                  onClick={showHint}
                  variant="secondary"
                  className="flex-1"
                >
                  Hint
                </Button>
              )}
              <Button
                onClick={skipWord}
                variant="secondary"
                className="flex-1"
              >
                Skip / Bỏ qua
              </Button>
            </>
          )}

          {!showAnswer ? (
            <Button
              onClick={checkAnswer}
              className="flex-1"
              disabled={!answer.trim()}
            >
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={nextWord}
              className="w-full"
            >
              {currentIndex < words.length - 1 ? 'Next Word →' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Word Puzzles"
        gameTitleVi="Đố chữ"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
