import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from '../../lib/sounds'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "Simple Math: Solve addition and subtraction problems.",
    vi: "Toán đơn giản: Giải các bài toán cộng và trừ."
  },
  {
    en: "Money Counting: Count the total value of coins and bills.",
    vi: "Đếm tiền: Đếm tổng giá trị của tiền xu và tiền giấy."
  },
  {
    en: "Number Patterns: Find the missing number in the sequence.",
    vi: "Dãy số: Tìm số còn thiếu trong dãy."
  },
  {
    en: "Type your answer and press Submit. Take your time!",
    vi: "Gõ câu trả lời và nhấn Gửi. Từ từ thôi!"
  }
]

export function MathGames() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null, 'arithmetic', 'money', 'sequence'
  const [problems, setProblems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // null, 'correct', 'incorrect', 'tryAgain'
  const [results, setResults] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const sessionId = useRef(null)
  const inputRef = useRef(null)

  const PROBLEM_COUNT = 10

  // Save progress whenever results change
  useEffect(() => {
    if (sessionId.current && results.length > 0) {
      const correctCount = results.filter(r => r.isCorrect).length
      const isComplete = results.length >= PROBLEM_COUNT
      updateGameSession(sessionId.current, 'math-games', {
        score: correctCount * 10,
        completed: results.length,
        total: PROBLEM_COUNT,
        correct: correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        mode,
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime) / 1000)
      })

      if (isComplete) {
        markGameCompleted('math-games')
      }
    }
  }, [results, mode, startTime])

  // Handle game completion - play sound and auto-advance
  const isGameComplete = problems.length > 0 && currentIndex >= problems.length
  useEffect(() => {
    if (isGameComplete) {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isGameComplete, navigate])

  // Generate arithmetic problems
  const generateArithmetic = () => {
    const problems = []
    for (let i = 0; i < PROBLEM_COUNT; i++) {
      const isAddition = Math.random() > 0.3 // 70% addition, 30% subtraction
      if (isAddition) {
        const a = Math.floor(Math.random() * 10) + 1
        const b = Math.floor(Math.random() * 10) + 1
        problems.push({
          question: `${a} + ${b}`,
          questionVi: `${a} cộng ${b}`,
          answer: a + b,
          type: 'addition'
        })
      } else {
        const a = Math.floor(Math.random() * 10) + 5
        const b = Math.floor(Math.random() * Math.min(a, 5)) + 1
        problems.push({
          question: `${a} - ${b}`,
          questionVi: `${a} trừ ${b}`,
          answer: a - b,
          type: 'subtraction'
        })
      }
    }
    return problems
  }

  // Generate money counting problems
  const generateMoney = () => {
    const moneyProblems = [
      { coins: '2 quarters', answer: 50, hint: '25¢ + 25¢' },
      { coins: '3 dimes', answer: 30, hint: '10¢ + 10¢ + 10¢' },
      { coins: '5 nickels', answer: 25, hint: '5¢ × 5' },
      { coins: '1 quarter and 2 dimes', answer: 45, hint: '25¢ + 10¢ + 10¢' },
      { coins: '4 quarters', answer: 100, hint: '25¢ × 4 = $1.00' },
      { coins: '1 dollar and 3 quarters', answer: 175, hint: '100¢ + 75¢' },
      { coins: '2 dimes and 3 nickels', answer: 35, hint: '20¢ + 15¢' },
      { coins: '1 quarter and 5 pennies', answer: 30, hint: '25¢ + 5¢' },
      { coins: '3 quarters and 2 dimes', answer: 95, hint: '75¢ + 20¢' },
      { coins: '2 dollars', answer: 200, hint: '$1 + $1' },
      { coins: '1 half dollar', answer: 50, hint: '50¢' },
      { coins: '6 dimes', answer: 60, hint: '10¢ × 6' },
    ]

    const shuffled = [...moneyProblems].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, PROBLEM_COUNT).map(p => ({
      question: `How many cents is ${p.coins}?`,
      questionVi: `Bao nhiêu xu?`,
      answer: p.answer,
      hint: p.hint,
      display: p.coins,
      type: 'money'
    }))
  }

  // Generate number sequence problems
  const generateSequence = () => {
    const patterns = [
      { seq: [2, 4, 6, 8], next: 10, rule: '+2' },
      { seq: [5, 10, 15, 20], next: 25, rule: '+5' },
      { seq: [1, 3, 5, 7], next: 9, rule: '+2 (odd numbers)' },
      { seq: [10, 20, 30, 40], next: 50, rule: '+10' },
      { seq: [3, 6, 9, 12], next: 15, rule: '+3' },
      { seq: [1, 2, 3, 4], next: 5, rule: '+1' },
      { seq: [10, 9, 8, 7], next: 6, rule: '-1' },
      { seq: [20, 18, 16, 14], next: 12, rule: '-2' },
      { seq: [4, 8, 12, 16], next: 20, rule: '+4' },
      { seq: [100, 90, 80, 70], next: 60, rule: '-10' },
      { seq: [2, 4, 8, 16], next: 32, rule: '×2' },
      { seq: [1, 1, 2, 3, 5], next: 8, rule: 'add previous two' },
    ]

    const shuffled = [...patterns].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, PROBLEM_COUNT).map(p => ({
      question: `${p.seq.join(', ')}, ___`,
      questionVi: 'Số tiếp theo là gì?',
      answer: p.next,
      hint: `Pattern: ${p.rule}`,
      type: 'sequence'
    }))
  }

  const startGame = (selectedMode) => {
    sessionId.current = Date.now()
    let gameProblems = []

    if (selectedMode === 'arithmetic') {
      gameProblems = generateArithmetic()
    } else if (selectedMode === 'money') {
      gameProblems = generateMoney()
    } else if (selectedMode === 'sequence') {
      gameProblems = generateSequence()
    }

    setProblems(gameProblems)
    setMode(selectedMode)
    setCurrentIndex(0)
    setAnswer('')
    setFeedback(null)
    setResults([])
    setShowAnswer(false)
    setAttempts(0)
    setStartTime(Date.now())
  }

  const currentProblem = problems[currentIndex]

  const checkAnswer = () => {
    if (!currentProblem) return

    const userAnswer = parseInt(answer)
    const isCorrect = userAnswer === currentProblem.answer

    if (isCorrect) {
      // Correct answer!
      setFeedback('correct')
      setShowAnswer(true)
      setResults([...results, { problem: currentProblem, userAnswer, isCorrect: true }])
      playCorrectSound()
      setTimeout(() => nextProblem(), 400)
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
      setResults([...results, { problem: currentProblem, userAnswer, isCorrect: false }])
      playIncorrectSound()
    }
  }

  const skipProblem = () => {
    // Allow skipping without penalty - just move on
    setResults([...results, { problem: currentProblem, userAnswer: null, isCorrect: false }])
    nextProblem()
  }

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setFeedback(null)
      setShowAnswer(false)
      setAttempts(0)
      // Re-focus input for next question
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Game complete - results are automatically saved by useEffect
      setCurrentIndex(problems.length)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showAnswer) {
        nextProblem()
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
            Math Games
          </h1>
          <p className="text-xl text-[#4a90a4]">
            Trò chơi toán học
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Keep your mind sharp with numbers!
          </p>
        </div>

        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
            Choose a game:
          </h2>
          <div className="space-y-4">
            <Button onClick={() => startGame('arithmetic')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">➕</span>
              Simple Math
              <br />
              <span className="text-lg opacity-75">Cộng và trừ đơn giản</span>
            </Button>
            <Button onClick={() => startGame('money')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">💰</span>
              Counting Money
              <br />
              <span className="text-lg opacity-75">Đếm tiền</span>
            </Button>
            <Button onClick={() => startGame('sequence')} className="w-full" variant="secondary">
              <span className="text-3xl mr-3">🔢</span>
              Number Patterns
              <br />
              <span className="text-lg opacity-75">Tìm quy luật số</span>
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

  if (currentIndex >= problems.length) {
    const correctCount = results.filter(r => r.isCorrect).length
    const accuracy = Math.round((correctCount / PROBLEM_COUNT) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Great work! Làm tốt lắm!
          </h1>

          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}
          </div>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6 space-y-4">
            <p className="text-2xl">
              Score: <span className="font-bold text-[#4a90a4]">{correctCount}/{PROBLEM_COUNT}</span>
            </p>
            <p className="text-xl text-gray-600">
              Accuracy: <span className="font-bold text-[#5cb85c]">{accuracy}%</span>
            </p>
          </div>

          {/* Show missed problems */}
          {results.filter(r => !r.isCorrect).length > 0 && (
            <div className="text-left bg-red-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#d9534f]">
                Review these:
              </h3>
              <ul className="space-y-2">
                {results.filter(r => !r.isCorrect).map((r, i) => (
                  <li key={i} className="text-lg">
                    {r.problem.question} = <span className="font-bold text-[#5cb85c]">{r.problem.answer}</span>
                    <span className="text-gray-400 ml-2">(you wrote: {r.userAnswer})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

  const getModeTitle = () => {
    switch (mode) {
      case 'arithmetic': return 'Simple Math'
      case 'money': return 'Counting Money'
      case 'sequence': return 'Number Patterns'
      default: return 'Math'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">{getModeTitle()}</h1>
          <p className="text-lg text-gray-500">
            {mode === 'money' ? 'Count the coins' : mode === 'sequence' ? 'Find the pattern' : 'Solve the problem'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">
            Problem <span className="font-bold text-[#4a90a4]">{currentIndex + 1}</span> of {PROBLEM_COUNT}
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
          style={{ width: `${((currentIndex) / PROBLEM_COUNT) * 100}%` }}
        />
      </div>

      <Card className="space-y-6 py-8">
        {/* Question display */}
        <div className="text-center">
          {mode === 'money' && currentProblem.display && (
            <p className="text-xl text-gray-500 mb-2">{currentProblem.display}</p>
          )}
          <p className="text-5xl font-bold text-[#4a90a4] mb-4">
            {currentProblem.question}
          </p>
          <p className="text-lg text-gray-500">
            {currentProblem.questionVi}
          </p>
        </div>

        {/* Answer input */}
        <div className="max-w-xs mx-auto">
          <Input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={setAnswer}
            placeholder={mode === 'money' ? 'cents' : 'number'}
            size="xlarge"
            autoFocus
            disabled={showAnswer}
            onKeyDown={handleKeyPress}
            className="text-center"
          />
          {mode === 'money' && (
            <p className="text-center text-gray-400 mt-2">Enter amount in cents</p>
          )}
        </div>

        {/* Feedback */}
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
                {currentProblem.hint && (
                  <p className="text-lg text-gray-600">Hint: {currentProblem.hint}</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-2xl text-[#d9534f] mb-2">Good try!</p>
                <p className="text-xl">
                  The answer is: <span className="font-bold text-[#4a90a4]">{currentProblem.answer}</span>
                </p>
                {currentProblem.hint && (
                  <p className="text-lg text-gray-500 mt-2">({currentProblem.hint})</p>
                )}
                <p className="text-lg text-gray-500 mt-1">Now you know! 👍</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!showAnswer && (
            <Button
              onClick={skipProblem}
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
              onClick={nextProblem}
              className="w-full"
            >
              {currentIndex < problems.length - 1 ? 'Next Problem →' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>

      {/* Hint for sequence mode */}
      {mode === 'sequence' && !showAnswer && (
        <div className="text-center text-gray-500">
          <p>Look for the pattern between numbers</p>
          <p className="text-sm">Tìm quy luật giữa các số</p>
        </div>
      )}


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="Math Games"
        gameTitleVi="Trò chơi toán học"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
