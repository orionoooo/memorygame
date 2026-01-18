import { useState, useEffect } from 'react'
import { speak, speakSequence, stopSpeaking, isSpeaking, isSpeechAvailable } from '../../lib/speech'

// Floating help button that shows game instructions
export function HelpButton({
  gameTitle,
  gameTitleVi,
  instructions, // Array of { en: '...', vi: '...' } objects
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpeakingState, setIsSpeakingState] = useState(false)

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking()
      setIsSpeakingState(false)
    }
  }, [isOpen])

  // Read all instructions aloud
  const handleReadAloud = async () => {
    if (isSpeakingState) {
      stopSpeaking()
      setIsSpeakingState(false)
      return
    }

    setIsSpeakingState(true)

    // Build speech sequence
    const sequence = [
      { text: `How to play ${gameTitle}`, lang: 'en' },
    ]

    // Add each instruction in both languages
    for (const instruction of instructions) {
      sequence.push({ text: instruction.en, lang: 'en' })
      if (instruction.vi) {
        sequence.push({ text: instruction.vi, lang: 'vi' })
      }
    }

    await speakSequence(sequence)
    setIsSpeakingState(false)
  }

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-600
          text-white text-2xl font-bold
          shadow-lg shadow-indigo-500/30
          hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40
          active:scale-95
          transition-all duration-200
          flex items-center justify-center
          ${className}
        `}
        aria-label="Help - How to play"
        title="Help - How to play"
      >
        ?
      </button>

      {/* Help modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{gameTitle}</h2>
                  {gameTitleVi && (
                    <p className="text-white/80 text-lg">{gameTitleVi}</p>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close help"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Play
              </h3>

              <ol className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg">
                      {index + 1}
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 text-lg leading-relaxed">
                        {instruction.en}
                      </p>
                      {instruction.vi && (
                        <p className="text-indigo-600 mt-1">
                          {instruction.vi}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer with actions */}
            <div className="border-t border-slate-100 p-4 flex gap-3">
              {isSpeechAvailable() && (
                <button
                  onClick={handleReadAloud}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-semibold text-lg transition-all
                    ${isSpeakingState
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    }
                  `}
                >
                  {isSpeakingState ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Read Aloud
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Simple inline help text with read aloud option
export function InlineHelp({ text, textVi, className = '' }) {
  const [isSpeakingState, setIsSpeakingState] = useState(false)

  const handleReadAloud = async () => {
    if (isSpeakingState) {
      stopSpeaking()
      setIsSpeakingState(false)
      return
    }

    setIsSpeakingState(true)

    const sequence = [{ text, lang: 'en' }]
    if (textVi) {
      sequence.push({ text: textVi, lang: 'vi' })
    }

    await speakSequence(sequence)
    setIsSpeakingState(false)
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-1">
        <p className="text-slate-700">{text}</p>
        {textVi && <p className="text-indigo-600 mt-1">{textVi}</p>}
      </div>
      {isSpeechAvailable() && (
        <button
          onClick={handleReadAloud}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${isSpeakingState
              ? 'bg-red-100 text-red-600'
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            }
          `}
          aria-label={isSpeakingState ? 'Stop reading' : 'Read aloud'}
          title={isSpeakingState ? 'Stop reading' : 'Read aloud'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSpeakingState ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>
      )}
    </div>
  )
}
