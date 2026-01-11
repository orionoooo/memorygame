import { Link, useLocation } from 'react-router-dom'
import { getTodayTheme } from '../data/themes'

export function Layout({ children }) {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const theme = getTodayTheme()

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Floating penguin decorations */}
      <div className="fixed top-20 left-4 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
        🐧
      </div>
      <div className="fixed top-40 right-6 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        🐧
      </div>
      <div className="fixed bottom-32 left-8 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>
        🐧
      </div>
      <div className="fixed bottom-20 right-4 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s' }}>
        {theme.decoration}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#4a90a4] hover:text-[#357a8c]">
            <span className="text-3xl">🐧</span>
            Games for Mom
          </Link>
          {!isDashboard && (
            <Link
              to="/dashboard"
              className="text-lg text-[#4a90a4] hover:text-[#357a8c]"
            >
              🔐 Cici's Corner
            </Link>
          )}
          {isDashboard && (
            <Link
              to="/"
              className="text-lg text-[#4a90a4] hover:text-[#357a8c]"
            >
              🎮 Back to Games
            </Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-0">
        {children}
      </main>

      {/* Footer with penguin */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-gray-500">
          <p className="text-lg flex items-center justify-center gap-2">
            <span>Made with</span>
            <span className="text-red-500">❤️</span>
            <span>for Mom</span>
            <span className="text-2xl">🐧</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
