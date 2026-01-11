// Positive reinforcement messages for building confidence

export const correctMessages = [
  { en: "Wonderful!", vi: "Tuyệt vời!" },
  { en: "Great job!", vi: "Giỏi lắm!" },
  { en: "You got it!", vi: "Đúng rồi!" },
  { en: "Excellent!", vi: "Xuất sắc!" },
  { en: "Amazing!", vi: "Tuyệt quá!" },
  { en: "Perfect!", vi: "Hoàn hảo!" },
  { en: "Brilliant!", vi: "Thông minh quá!" },
  { en: "You're doing great!", vi: "Mẹ làm tốt lắm!" },
  { en: "Keep it up!", vi: "Tiếp tục nhé!" },
  { en: "Fantastic!", vi: "Tuyệt diệu!" },
]

export const incorrectMessages = [
  { en: "Good try!", vi: "Cố gắng tốt!" },
  { en: "Almost there!", vi: "Gần đúng rồi!" },
  { en: "Nice effort!", vi: "Cố gắng tốt!" },
  { en: "Keep going!", vi: "Tiếp tục nhé!" },
  { en: "You're learning!", vi: "Mẹ đang học!" },
  { en: "That's okay!", vi: "Không sao!" },
  { en: "Let's try another!", vi: "Thử câu khác nhé!" },
]

export const completionMessages = [
  {
    en: "You did wonderfully!",
    vi: "Mẹ làm tuyệt vời!",
    subEn: "Every bit of practice helps your brain stay strong.",
    subVi: "Mỗi lần tập luyện đều giúp não khỏe mạnh."
  },
  {
    en: "Great work today!",
    vi: "Hôm nay mẹ làm tốt lắm!",
    subEn: "You should be proud of yourself!",
    subVi: "Mẹ nên tự hào về mình!"
  },
  {
    en: "Amazing effort!",
    vi: "Cố gắng tuyệt vời!",
    subEn: "Your brain is getting stronger!",
    subVi: "Não của mẹ đang khỏe hơn!"
  },
  {
    en: "Well done!",
    vi: "Làm tốt lắm!",
    subEn: "You're making progress every day!",
    subVi: "Mẹ tiến bộ mỗi ngày!"
  },
]

export const startMessages = [
  { en: "Let's have some fun!", vi: "Chơi vui nhé!" },
  { en: "You've got this!", vi: "Mẹ làm được!" },
  { en: "Ready when you are!", vi: "Sẵn sàng chưa mẹ!" },
  { en: "Let's exercise our brain!", vi: "Tập luyện não nào!" },
]

export function getRandomCorrectMessage() {
  return correctMessages[Math.floor(Math.random() * correctMessages.length)]
}

export function getRandomIncorrectMessage() {
  return incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)]
}

export function getRandomCompletionMessage() {
  return completionMessages[Math.floor(Math.random() * completionMessages.length)]
}

export function getRandomStartMessage() {
  return startMessages[Math.floor(Math.random() * startMessages.length)]
}

// Celebration emojis for variety
export const celebrationEmojis = ['🌟', '💖', '🎉', '✨', '🌈', '💪', '🏆', '🌸', '💐', '🦋', '⭐', '💕']

export function getRandomEmoji() {
  return celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]
}
