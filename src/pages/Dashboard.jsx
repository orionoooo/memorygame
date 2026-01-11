import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getTodayResults, getDailyStats, clearAllResults } from '../lib/storage'

const FAMILY_PASSWORD = 'family123' // Simple password for family access

export function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [todayResults, setTodayResults] = useState([])
  const [dailyStats, setDailyStats] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
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
    setLoading(false)
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadData()
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === FAMILY_PASSWORD) {
      setIsLoggedIn(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
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

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🐧🔐</div>
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
            Cici's Corner
          </h1>
          <p className="text-xl text-gray-500">
            Family access only
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter family password"
              label="Password"
              error={error}
              size="large"
              autoFocus
            />
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
          <p className="text-sm text-gray-400 mt-4 text-center">
            Password: family123
          </p>
        </Card>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todayStats = dailyStats.find(d => d.date === today) || { exercises: [], totalScore: 0, exerciseCount: 0 }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">
            🐧 Cici's Corner
          </h1>
          <p className="text-lg text-gray-500">
            See how Mom is doing with her games
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={loadData} disabled={loading}>
            {loading ? '...' : '🔄 Refresh'}
          </Button>
          <Button variant="secondary" onClick={() => setIsLoggedIn(false)}>
            Logout
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-500">Loading data from cloud...</p>
        </div>
      )}

      {/* Today's Summary */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          Today's Summary - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {todayStats.exerciseCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">📝</p>
            <p className="text-xl text-gray-500">No exercises completed today yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#4a90a4]">{todayStats.exerciseCount}</p>
                <p className="text-gray-600">Exercises</p>
              </div>
              <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#5cb85c]">{todayStats.totalScore}</p>
                <p className="text-gray-600">Total Score</p>
              </div>
              <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#f0ad4e]">
                  {todayStats.exercises.length > 0
                    ? Math.round(todayStats.exercises.reduce((sum, e) => sum + (e.accuracy || 0), 0) / todayStats.exercises.length)
                    : 0}%
                </p>
                <p className="text-gray-600">Avg Accuracy</p>
              </div>
              <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#9b59b6]">
                  {Math.round(todayStats.exercises.reduce((sum, e) => sum + (e.timeSeconds || 0), 0) / 60)}
                </p>
                <p className="text-gray-600">Minutes</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Exercise Details</h3>
            <div className="space-y-3">
              {todayStats.exercises.map((exercise, i) => (
                <div key={i} className={`rounded-xl p-4 flex justify-between items-center ${
                  exercise.isComplete === false ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}>
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
                  <div className="text-right">
                    <p className="font-bold text-[#4a90a4]">Score: {exercise.score || 0}</p>
                    {exercise.accuracy !== undefined && (
                      <p className="text-sm text-gray-500">{exercise.accuracy}% accuracy</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Weekly Overview */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          Last 7 Days
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {dailyStats.slice(0, 7).reverse().map((day) => {
            const date = new Date(day.date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = date.getDate()
            const hasActivity = day.exerciseCount > 0

            return (
              <div
                key={day.date}
                className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                  hasActivity
                    ? 'bg-[#5cb85c]/20 hover:bg-[#5cb85c]/30'
                    : 'bg-gray-100 hover:bg-gray-200'
                } ${selectedDate === day.date ? 'ring-2 ring-[#4a90a4]' : ''}`}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
              >
                <p className="text-sm text-gray-500">{dayName}</p>
                <p className="text-xl font-bold">{dayNum}</p>
                {hasActivity && (
                  <p className="text-xs text-[#5cb85c] font-semibold">{day.exerciseCount} ✓</p>
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
                  <div key={i} className="flex justify-between text-sm">
                    <span>{exerciseLabels[ex.exerciseType] || ex.exerciseType}</span>
                    <span className="font-semibold">Score: {ex.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No exercises on this day</p>
            )}
          </div>
        )}
      </Card>

      {/* Progress Trend */}
      <Card>
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
          30-Day Activity
        </h2>

        <div className="flex items-end gap-1 h-32">
          {dailyStats.slice(0, 30).reverse().map((day, i) => {
            const maxScore = Math.max(...dailyStats.map(d => d.totalScore), 1)
            const height = day.totalScore > 0 ? Math.max((day.totalScore / maxScore) * 100, 10) : 5

            return (
              <div
                key={day.date}
                className="flex-1 group relative"
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
      </Card>

      {/* Data Management */}
      <Card className="bg-gray-50">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">
          🔧 Settings
        </h2>
        <p className="text-gray-600 mb-4">
          Game results are saved on this device.
        </p>
        <div className="flex gap-4">
          <Button
            variant="danger"
            size="small"
            onClick={async () => {
              if (confirm('Are you sure you want to clear all results? This cannot be undone.')) {
                await clearAllResults()
                setTodayResults([])
                await loadData()
              }
            }}
          >
            Clear All Data
          </Button>
        </div>
      </Card>
    </div>
  )
}
