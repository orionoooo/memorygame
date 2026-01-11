import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { DateCheck } from './components/games/DateCheck'
import { MemoryCards } from './components/games/MemoryCards'
import { PatternRecall } from './components/games/PatternRecall'
import { TranslationGame } from './components/games/TranslationGame'
import { WordPuzzle } from './components/games/WordPuzzle'
import { TypingPractice } from './components/games/TypingPractice'
import { MathGames } from './components/games/MathGames'
import { SpeedGame } from './components/games/SpeedGame'
import { DailyComplete } from './components/DailyComplete'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games/date-check" element={<DateCheck />} />
          <Route path="/games/memory-cards" element={<MemoryCards />} />
          <Route path="/games/pattern-recall" element={<PatternRecall />} />
          <Route path="/games/translation" element={<TranslationGame />} />
          <Route path="/games/word-puzzle" element={<WordPuzzle />} />
          <Route path="/games/typing" element={<TypingPractice />} />
          <Route path="/games/math" element={<MathGames />} />
          <Route path="/games/speed" element={<SpeedGame />} />
          <Route path="/done" element={<DailyComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
