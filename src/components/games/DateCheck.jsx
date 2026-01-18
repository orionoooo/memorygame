import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { HelpButton } from '../ui/HelpButton'
import { daysOfWeek, months } from '../../data/vocabulary'
import { updateGameSession, markGameCompleted, getNextGamePath } from '../../lib/storage'
import { playCorrectSound, playCelebrationSound } from '../../lib/sounds'
import { getRandomCorrectMessage, getRandomEmoji } from '../../data/encouragement'

// Help instructions for this game
const HELP_INSTRUCTIONS = [
  {
    en: "This exercise helps you remember today's date.",
    vi: "Bài tập này giúp bạn nhớ ngày hôm nay."
  },
  {
    en: "First, tell us what day of the week it is (like Monday, Tuesday...).",
    vi: "Đầu tiên, cho chúng tôi biết hôm nay là thứ mấy."
  },
  {
    en: "Then, tell us the date number, month, and year.",
    vi: "Sau đó, cho chúng tôi biết ngày, tháng và năm."
  },
  {
    en: "Don't worry if you're not sure - just try your best!",
    vi: "Đừng lo nếu không chắc - cứ cố gắng hết sức!"
  }
]

export function DateCheck() {
  const navigate = useNavigate()
  const today = new Date()
  const [step, setStep] = useState('day') // 'day', 'date', 'month', 'year', 'complete'
  const [answers, setAnswers] = useState({
    day: '',
    date: '',
    month: '',
    year: ''
  })
  const [results, setResults] = useState({
    day: null,
    date: null,
    month: null,
    year: null
  })
  const [lastMessage, setLastMessage] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [showTryAgain, setShowTryAgain] = useState(false)
  const sessionId = useRef(Date.now())
  const startTime = useRef(Date.now())

  // Save progress whenever results change
  useEffect(() => {
    const completedCount = Object.values(results).filter(r => r !== null).length
    const correctCount = Object.values(results).filter(r => r === true).length

    if (completedCount > 0) {
      const isComplete = step === 'complete'
      updateGameSession(sessionId.current, 'date-check', {
        score: correctCount,
        completed: completedCount,
        total: 4,
        accuracy: Math.round((correctCount / completedCount) * 100),
        isComplete,
        timeSeconds: Math.round((Date.now() - startTime.current) / 1000)
      })

      if (isComplete) {
        markGameCompleted('date-check')
      }
    }
  }, [results, step])

  // Handle game completion - play sound and auto-advance
  useEffect(() => {
    if (step === 'complete') {
      playCelebrationSound()
      const timer = setTimeout(() => {
        navigate(getNextGamePath())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, navigate])

  const correctAnswers = {
    day: today.getDay(),
    date: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear()
  }

  const handleSubmitDay = () => {
    const userAnswer = answers.day.toLowerCase().trim()
    const correctDayVi = daysOfWeek[correctAnswers.day].vi.toLowerCase()
    const correctDayEn = daysOfWeek[correctAnswers.day].en.toLowerCase()

    const isCorrect = userAnswer === correctDayVi || userAnswer === correctDayEn ||
                      correctDayVi.includes(userAnswer) || correctDayEn.includes(userAnswer)

    if (isCorrect) {
      playCorrectSound()
      setLastMessage(getRandomCorrectMessage())
      setResults(prev => ({ ...prev, day: true }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('date')
    } else if (attempts === 0) {
      // First wrong attempt - give another chance
      setAttempts(1)
      setShowTryAgain(true)
      setAnswers(prev => ({ ...prev, day: '' }))
    } else {
      // Second wrong attempt - move on
      setResults(prev => ({ ...prev, day: false }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('date')
    }
  }

  const handleSubmitDate = () => {
    const userAnswer = parseInt(answers.date)
    const isCorrect = userAnswer === correctAnswers.date

    if (isCorrect) {
      playCorrectSound()
      setLastMessage(getRandomCorrectMessage())
      setResults(prev => ({ ...prev, date: true }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('month')
    } else if (attempts === 0) {
      // First wrong attempt - give another chance
      setAttempts(1)
      setShowTryAgain(true)
      setAnswers(prev => ({ ...prev, date: '' }))
    } else {
      // Second wrong attempt - move on
      setResults(prev => ({ ...prev, date: false }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('month')
    }
  }

  const handleSubmitMonth = () => {
    const userAnswer = answers.month.toLowerCase().trim()
    const correctMonthVi = months[correctAnswers.month].vi.toLowerCase()
    const correctMonthEn = months[correctAnswers.month].en.toLowerCase()
    const monthNumber = correctAnswers.month + 1

    const isCorrect = userAnswer === correctMonthVi ||
                      userAnswer === correctMonthEn ||
                      userAnswer === String(monthNumber) ||
                      correctMonthVi.includes(userAnswer) ||
                      correctMonthEn.includes(userAnswer)

    if (isCorrect) {
      playCorrectSound()
      setLastMessage(getRandomCorrectMessage())
      setResults(prev => ({ ...prev, month: true }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('year')
    } else if (attempts === 0) {
      // First wrong attempt - give another chance
      setAttempts(1)
      setShowTryAgain(true)
      setAnswers(prev => ({ ...prev, month: '' }))
    } else {
      // Second wrong attempt - move on
      setResults(prev => ({ ...prev, month: false }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('year')
    }
  }

  const handleSubmitYear = () => {
    const userAnswer = parseInt(answers.year)
    const isCorrect = userAnswer === correctAnswers.year

    if (isCorrect) {
      playCorrectSound()
      setResults(prev => ({ ...prev, year: true }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('complete')
    } else if (attempts === 0) {
      // First wrong attempt - give another chance
      setAttempts(1)
      setShowTryAgain(true)
      setAnswers(prev => ({ ...prev, year: '' }))
    } else {
      // Second wrong attempt - move on
      setResults(prev => ({ ...prev, year: false }))
      setAttempts(0)
      setShowTryAgain(false)
      setStep('complete')
    }
    // Results are automatically saved by the useEffect
  }

  const handleKeyPress = (e, submitFn) => {
    if (e.key === 'Enter') {
      submitFn()
    }
  }

  if (step === 'complete') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="text-center">
          <div className="text-6xl mb-4">{getRandomEmoji()}</div>

          <h1 className="text-3xl font-bold text-[#5cb85c] mb-2">
            Wonderful! Tuyệt vời!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            You practiced remembering today's date - that's great for your memory!
            <br />
            <span className="text-[#4a90a4]">Mẹ đã luyện nhớ ngày hôm nay - tốt cho trí nhớ lắm!</span>
          </p>

          <div className="bg-[#f5f7fa] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Today is:</h2>
            <p className="text-3xl text-[#4a90a4] font-bold">
              {daysOfWeek[correctAnswers.day].en}, {months[correctAnswers.month].en} {correctAnswers.date}, {correctAnswers.year}
            </p>
            <p className="text-2xl text-[#4a90a4] mt-2">
              {daysOfWeek[correctAnswers.day].vi}, ngày {correctAnswers.date} {months[correctAnswers.month].vi} năm {correctAnswers.year}
            </p>
          </div>

          <p className="text-lg text-gray-500 mb-6">
            Remember: Every time you practice, your brain gets stronger! 💪
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Choose Another Game
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
          What Day Is It Today? 📅
        </h1>
        <p className="text-xl text-[#4a90a4]">
          Hôm nay là ngày mấy?
        </p>
        <p className="text-lg text-gray-500 mt-2">
          Take your time - there's no rush! 💕
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {['day', 'date', 'month', 'year'].map((s, i) => (
          <div
            key={s}
            className={`w-4 h-4 rounded-full ${
              ['day', 'date', 'month', 'year'].indexOf(step) > i
                ? 'bg-[#5cb85c]' // Always green for completed - no red!
                : step === s
                ? 'bg-[#4a90a4]'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <Card className="space-y-6">
        {step === 'day' && (
          <>
            <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
              What day of the week is it?
            </h2>
            <p className="text-xl text-center text-gray-500">
              Hôm nay là thứ mấy?
            </p>
            {showTryAgain && (
              <div className="text-center p-4 rounded-xl bg-yellow-100">
                <p className="text-2xl text-[#f0ad4e] mb-2">Try again! Thử lại nhé!</p>
                <p className="text-lg text-gray-600">Hint: It starts with "{daysOfWeek[correctAnswers.day].en[0]}"</p>
              </div>
            )}
            <Input
              value={answers.day}
              onChange={(value) => setAnswers(prev => ({ ...prev, day: value }))}
              placeholder="e.g., Monday or Thứ hai"
              size="xlarge"
              autoFocus
              onKeyDown={(e) => handleKeyPress(e, handleSubmitDay)}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResults(prev => ({ ...prev, day: false }))
                  setAttempts(0)
                  setShowTryAgain(false)
                  setStep('date')
                }}
                variant="secondary"
                className="flex-1"
              >
                Skip / Bỏ qua
              </Button>
              <Button
                onClick={handleSubmitDay}
                className="flex-1"
                disabled={!answers.day.trim()}
              >
                Check Answer
              </Button>
            </div>
          </>
        )}

        {step === 'date' && (
          <>
            <div className="text-center mb-4">
              {results.day ? (
                <p className="text-xl text-[#5cb85c]">✓ {lastMessage?.en} {lastMessage?.vi}</p>
              ) : results.day === false ? (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-lg text-[#4a90a4]">
                    Good try! The day is {daysOfWeek[correctAnswers.day].en}
                  </p>
                  <p className="text-md text-gray-500">
                    ({daysOfWeek[correctAnswers.day].vi}) - Now you know! 👍
                  </p>
                </div>
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
              What is today's date (number)?
            </h2>
            <p className="text-xl text-center text-gray-500">
              Hôm nay là ngày bao nhiêu?
            </p>
            {showTryAgain && (
              <div className="text-center p-4 rounded-xl bg-yellow-100">
                <p className="text-2xl text-[#f0ad4e] mb-2">Try again! Thử lại nhé!</p>
                <p className="text-lg text-gray-600">Hint: It's between 1 and 31</p>
              </div>
            )}
            <Input
              type="number"
              value={answers.date}
              onChange={(value) => setAnswers(prev => ({ ...prev, date: value }))}
              placeholder="e.g., 15"
              size="xlarge"
              autoFocus
              onKeyDown={(e) => handleKeyPress(e, handleSubmitDate)}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResults(prev => ({ ...prev, date: false }))
                  setAttempts(0)
                  setShowTryAgain(false)
                  setStep('month')
                }}
                variant="secondary"
                className="flex-1"
              >
                Skip / Bỏ qua
              </Button>
              <Button
                onClick={handleSubmitDate}
                className="flex-1"
                disabled={!answers.date}
              >
                Check Answer
              </Button>
            </div>
          </>
        )}

        {step === 'month' && (
          <>
            <div className="text-center mb-4">
              {results.date ? (
                <p className="text-xl text-[#5cb85c]">✓ {lastMessage?.en} {lastMessage?.vi}</p>
              ) : results.date === false ? (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-lg text-[#4a90a4]">
                    Good try! The date is {correctAnswers.date}
                  </p>
                  <p className="text-md text-gray-500">Now you know! 👍</p>
                </div>
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
              What month is it?
            </h2>
            <p className="text-xl text-center text-gray-500">
              Bây giờ là tháng mấy?
            </p>
            {showTryAgain && (
              <div className="text-center p-4 rounded-xl bg-yellow-100">
                <p className="text-2xl text-[#f0ad4e] mb-2">Try again! Thử lại nhé!</p>
                <p className="text-lg text-gray-600">Hint: It starts with "{months[correctAnswers.month].en[0]}"</p>
              </div>
            )}
            <Input
              value={answers.month}
              onChange={(value) => setAnswers(prev => ({ ...prev, month: value }))}
              placeholder="e.g., January or Tháng một or 1"
              size="xlarge"
              autoFocus
              onKeyDown={(e) => handleKeyPress(e, handleSubmitMonth)}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResults(prev => ({ ...prev, month: false }))
                  setAttempts(0)
                  setShowTryAgain(false)
                  setStep('year')
                }}
                variant="secondary"
                className="flex-1"
              >
                Skip / Bỏ qua
              </Button>
              <Button
                onClick={handleSubmitMonth}
                className="flex-1"
                disabled={!answers.month.trim()}
              >
                Check Answer
              </Button>
            </div>
          </>
        )}

        {step === 'year' && (
          <>
            <div className="text-center mb-4">
              {results.month ? (
                <p className="text-xl text-[#5cb85c]">✓ {lastMessage?.en} {lastMessage?.vi}</p>
              ) : results.month === false ? (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-lg text-[#4a90a4]">
                    Good try! The month is {months[correctAnswers.month].en}
                  </p>
                  <p className="text-md text-gray-500">
                    ({months[correctAnswers.month].vi}) - Now you know! 👍
                  </p>
                </div>
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold text-center text-[#2c3e50]">
              What year is it?
            </h2>
            <p className="text-xl text-center text-gray-500">
              Năm nay là năm mấy?
            </p>
            {showTryAgain && (
              <div className="text-center p-4 rounded-xl bg-yellow-100">
                <p className="text-2xl text-[#f0ad4e] mb-2">Try again! Thử lại nhé!</p>
                <p className="text-lg text-gray-600">Hint: It starts with "20"</p>
              </div>
            )}
            <Input
              type="number"
              value={answers.year}
              onChange={(value) => setAnswers(prev => ({ ...prev, year: value }))}
              placeholder="e.g., 2024"
              size="xlarge"
              autoFocus
              onKeyDown={(e) => handleKeyPress(e, handleSubmitYear)}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResults(prev => ({ ...prev, year: false }))
                  setAttempts(0)
                  setShowTryAgain(false)
                  setStep('complete')
                }}
                variant="secondary"
                className="flex-1"
              >
                Skip / Bỏ qua
              </Button>
              <Button
                onClick={handleSubmitYear}
                className="flex-1"
                disabled={!answers.year}
              >
                Check Answer
              </Button>
            </div>
          </>
        )}
      </Card>


      {/* Floating help button - always visible */}
      <HelpButton
        gameTitle="What Day Is It?"
        gameTitleVi="Hôm nay là ngày mấy?"
        instructions={HELP_INSTRUCTIONS}
      />
    </div>
  )
}
