import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getTodayResults, getDailyStats, clearAllResults } from '../lib/storage'
import { signIn, signUp, signOut, getSession, onAuthStateChange } from '../lib/supabase'

export function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [todayResults, setTodayResults] = useState([])
  const [dailyStats, setDailyStats] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    getSession().then(session => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [results, stats] = await Promise.all([
        getTodayResults(),
        getDailyStats(30)
      ])
      setTodayResults(results)
      setDailyStats(stats)
    } catch (e) {
      console.error('Failed to load data:', e)
    }
    setDataLoading(false)
  }

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setAuthLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        setError('Check your email for a confirmation link!')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (e) {
      setError(e.message)
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setSession(null)
  }

  const exerciseLabels = {
    'date-check': 'Date Check',
    'memory-cards': 'Memory Cards',
    'pattern-recall': 'Pattern Recall',
    'translation': 'Translation',
    'word-puzzle': 'Word Puzzle',
    'typing-practice': 'Typing Practice',
    'math-games': 'Math Games',
    'speed-game': 'Speed Games'
  }

  const exerciseEmojis = {
    'date-check': '📅',
    'memory-cards': '🃏',
    'pattern-recall': '🎨',
    'translation': '🌐',
    'word-puzzle': '🔤',
    'typing-practice': '⌨️',
    'math-games': '🔢',
    'speed-game': '⚡'
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Caregiver Dashboard
          </h1>
          <p className="text-xl text-gray-500">
            Monitor Mom's daily progress
          </p>
          <p className="text-lg text-[#4a90a4] mt-2">
            Theo dõi tiến trình hàng ngày của Mẹ
          </p>
        </div>

        <Card>
          <form onSubmit={handleAuth} className="space-y-6">
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              label="Email"
              size="large"
              autoFocus
            />
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
              label="Password"
              size="large"
            />
            {error && (
              <p className={`text-center ${error.includes('Check your email') ? 'text-green-600' : 'text-red-500'}`}>
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-[#4a90a4] hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todayStats = dailyStats.find(d => d.date === today) || { exercises: [], totalScore: 0, exerciseCount: 0 }

  // Calculate streak
  let streak = 0
  for (const day of dailyStats) {
    if (day.exerciseCount > 0) {
      streak++
    } else {
      break
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">
            👨‍👩‍👧 Caregiver Dashboard
          </h1>
          <p className="text-lg text-gray-500">
            Logged in as {session.user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={loadData} disabled={dataLoading}>
            {dataLoading ? '...' : '🔄 Refresh'}
          </Button>
          <Button variant="secondary" size="small" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </div>

      {dataLoading && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-500">Loading data from cloud...</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-4xl font-bold text-[#4a90a4]">{todayStats.exerciseCount}</p>
          <p className="text-gray-600">Today's Exercises</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-4xl font-bold text-[#5cb85c]">{todayStats.totalScore}</p>
          <p className="text-gray-600">Today's Score</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-4xl font-bold text-[#f0ad4e]">
            {todayStats.exercises.length > 0
              ? Math.round(todayStats.exercises.reduce((sum, e) => sum + (e.accuracy || 0), 0) / todayStats.exercises.length)
              : 0}%
          </p>
          <p className="text-gray-600">Avg Accuracy</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-4xl font-bold text-[#9b59b6]">{streak}</p>
          <p className="text-gray-600">Day Streak 🔥</p>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          📅 Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {todayStats.exerciseCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">😴</p>
            <p className="text-xl text-gray-500">No exercises completed today yet</p>
            <p className="text-lg text-gray-400 mt-2">Mẹ chưa chơi game nào hôm nay</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayStats.exercises.map((exercise, i) => (
              <div key={i} className={`rounded-xl p-4 flex justify-between items-center ${
                exercise.isComplete === false ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{exerciseEmojis[exercise.exerciseType] || '🎮'}</span>
                  <div>
                    <p className="font-semibold text-[#2c3e50]">
                      {exerciseLabels[exercise.exerciseType] || exercise.exerciseType}
                      {exercise.isComplete === false && (
                        <span className="ml-2 text-sm font-normal text-yellow-600">(in progress)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(exercise.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {exercise.completed && exercise.total && (
                        <span className="ml-2">• {exercise.completed}/{exercise.total} completed</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#4a90a4]">{exercise.score || 0}</p>
                  {exercise.accuracy !== undefined && (
                    <p className="text-sm text-gray-500">{exercise.accuracy}% accuracy</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly Overview */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          📊 Last 7 Days
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {dailyStats.slice(0, 7).reverse().map((day) => {
            const date = new Date(day.date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = date.getDate()
            const hasActivity = day.exerciseCount > 0
            const isToday = day.date === today

            return (
              <div
                key={day.date}
                className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                  hasActivity
                    ? 'bg-[#5cb85c]/20 hover:bg-[#5cb85c]/30'
                    : 'bg-gray-100 hover:bg-gray-200'
                } ${selectedDate === day.date ? 'ring-2 ring-[#4a90a4]' : ''} ${isToday ? 'ring-2 ring-[#f0ad4e]' : ''}`}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
              >
                <p className="text-sm text-gray-500">{dayName}</p>
                <p className="text-xl font-bold">{dayNum}</p>
                {hasActivity ? (
                  <p className="text-xs text-[#5cb85c] font-semibold">{day.exerciseCount} ✓</p>
                ) : (
                  <p className="text-xs text-gray-400">-</p>
                )}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold mb-3">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {dailyStats.find(d => d.date === selectedDate)?.exercises.length > 0 ? (
              <div className="space-y-2">
                {dailyStats.find(d => d.date === selectedDate)?.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{exerciseEmojis[ex.exerciseType] || '🎮'}</span>
                      {exerciseLabels[ex.exerciseType] || ex.exerciseType}
                    </span>
                    <span className="font-semibold text-[#4a90a4]">Score: {ex.score}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[#5cb85c]">
                    {dailyStats.find(d => d.date === selectedDate)?.totalScore} points
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No exercises on this day</p>
            )}
          </div>
        )}
      </Card>

      {/* 30-Day Progress Chart */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          📈 30-Day Activity
        </h2>

        <div className="flex items-end gap-1 h-32">
          {dailyStats.slice(0, 30).reverse().map((day) => {
            const maxScore = Math.max(...dailyStats.map(d => d.totalScore), 1)
            const height = day.totalScore > 0 ? Math.max((day.totalScore / maxScore) * 100, 10) : 5

            return (
              <div
                key={day.date}
                className="flex-1 group relative cursor-pointer"
                title={`${day.date}: ${day.exerciseCount} exercises, Score: ${day.totalScore}`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    day.exerciseCount > 0 ? 'bg-[#4a90a4] hover:bg-[#357a8c]' : 'bg-gray-200'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>

        {/* Activity Summary */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#4a90a4]">
              {dailyStats.filter(d => d.exerciseCount > 0).length}
            </p>
            <p className="text-sm text-gray-500">Active Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#5cb85c]">
              {dailyStats.reduce((sum, d) => sum + d.exerciseCount, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Exercises</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#f0ad4e]">
              {dailyStats.reduce((sum, d) => sum + d.totalScore, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Score</p>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-red-50 border border-red-100">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">
          ⚠️ Danger Zone
        </h2>
        <p className="text-gray-600 mb-4">
          This will permanently delete all game results from the database.
        </p>
        <Button
          variant="danger"
          size="small"
          onClick={async () => {
            if (confirm('Are you sure you want to clear ALL results? This cannot be undone.')) {
              await clearAllResults()
              await loadData()
            }
          }}
        >
          Clear All Data
        </Button>
      </Card>
    </div>
  )
}
