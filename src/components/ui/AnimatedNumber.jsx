import { useState, useEffect, useRef } from 'react'

// Animated number that counts up/down to target value
export function AnimatedNumber({
  value,
  duration = 1000,
  className = '',
  prefix = '',
  suffix = '',
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    if (startValue === endValue) return

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const current = Math.round(startValue + (endValue - startValue) * easeOutQuart)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        previousValue.current = endValue
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// Score display with pop animation on change
export function ScoreDisplay({
  score,
  label = 'Score',
  className = '',
  size = 'medium',
}) {
  const [shouldPop, setShouldPop] = useState(false)
  const previousScore = useRef(score)

  useEffect(() => {
    if (score !== previousScore.current) {
      setShouldPop(true)
      const timer = setTimeout(() => setShouldPop(false), 300)
      previousScore.current = score
      return () => clearTimeout(timer)
    }
  }, [score])

  const sizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`font-bold text-[#4a90a4] ${sizes[size]} ${shouldPop ? 'animate-score-pop' : ''}`}>
        <AnimatedNumber value={score} duration={500} />
      </p>
    </div>
  )
}

// Accuracy percentage with color coding
export function AccuracyDisplay({
  correct,
  total,
  className = '',
}) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  const getColor = () => {
    if (percentage >= 80) return 'text-[#5cb85c]'
    if (percentage >= 60) return 'text-[#f0ad4e]'
    return 'text-[#4a90a4]'
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-500 uppercase tracking-wide">Accuracy</p>
      <p className={`text-2xl font-bold ${getColor()}`}>
        <AnimatedNumber value={percentage} duration={800} suffix="%" />
      </p>
    </div>
  )
}
