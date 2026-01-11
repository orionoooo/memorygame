export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  className = '',
  type = 'button'
}) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[#4a90a4] hover:bg-[#357a8c] text-white focus:ring-[#4a90a4]/50',
    secondary: 'bg-white hover:bg-gray-100 text-[#2c3e50] border-2 border-[#4a90a4] focus:ring-[#4a90a4]/50',
    success: 'bg-[#5cb85c] hover:bg-[#4cae4c] text-white focus:ring-[#5cb85c]/50',
    danger: 'bg-[#d9534f] hover:bg-[#c9302c] text-white focus:ring-[#d9534f]/50',
  }

  const sizes = {
    small: 'px-4 py-2 text-lg',
    medium: 'px-6 py-3 text-xl',
    large: 'px-8 py-4 text-2xl min-h-[60px]',
    xlarge: 'px-10 py-6 text-3xl min-h-[80px]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
