// Storage for exercise results - uses Supabase for cloud sync
import { supabase } from './supabase'

// Save a game result to Supabase
export async function saveGameResult(exerciseType, result) {
  try {
    const { data, error } = await supabase
      .from('exercise_results')
      .insert({
        exercise_type: exerciseType,
        score: result.score || 0,
        completed: result.completed || 0,
        total: result.total || 0,
        accuracy: result.accuracy || null,
        is_complete: result.isComplete || false,
        time_seconds: result.timeSeconds || null,
        mode: result.mode || null,
        details: result // Store full details as JSON
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error('Failed to save result:', e)
    return null
  }
}

// Update an existing game result
export async function updateGameResult(id, exerciseType, result) {
  try {
    const { data, error } = await supabase
      .from('exercise_results')
      .update({
        score: result.score || 0,
        completed: result.completed || 0,
        total: result.total || 0,
        accuracy: result.accuracy || null,
        is_complete: result.isComplete || false,
        time_seconds: result.timeSeconds || null,
        mode: result.mode || null,
        details: result
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error('Failed to update result:', e)
    return null
  }
}

// Create or update a game session
export async function updateGameSession(sessionId, exerciseType, progress) {
  // sessionId is stored locally to track which DB record to update
  const localKey = `session_${sessionId}`
  const existingId = localStorage.getItem(localKey)

  if (existingId) {
    // Update existing record
    return await updateGameResult(parseInt(existingId), exerciseType, progress)
  } else {
    // Create new record
    const result = await saveGameResult(exerciseType, progress)
    if (result?.id) {
      localStorage.setItem(localKey, result.id.toString())
    }
    return result
  }
}

// Get today's results from Supabase
export async function getTodayResults() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('exercise_results')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform to match expected format
    return (data || []).map(r => ({
      id: r.id,
      exerciseType: r.exercise_type,
      date: r.created_at,
      score: r.score,
      completed: r.completed,
      total: r.total,
      accuracy: r.accuracy,
      isComplete: r.is_complete,
      timeSeconds: r.time_seconds,
      mode: r.mode,
      ...r.details
    }))
  } catch (e) {
    console.error('Failed to get today results:', e)
    return []
  }
}

// Get results for a specific date range
export async function getResultsByDateRange(startDate, endDate) {
  try {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('exercise_results')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(r => ({
      id: r.id,
      exerciseType: r.exercise_type,
      date: r.created_at,
      score: r.score,
      completed: r.completed,
      total: r.total,
      accuracy: r.accuracy,
      isComplete: r.is_complete,
      timeSeconds: r.time_seconds,
      mode: r.mode,
      ...r.details
    }))
  } catch (e) {
    console.error('Failed to get results by date range:', e)
    return []
  }
}

// Get daily stats for the dashboard
export async function getDailyStats(days = 30) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('exercise_results')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by date
    const statsByDate = {}

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      statsByDate[dateStr] = {
        date: dateStr,
        exercises: [],
        totalScore: 0,
        exerciseCount: 0
      }
    }

    // Populate with results
    (data || []).forEach(r => {
      const dateStr = r.created_at.split('T')[0]
      if (statsByDate[dateStr]) {
        const exercise = {
          id: r.id,
          exerciseType: r.exercise_type,
          date: r.created_at,
          score: r.score,
          completed: r.completed,
          total: r.total,
          accuracy: r.accuracy,
          isComplete: r.is_complete,
          timeSeconds: r.time_seconds,
          mode: r.mode
        }
        statsByDate[dateStr].exercises.push(exercise)
        statsByDate[dateStr].totalScore += r.score || 0
        statsByDate[dateStr].exerciseCount++
      }
    })

    return Object.values(statsByDate).sort((a, b) => b.date.localeCompare(a.date))
  } catch (e) {
    console.error('Failed to get daily stats:', e)
    return []
  }
}

// Clear all results (admin function)
export async function clearAllResults() {
  try {
    const { error } = await supabase
      .from('exercise_results')
      .delete()
      .neq('id', 0) // Delete all rows

    if (error) throw error

    // Clear local session keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('session_')) {
        localStorage.removeItem(key)
      }
    })

    return true
  } catch (e) {
    console.error('Failed to clear results:', e)
    return false
  }
}

// Game order for sequential play
const GAME_ORDER = [
  'date-check',
  'memory-cards',
  'pattern-recall',
  'translation',
  'word-puzzle',
  'typing-practice',
  'math-games',
  'speed-game'
]

const GAME_PATHS = {
  'date-check': '/games/date-check',
  'memory-cards': '/games/memory-cards',
  'pattern-recall': '/games/pattern-recall',
  'translation': '/games/translation',
  'word-puzzle': '/games/word-puzzle',
  'typing-practice': '/games/typing',
  'math-games': '/games/math',
  'speed-game': '/games/speed'
}

// Get which games were completed today (sync version for immediate UI)
export function getTodayCompletedGamesSync() {
  // Use localStorage cache for immediate response
  const cacheKey = `completed_games_${new Date().toISOString().split('T')[0]}`
  const cached = localStorage.getItem(cacheKey)
  return cached ? new Set(JSON.parse(cached)) : new Set()
}

// Update the completed games cache
export function markGameCompleted(exerciseType) {
  const cacheKey = `completed_games_${new Date().toISOString().split('T')[0]}`
  const completed = getTodayCompletedGamesSync()
  completed.add(exerciseType)
  localStorage.setItem(cacheKey, JSON.stringify([...completed]))
}

// Get the next game to play
export function getNextGamePath() {
  const completed = getTodayCompletedGamesSync()

  for (const game of GAME_ORDER) {
    if (!completed.has(game)) {
      return GAME_PATHS[game]
    }
  }

  return '/done'
}

// Get progress info for display
export function getTodayProgress() {
  const completed = getTodayCompletedGamesSync()
  return {
    completedCount: completed.size,
    totalGames: GAME_ORDER.length,
    isComplete: completed.size >= GAME_ORDER.length
  }
}
