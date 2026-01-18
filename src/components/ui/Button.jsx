export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  className = '',
  type = 'button',
  glow = false,
}) {
  const baseStyles = `
    font-semibold rounded-2xl
    transition-all duration-200 ease-out
    focus:ring-4 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.97] hover:scale-[1.02]
    shadow-lg hover:shadow-xl
  `

  const variants = {
    primary: `
      bg-gradient-to-br from-indigo-500 to-purple-600
      hover:from-indigo-600 hover:to-purple-700
      text-white focus:ring-indigo-500/50
      shadow-indigo-500/25 hover:shadow-indigo-500/40
    `,
    secondary: `
      bg-white/90 backdrop-blur-sm
      hover:bg-white
      text-slate-700 border-2 border-indigo-200
      hover:border-indigo-400
      focus:ring-indigo-500/50
      shadow-black/5
    `,
    success: `
      bg-gradient-to-br from-emerald-500 to-green-600
      hover:from-emerald-600 hover:to-green-700
      text-white focus:ring-emerald-500/50
      shadow-emerald-500/25 hover:shadow-emerald-500/40
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-rose-600
      hover:from-red-600 hover:to-rose-700
      text-white focus:ring-red-500/50
      shadow-red-500/25
    `,
    ghost: `
      bg-transparent hover:bg-indigo-50
      text-indigo-600
      shadow-none hover:shadow-none
    `,
  }

  const sizes = {
    small: 'px-5 py-3 text-lg min-h-[48px]',
    medium: 'px-6 py-4 text-xl min-h-[56px]',
    large: 'px-8 py-5 text-2xl min-h-[70px]',
    xlarge: 'px-10 py-6 text-3xl min-h-[90px]',
  }

  const glowStyles = glow ? 'animate-pulse-glow' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles} ${className}`}
    >
      {children}
    </button>
  )
}

// Icon button for compact actions
export function IconButton({
  icon,
  onClick,
  label,
  variant = 'ghost',
  size = 'medium',
  className = '',
}) {
  const sizes = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl',
  }

  const variants = {
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
    primary: 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white',
    secondary: 'bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200',
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        ${sizes[size]} ${variants[variant]}
        rounded-xl flex items-center justify-center
        transition-all duration-200
        active:scale-95 hover:scale-105
        ${className}
      `}
    >
      {icon}
    </button>
  )
}
