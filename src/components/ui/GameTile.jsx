// Professional game tile component with colorful gradients and abstract icons
// Inspired by Lumosity, Peak, and Elevate design patterns

// Abstract SVG icons for each game type
const GameIcons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <circle cx="12" cy="15" r="2"/>
    </svg>
  ),
  cards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2" y="4" width="8" height="12" rx="2"/>
      <rect x="14" y="8" width="8" height="12" rx="2"/>
      <path d="M6 8h0"/>
      <path d="M18 12h0"/>
    </svg>
  ),
  pattern: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="18" r="3"/>
      <path d="M6 9v6"/>
      <path d="M18 9v6"/>
      <path d="M9 6h6"/>
      <path d="M9 18h6"/>
    </svg>
  ),
  translate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M5 8l6 6"/>
      <path d="M4 14l6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2v3"/>
      <path d="M22 22l-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
  ),
  puzzle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>
    </svg>
  ),
  keyboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
      <path d="M6 8h.001"/>
      <path d="M10 8h.001"/>
      <path d="M14 8h.001"/>
      <path d="M18 8h.001"/>
      <path d="M8 12h.001"/>
      <path d="M12 12h.001"/>
      <path d="M16 12h.001"/>
      <path d="M7 16h10"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
}

// Gradient presets for different game categories
const gradients = {
  memory: 'from-violet-500 to-purple-600',
  focus: 'from-cyan-500 to-blue-600',
  language: 'from-emerald-500 to-teal-600',
  logic: 'from-orange-500 to-red-500',
  speed: 'from-yellow-500 to-orange-500',
  math: 'from-pink-500 to-rose-600',
  pattern: 'from-indigo-500 to-violet-600',
  typing: 'from-sky-500 to-indigo-500',
}

export function GameTile({
  title,
  titleVi,
  description,
  icon = 'cards',
  gradient = 'memory',
  onClick,
  completed = false,
  className = '',
}) {
  const IconComponent = GameIcons[icon] || GameIcons.cards

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full overflow-hidden rounded-3xl
        bg-gradient-to-br ${gradients[gradient]}
        p-6 text-left text-white
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20
        active:scale-[0.98]
        focus:outline-none focus:ring-4 focus:ring-white/50
        ${completed ? 'ring-2 ring-white/50' : ''}
        ${className}
      `}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />

      {/* Content */}
      <div className="relative flex items-center gap-5">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {IconComponent}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold tracking-tight">
            {title}
          </h3>
          {titleVi && (
            <p className="text-base text-white/80 font-medium">
              {titleVi}
            </p>
          )}
          {description && (
            <p className="text-sm text-white/60 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/30 group-hover:translate-x-1">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Completed badge */}
      {completed && (
        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-green-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

// Large hero button for main CTA
export function HeroButton({
  children,
  onClick,
  gradient = 'from-indigo-500 via-purple-500 to-pink-500',
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-3xl
        bg-gradient-to-r ${gradient}
        px-10 py-6 text-white font-bold text-2xl
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30
        active:scale-[0.98]
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        ${className}
      `}
    >
      {/* Animated shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Content */}
      <span className="relative">{children}</span>
    </button>
  )
}

// Section header component
export function SectionHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-lg text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}
