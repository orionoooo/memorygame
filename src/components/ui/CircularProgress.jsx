import { useState, useEffect } from 'react'

// Circular progress ring - great for showing completion
export function CircularProgress({
  value, // 0-100
  size = 120,
  strokeWidth = 8,
  className = '',
  showValue = true,
  label = '',
  color = '#4a90a4',
  trackColor = '#e5e7eb',
  animated = true,
}) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value)

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value)
      return
    }

    const duration = 1000
    const startTime = performance.now()
    const startValue = animatedValue

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setAnimatedValue(startValue + (value - startValue) * easeOutQuart)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, animated])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedValue / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animated ? 'none' : 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#2c3e50]">
            {Math.round(animatedValue)}%
          </span>
          {label && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Progress bar with animation
export function ProgressBar({
  value, // 0-100
  height = 12,
  className = '',
  color = '#4a90a4',
  trackColor = '#e5e7eb',
  showLabel = false,
  animated = true,
}) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value)

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value)
      return
    }

    const timer = setTimeout(() => setAnimatedValue(value), 100)
    return () => clearTimeout(timer)
  }, [value, animated])

  return (
    <div className={className}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${animatedValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-500 mt-1 text-right">
          {Math.round(value)}%
        </p>
      )}
    </div>
  )
}

// Step progress indicator (dots or numbers)
export function StepProgress({
  current,
  total,
  className = '',
  variant = 'dots', // 'dots' or 'numbers'
}) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length: total }, (_, i) => {
        const isComplete = i < current
        const isCurrent = i === current

        if (variant === 'numbers') {
          return (
            <div
              key={i}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-300
                ${isComplete ? 'bg-[#5cb85c] text-white' : ''}
                ${isCurrent ? 'bg-[#4a90a4] text-white ring-4 ring-[#4a90a4]/30' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
              `}
            >
              {isComplete ? '✓' : i + 1}
            </div>
          )
        }

        return (
          <div
            key={i}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isComplete ? 'bg-[#5cb85c]' : ''}
              ${isCurrent ? 'bg-[#4a90a4] ring-4 ring-[#4a90a4]/30 scale-125' : ''}
              ${!isComplete && !isCurrent ? 'bg-gray-300' : ''}
            `}
          />
        )
      })}
    </div>
  )
}
