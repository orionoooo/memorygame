import { forwardRef } from 'react'

export const Input = forwardRef(function Input({
  value,
  onChange,
  placeholder = '',
  label,
  type = 'text',
  size = 'large',
  error = '',
  disabled = false,
  className = '',
  autoFocus = false,
  onKeyDown
}, ref) {
  const baseStyles = 'w-full rounded-xl border-2 transition-all duration-200 focus:border-[#4a90a4] focus:ring-4 focus:ring-[#4a90a4]/20 disabled:bg-gray-100 disabled:cursor-not-allowed'

  const sizes = {
    medium: 'px-4 py-3 text-xl',
    large: 'px-6 py-4 text-2xl',
    xlarge: 'px-8 py-6 text-3xl',
  }

  const borderStyles = error
    ? 'border-[#d9534f] focus:border-[#d9534f] focus:ring-[#d9534f]/20'
    : 'border-gray-300'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xl font-medium text-[#2c3e50] mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={`${baseStyles} ${sizes[size]} ${borderStyles}`}
      />
      {error && (
        <p className="mt-2 text-lg text-[#d9534f]">{error}</p>
      )}
    </div>
  )
})
