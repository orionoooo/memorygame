import { useEffect, useState } from 'react'

// Confetti celebration effect - plays automatically when mounted
export function Confetti({ duration = 3000 }) {
  const [particles, setParticles] = useState([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7']
    const shapes = ['square', 'circle', 'triangle']

    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720,
    }))

    setParticles(newParticles)

    // Clean up after duration
    const timer = setTimeout(() => {
      setIsActive(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div
            className="animate-confetti-spin"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.shape !== 'triangle' ? particle.color : 'transparent',
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
              borderLeft: particle.shape === 'triangle' ? `${particle.size/2}px solid transparent` : 'none',
              borderRight: particle.shape === 'triangle' ? `${particle.size/2}px solid transparent` : 'none',
              borderBottom: particle.shape === 'triangle' ? `${particle.size}px solid ${particle.color}` : 'none',
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Floating stars effect for achievements
export function StarBurst({ count = 8 }) {
  const [stars, setStars] = useState([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i,
      delay: i * 0.05,
    }))
    setStars(newStars)

    const timer = setTimeout(() => setIsActive(false), 1000)
    return () => clearTimeout(timer)
  }, [count])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute left-1/2 top-1/2 animate-star-burst"
          style={{
            transform: `rotate(${star.angle}deg)`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <span className="text-2xl" style={{ display: 'block', transform: 'translateX(30px)' }}>
            ✨
          </span>
        </div>
      ))}
    </div>
  )
}
