import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Confetti } from '../ui/Confetti'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { CircularProgress } from '../ui/CircularProgress'
import { HelpButton } from '../ui/HelpButton'
import { getRandomWords } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "You'll see a word in one language - type the translation in the other language.",
    vi: "Bạn sẽ thấy một từ bằng một ngôn ngữ - gõ bản dịch bằng ngôn ngữ kia."
  },
  {
    en: "Don't worry about accents - we accept answers without them.",
    vi: "Đừng lo về dấu - chúng tôi chấp nhận câu trả lời không có dấu."
  },
  {
    en: "If you're not sure, just try your best guess! You can try again if wrong.",
    vi: "Nếu không chắc, cứ thử đoán! Bạn có thể thử lại nếu sai."
  },
  {
    en: "Press Skip if you want to see the answer and move on.",
    vi: "Nhấn Bỏ qua nếu bạn muốn xem đáp án và tiếp tục."
  }
]

// Remove Vietnamese diacritics for flexible matching
function removeVietnameseDiacritics(str) {
  // Map all Vietnamese special characters to their base letters
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  }

  return str.split('').map(char => vietnameseMap[char] || char).join('')
}

export function TranslationGame() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null, 'vi-to-en', 'en-to-vi', 'mixed'
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // null, 'correct', 'incorrect', 'tryAgain'
  const [results, setResults] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const sessionId = useRef(null)
  const inputRef = useRef(null)

  const WORD_COUNT = 10

  // Save progress whenever results change
  useEffect(() => {
    if (sessionId.current && results.length > 0) {
      const correctCount = results.filter(r => r.isCorrect).length
      const isComplete = results.length >= WORD_COUNT
      updateGameSession(sessionId.current, 'translation', {
        score: correctCount * 10,
        completed: results.length,
        total: WORD_COUNT,
        correct: correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        mode,
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('translation')
      }
    }
  }, [results, mode, startTime])

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

  const startGame = (selectedMode) => {
    sessionId.current = Date.now()
    const randomWords = getRandomWords(WORD_COUNT)
    setWords(randomWords.map((word, index) => ({
      ...word,
      direction: selectedMode === 'mixed'
        ? (index % 2 === 0 ? 'vi-to-en' : 'en-to-vi')
        : selectedMode
    })))
    setMode(selectedMode)
    setCurrentIndex(0)
    setAnswer('')
    setFeedback(null)
    setResults([])
    setShowAnswer(false)
    setAttempts(0)
    setStartTime(Date.now())
  }

  const currentWord = words[currentIndex]

  const checkAnswer = () => {
    if (!currentWord) return

    const userAnswer = answer.toLowerCase().trim()
    const correctAnswer = currentWord.direction === 'vi-to-en'
      ? currentWord.en.toLowerCase()
      : currentWord.vi.toLowerCase()

    // Compare without diacritics - so "me" matches "mẹ"
    const userAnswerNormalized = removeVietnameseDiacritics(userAnswer)
    const correctAnswerNormalized = removeVietnameseDiacritics(correctAnswer)

    // Accept answer if the letters match (ignoring accents/diacritics)
    const isCorrect = userAnswerNormalized === correctAnswerNormalized

    if (isCorrect) {
      // Correct answer!
      setFeedback('correct')
      setShowAnswer(true)
      setResults([...results, { word: currentWord, userAnswer, isCorrect: true }])
      playCorrectSound()
      setTimeout(() => nextWord(), 400)
    } else if (attempts === 0) {
      // First wrong attempt - give another chance
      setFeedback('tryAgain')
      setAttempts(1)
      setAnswer('')
      playIncorrectSound()
      // Re-focus input for retry
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Second wrong attempt - show answer
      setFeedback('incorrect')
      setShowAnswer(true)
      setResults([...results, { word: currentWord, userAnswer, isCorrect: false }])
      playIncorrectSound()
    }
  }

  const skipWord = () => {
    // Allow skipping without penalty - just move on
    setResults([...results, { word: currentWord, userAnswer: '(skipped)', isCorrect: false }])
    nextWord()
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setFeedback(null)
      setShowAnswer(false)
      setAttempts(0)
      // Re-focus input for next question
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Game complete - trigger completion screen
      setCurrentIndex(words.length)
    }
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

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Translation Practice
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Luyện dịch
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
            Choose translation direction:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('vi-to-en')} className="w-full" variant="secondary">
              Vietnamese → English
              <br />
              <span className="text-lg opacity-75">Tiếng Việt → Tiếng Anh</span>
            </Button>
            <Button onClick={() => startGame('en-to-vi')} className="w-full" variant="secondary">
              English → Vietnamese
              <br />
              <span className="text-lg opacity-75">Tiếng Anh → Tiếng Việt</span>
            </Button>
            <Button onClick={() => startGame('mixed')} className="w-full">
              Mixed (Both directions)
              <br />
              <span className="text-lg opacity-75">Cả hai chiều</span>
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
    const nextGame = getNextGamePath()

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Confetti />

        <Card className="text-center animate-slide-up" variant="gradient">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Well done!</span>
          </h1>
          <p className="text-2xl text-[#4a90a4] mb-6">Làm tốt lắm!</p>

          <div className="text-7xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
            {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <CircularProgress
                value={accuracy}
                size={100}
                strokeWidth={8}
                color={accuracy >= 80 ? '#5cb85c' : accuracy >= 60 ? '#f0ad4e' : '#4a90a4'}
              />
              <p className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Accuracy</p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-5xl font-bold text-[#4a90a4]">
                <AnimatedNumber value={correctCount} duration={800} />
                <span className="text-2xl text-gray-400">/{WORD_COUNT}</span>
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Score</p>
            </div>
          </div>

          {/* Show missed words */}
          {results.filter(r => !r.isCorrect).length > 0 && (
            <div className="text-left bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border border-red-100">
              <h3 className="text-xl font-semibold mb-4 text-[#d9534f]">
                Words to review:
              </h3>
              <ul className="space-y-2">
                {results.filter(r => !r.isCorrect).map((r, i) => (
                  <li key={i} className="text-lg">
                    <span className="text-[#4a90a4]">{r.word.vi}</span>
                    {' = '}
                    <span className="font-semibold">{r.word.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-lg text-gray-500 mb-6 animate-pulse">Moving to next game...</p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setMode(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate(nextGame)} glow>
              Next Game →
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const prompt = currentWord.direction === 'vi-to-en' ? currentWord.vi : currentWord.en
  const promptLabel = currentWord.direction === 'vi-to-en' ? 'Vietnamese' : 'English'
  const answerLabel = currentWord.direction === 'vi-to-en' ? 'English' : 'Vietnamese'
  const correctAnswer = currentWord.direction === 'vi-to-en' ? currentWord.en : currentWord.vi

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Translation Practice</h1>
          <p className="text-lg text-gray-500">
            {currentWord.direction === 'vi-to-en' ? 'Vietnamese → English' : 'English → Vietnamese'}
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
          <p className="text-lg text-gray-500 mb-2">{promptLabel}:</p>
          <p className="text-4xl font-bold text-[#4a90a4]">{prompt}</p>
          <p className="text-sm text-gray-400 mt-2">Category: {currentWord.category}</p>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-600 text-center">
            Type the {answerLabel} translation:
          </p>
          <Input
            ref={inputRef}
            value={answer}
            onChange={setAnswer}
            placeholder={`Type ${answerLabel} here...`}
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
                <p className="text-lg text-gray-600">
                  Hint: The first letter is "<span className="font-bold">{correctAnswer[0].toUpperCase()}</span>"
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl text-[#d9534f] mb-2">Good try!</p>
                <p className="text-xl">
                  The answer is: <span className="font-bold text-[#4a90a4]">{correctAnswer}</span>
                </p>
                <p className="text-lg text-gray-500 mt-1">Now you know! 👍</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!showAnswer && (
            <Button
              onClick={skipWord}
              variant="secondary"
              className="flex-1"
            >
              Skip / Bỏ qua
            </Button>
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
        gameTitle="Translation"
        gameTitleVi="Luyện dịch"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
