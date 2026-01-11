export function Card({
  children,
  className = '',
  padding = 'large',
  onClick,
  hoverable = false,
  selected = false
}) {
  const baseStyles = 'bg-white rounded-2xl shadow-md'

  const paddings = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }

  const interactiveStyles = hoverable
    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200'
    : ''

  const selectedStyles = selected
    ? 'ring-4 ring-[#4a90a4] ring-offset-2'
    : ''

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${paddings[padding]} ${interactiveStyles} ${selectedStyles} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
