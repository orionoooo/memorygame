import { useState, useEffect } from 'react'

// Font size modes with labels
const FONT_SIZES = [
  { id: 'normal', label: 'A', title: 'Normal text', class: '' },
  { id: 'large', label: 'A', title: 'Large text', class: 'large-text' },
  { id: 'extra-large', label: 'A', title: 'Extra large text', class: 'extra-large-text' },
]

// Get saved preference or default to normal
function getSavedFontSize() {
  if (typeof window === 'undefined') return 'normal'
  return localStorage.getItem('fontSizePreference') || 'normal'
}

// Apply font size class to document root
function applyFontSize(sizeId) {
  const root = document.documentElement

  // Remove all font size classes
  FONT_SIZES.forEach(size => {
    if (size.class) root.classList.remove(size.class)
  })

  // Add the selected class
  const selectedSize = FONT_SIZES.find(s => s.id === sizeId)
  if (selectedSize?.class) {
    root.classList.add(selectedSize.class)
  }

  // Save preference
  localStorage.setItem('fontSizePreference', sizeId)
}

export function FontSizeToggle() {
  const [currentSize, setCurrentSize] = useState('normal')

  // Load saved preference on mount
  useEffect(() => {
    const saved = getSavedFontSize()
    setCurrentSize(saved)
    applyFontSize(saved)
  }, [])

  const handleSizeChange = (sizeId) => {
    setCurrentSize(sizeId)
    applyFontSize(sizeId)
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      {FONT_SIZES.map((size, index) => (
        <button
          key={size.id}
          onClick={() => handleSizeChange(size.id)}
          title={size.title}
          className={`
            flex items-center justify-center rounded-lg transition-all duration-200
            min-w-[40px] min-h-[40px]
            ${currentSize === size.id
              ? 'bg-white text-indigo-600 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }
          `}
          style={{
            fontSize: index === 0 ? '14px' : index === 1 ? '18px' : '22px',
          }}
          aria-pressed={currentSize === size.id}
          aria-label={size.title}
        >
          {size.label}
        </button>
      ))}
    </div>
  )
}

// Compact version for mobile/tight spaces
export function FontSizeToggleCompact() {
  const [currentSize, setCurrentSize] = useState('normal')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = getSavedFontSize()
    setCurrentSize(saved)
    applyFontSize(saved)
  }, [])

  const handleSizeChange = (sizeId) => {
    setCurrentSize(sizeId)
    applyFontSize(sizeId)
    setIsOpen(false)
  }

  const currentIndex = FONT_SIZES.findIndex(s => s.id === currentSize)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        aria-label="Change text size"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">
          {currentIndex === 0 ? 'A' : currentIndex === 1 ? 'A+' : 'A++'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 min-w-[180px]">
            <p className="text-xs text-slate-500 uppercase tracking-wide px-3 py-2">
              Text Size
            </p>
            {FONT_SIZES.map((size, index) => (
              <button
                key={size.id}
                onClick={() => handleSizeChange(size.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                  ${currentSize === size.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <span
                  className="font-bold"
                  style={{ fontSize: index === 0 ? '16px' : index === 1 ? '20px' : '24px' }}
                >
                  A
                </span>
                <span className="text-base">
                  {size.id === 'normal' ? 'Normal' : size.id === 'large' ? 'Large' : 'Extra Large'}
                </span>
                {currentSize === size.id && (
                  <svg className="w-5 h-5 ml-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
