// Text-to-speech utilities for accessibility
// Uses the Web Speech API (speechSynthesis)

// Check if speech synthesis is available
export function isSpeechAvailable() {
  return 'speechSynthesis' in window
}

// Get the best available voice for a language
function getVoiceForLanguage(lang = 'en') {
  const voices = window.speechSynthesis.getVoices()

  // Try to find a voice matching the language
  const langCode = lang === 'vi' ? 'vi' : 'en'
  let voice = voices.find(v => v.lang.startsWith(langCode))

  // Fallback to any available voice
  if (!voice && voices.length > 0) {
    voice = voices[0]
  }

  return voice
}

// Speak text aloud
export function speak(text, options = {}) {
  if (!isSpeechAvailable()) return Promise.resolve()

  return new Promise((resolve) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Set voice based on language
    const voice = getVoiceForLanguage(options.lang || 'en')
    if (voice) {
      utterance.voice = voice
    }

    // Set speech parameters for clarity (good for seniors)
    utterance.rate = options.rate || 0.85  // Slower for better comprehension
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    window.speechSynthesis.speak(utterance)
  })
}

// Speak multiple texts in sequence (useful for bilingual instructions)
export async function speakSequence(texts) {
  for (const item of texts) {
    if (typeof item === 'string') {
      await speak(item)
    } else {
      // Object with text and options: { text: '...', lang: 'vi' }
      await speak(item.text, item)
    }
    // Small pause between items
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// Stop any ongoing speech
export function stopSpeaking() {
  if (isSpeechAvailable()) {
    window.speechSynthesis.cancel()
  }
}

// Check if currently speaking
export function isSpeaking() {
  if (!isSpeechAvailable()) return false
  return window.speechSynthesis.speaking
}

// Preload voices (call early, voices may load async)
export function preloadVoices() {
  if (isSpeechAvailable()) {
    // Trigger voice loading
    window.speechSynthesis.getVoices()

    // Also listen for voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }
}
