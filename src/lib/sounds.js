// Simple sound effects using Web Audio API
// No audio files needed - generates pleasant tones

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// Pleasant chime for correct answers
export function playCorrectSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Create a pleasant two-tone chime
    const frequencies = [523.25, 659.25] // C5 and E5 - happy major third

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      // Gentle fade in and out
      gainNode.gain.setValueAtTime(0, now + i * 0.1)
      gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.3)

      oscillator.start(now + i * 0.1)
      oscillator.stop(now + i * 0.1 + 0.4)
    })
  } catch (e) {
    // Audio not supported, fail silently
    console.log('Audio not available')
  }
}

// Soft sound for incorrect (not harsh, just informative)
export function playIncorrectSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 330 // E4 - gentle low tone
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3)

    oscillator.start(now)
    oscillator.stop(now + 0.4)
  } catch (e) {
    console.log('Audio not available')
  }
}

// Celebration sound for completing a game
export function playCelebrationSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Ascending arpeggio - C E G C (major chord going up)
    const frequencies = [523.25, 659.25, 783.99, 1046.50]

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const startTime = now + i * 0.12
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.5)
    })
  } catch (e) {
    console.log('Audio not available')
  }
}

// Initialize audio context on first user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch (e) {
    console.log('Audio init failed')
  }
}
