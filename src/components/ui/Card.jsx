export function Card({
  children,
  className = '',
  padding = 'large',
  onClick,
  hoverable = false,
  selected = false,
  variant = 'default', // 'default', 'glass', 'gradient'
  animate = false,
}) {
  const baseStyles = 'rounded-2xl transition-all duration-300'

  const variants = {
    default: 'bg-white/90 backdrop-blur-sm shadow-lg shadow-black/5 border border-white/50',
    glass: 'glass-strong shadow-lg shadow-black/5',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg shadow-black/5 border border-white/50',
    solid: 'bg-white shadow-lg shadow-black/5',
  }

  const paddings = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }

  const interactiveStyles = hoverable
    ? 'cursor-pointer card-lift hover:shadow-xl hover:shadow-black/10 active:scale-[0.98]'
    : ''

  const selectedStyles = selected
    ? 'ring-4 ring-indigo-500 ring-offset-2 shadow-xl shadow-indigo-500/20'
    : ''

  const animateStyles = animate ? 'animate-slide-up' : ''

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${interactiveStyles} ${selectedStyles} ${animateStyles} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}

// Feature card with icon - great for game selection
export function FeatureCard({
  icon,
  title,
  titleVi,
  description,
  onClick,
  className = '',
  completed = false,
}) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={`flex items-center gap-5 ${completed ? 'ring-2 ring-emerald-500/50' : ''} ${className}`}
      padding="medium"
    >
      <div className={`
        text-5xl p-3 rounded-2xl
        ${completed ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}
        transition-transform duration-300 group-hover:scale-110
      `}>
        {completed && <span className="absolute -top-1 -right-1 text-lg">✓</span>}
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold text-slate-800 truncate">
          {title}
        </h3>
        {titleVi && (
          <p className="text-lg text-indigo-600 truncate">{titleVi}</p>
        )}
        {description && (
          <p className="text-base text-slate-500 truncate">{description}</p>
        )}
      </div>
      <div className="text-2xl text-indigo-500 opacity-50">
        →
      </div>
    </Card>
  )
}

// Stats card for displaying metrics
export function StatsCard({
  icon,
  label,
  value,
  subValue,
  trend, // 'up', 'down', 'neutral'
  className = '',
}) {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-slate-500',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <Card className={`text-center ${className}`} padding="medium">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-sm text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {subValue && (
        <p className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-slate-500'}`}>
          {trend && trendIcons[trend]} {subValue}
        </p>
      )}
    </Card>
  )
}
