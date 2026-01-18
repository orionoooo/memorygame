import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { getRandomWords } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted } from '../../lib/storage'

// Remove Vietnamese diacritics for flexible matching
function removeVietnameseDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export function TranslationGame() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null, 'vi-to-en', 'en-to-vi', 'mixed'
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // null, 'correct', 'incorrect'
  const [results, setResults] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
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
    setStartTime(Date.now())
  }

  const currentWord = words[currentIndex]

  const checkAnswer = () => {
    if (!currentWord) return

    const userAnswer = answer.toLowerCase().trim()
    const correctAnswer = currentWord.direction === 'vi-to-en'
      ? currentWord.en.toLowerCase()
      : currentWord.vi.toLowerCase()

    // For Vietnamese answers, also compare without diacritics
    const userAnswerNormalized = removeVietnameseDiacritics(userAnswer)
    const correctAnswerNormalized = removeVietnameseDiacritics(correctAnswer)

    // Allow for flexible matching (exact, partial, or without diacritics)
    const isCorrect = userAnswer === correctAnswer ||
                      userAnswerNormalized === correctAnswerNormalized ||
                      correctAnswer.includes(userAnswer) && userAnswer.length >= 3 ||
                      userAnswer.includes(correctAnswer) ||
                      correctAnswerNormalized.includes(userAnswerNormalized) && userAnswerNormalized.length >= 3

    setFeedback(isCorrect ? 'correct' : 'incorrect')
    setShowAnswer(true)
    setResults([...results, { word: currentWord, userAnswer, isCorrect }])

    // Auto-advance after correct answer
    if (isCorrect) {
      setTimeout(() => nextWord(), 400)
    }
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setFeedback(null)
      setShowAnswer(false)
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

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Well done! Làm tốt lắm!
          </h1>

          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}
          </div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              Score: <span className="font-bold text-[#4a90a4]">{correctCount}/{WORD_COUNT}</span>
            </p>
            <p className="text-xl text-gray-600">
              Accuracy: <span className="font-bold text-[#5cb85c]">{accuracy}%</span>
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
                    <span className="text-[#4a90a4]">{r.word.vi}</span>
                    {' = '}
                    <span className="font-semibold">{r.word.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setMode(null)}>
              Play Again
            </Button>
            <Button onClick={() => navigate('/games/word-puzzle')}>
              Next Exercise →
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
            feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {feedback === 'correct' ? (
              <p className="text-2xl text-[#5cb85c]">✓ Correct! Đúng rồi!</p>
            ) : (
              <div>
                <p className="text-2xl text-[#d9534f] mb-2">Not quite!</p>
                <p className="text-xl">
                  The answer is: <span className="font-bold text-[#4a90a4]">{correctAnswer}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {!showAnswer ? (
          <Button
            onClick={checkAnswer}
            className="w-full"
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
      </Card>

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
