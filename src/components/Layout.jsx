import { Link, useLocation } from 'react-router-dom'
import { FontSizeToggle } from './ui/FontSizeToggle'

export function Layout({ children }) {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 w-full overflow-x-hidden">
      {/* Animated background shapes - hidden on mobile for performance */}
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large floating gradient orbs */}
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
            animationDuration: '15s',
          }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[400px] h-[400px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)',
            animationDuration: '18s',
            animationDelay: '3s',
          }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
            animationDuration: '20s',
            animationDelay: '6s',
          }}
        />
        {/* Smaller accent shapes */}
        <div
          className="absolute top-1/2 left-10 w-32 h-32 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
            animationDuration: '8s',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute bottom-1/4 right-20 w-24 h-24 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-200/50 sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            {/* Logo icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Brain Games
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Font size toggle - always visible for accessibility */}
            <FontSizeToggle />

            {/* Navigation links */}
            {!isDashboard && (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-indigo-50"
                title="Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            {isDashboard && (
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-indigo-50"
                title="Play Games"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Play Games</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-0">
        {children}
      </main>

      {/* Footer - minimal and professional */}
      <footer className="mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-slate-400 text-sm">
            Made with care for cognitive wellness
          </p>
        </div>
      </footer>
    </div>
  )
}
