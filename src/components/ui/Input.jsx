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
  onKeyDown,
  icon,
}, ref) {
  const baseStyles = `
    w-full rounded-2xl border-2
    bg-white/80 backdrop-blur-sm
    transition-all duration-200
    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20
    focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10
    disabled:bg-slate-100 disabled:cursor-not-allowed
    placeholder:text-slate-400
  `

  const sizes = {
    medium: 'px-4 py-3 text-xl',
    large: 'px-6 py-4 text-2xl',
    xlarge: 'px-8 py-6 text-3xl',
  }

  const borderStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : 'border-slate-200 hover:border-slate-300'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xl font-medium text-slate-800 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">
            {icon}
          </div>
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
          className={`${baseStyles} ${sizes[size]} ${borderStyles} ${icon ? 'pl-14' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-2 text-lg text-red-500 flex items-center gap-2">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
})
