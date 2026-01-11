// Penguin-themed backgrounds and decorations
// Changes daily to keep things fresh and fun!

export const dailyThemes = [
  {
    name: 'Arctic Morning',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
    accent: '#4dd0e1',
    penguin: '🐧',
    decoration: '❄️',
    greeting: 'Good morning, sunshine!',
    greetingVi: 'Chào buổi sáng!'
  },
  {
    name: 'Snowy Day',
    background: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 50%, #b0bec5 100%)',
    accent: '#78909c',
    penguin: '🐧',
    decoration: '⛄',
    greeting: 'What a beautiful day!',
    greetingVi: 'Ngày đẹp quá!'
  },
  {
    name: 'Ocean Breeze',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
    accent: '#42a5f5',
    penguin: '🐧',
    decoration: '🌊',
    greeting: 'Ready for some fun?',
    greetingVi: 'Sẵn sàng vui chơi chưa?'
  },
  {
    name: 'Sunset Ice',
    background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #f48fb1 100%)',
    accent: '#ec407a',
    penguin: '🐧',
    decoration: '🌅',
    greeting: 'You make every day special!',
    greetingVi: 'Mẹ làm mỗi ngày đặc biệt!'
  },
  {
    name: 'Northern Lights',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    accent: '#66bb6a',
    penguin: '🐧',
    decoration: '✨',
    greeting: 'Shine bright today!',
    greetingVi: 'Tỏa sáng hôm nay!'
  },
  {
    name: 'Lavender Ice',
    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)',
    accent: '#ab47bc',
    penguin: '🐧',
    decoration: '💜',
    greeting: 'Sending you love!',
    greetingVi: 'Gửi tình yêu đến mẹ!'
  },
  {
    name: 'Warm Sunshine',
    background: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 50%, #fff59d 100%)',
    accent: '#ffee58',
    penguin: '🐧',
    decoration: '☀️',
    greeting: 'A warm hello to you!',
    greetingVi: 'Chào mẹ thật ấm áp!'
  },
]

// Get today's theme based on the date
export function getTodayTheme() {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const themeIndex = dayOfYear % dailyThemes.length
  return dailyThemes[themeIndex]
}

// Cute penguin messages that appear randomly
export const penguinMessages = [
  { en: "You're doing great!", vi: "Mẹ làm tốt lắm!", emoji: "🐧💕" },
  { en: "Keep waddling along!", vi: "Tiếp tục đi mẹ!", emoji: "🐧✨" },
  { en: "You're amazing!", vi: "Mẹ tuyệt vời!", emoji: "🐧🌟" },
  { en: "Happy Feet, Happy Heart!", vi: "Chân vui, tim vui!", emoji: "🐧💖" },
  { en: "Dance like a penguin!", vi: "Nhảy như chim cánh cụt!", emoji: "🐧🎵" },
  { en: "Ice to see you!", vi: "Vui được gặp mẹ!", emoji: "🐧❄️" },
  { en: "You warm my heart!", vi: "Mẹ sưởi ấm tim con!", emoji: "🐧💝" },
]

export function getRandomPenguinMessage() {
  return penguinMessages[Math.floor(Math.random() * penguinMessages.length)]
}

// Animated penguin positions for decoration
export const penguinDecorations = ['🐧', '🐧', '🐧']
