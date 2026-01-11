import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { getTodayResults } from '../lib/storage'
import { getTodayTheme } from '../data/themes'

const encouragingMessages = [
  {
    title: "You're amazing!",
    titleVi: "Mẹ giỏi lắm!",
    message: "Every moment you spend exercising your mind makes a difference. You did wonderfully today!",
    messageVi: "Mỗi phút mẹ tập luyện đều có ích. Hôm nay mẹ làm tốt lắm!"
  },
  {
    title: "So proud of you!",
    titleVi: "Con tự hào về mẹ!",
    message: "You showed up and tried your best. That's what matters most!",
    messageVi: "Mẹ đã cố gắng hết mình. Đó là điều quan trọng nhất!"
  },
  {
    title: "Wonderful work!",
    titleVi: "Làm tốt lắm!",
    message: "Your brain thanks you for this workout! See you again soon.",
    messageVi: "Não của mẹ cảm ơn mẹ! Hẹn gặp lại mẹ sớm."
  },
  {
    title: "You're a star!",
    titleVi: "Mẹ là ngôi sao!",
    message: "It doesn't matter how much you did - what matters is that you tried. You're doing great!",
    messageVi: "Không quan trọng mẹ làm được bao nhiêu - quan trọng là mẹ đã cố gắng. Mẹ đang làm rất tốt!"
  },
  {
    title: "Happy Feet, Happy Heart!",
    titleVi: "Chân vui, tim vui!",
    message: "Just like the penguins, you danced your way through today! Keep waddling along!",
    messageVi: "Giống như chim cánh cụt, mẹ đã nhảy múa suốt ngày hôm nay! Tiếp tục đi mẹ!"
  },
  {
    title: "Keep shining!",
    titleVi: "Mẹ thật tuyệt vời!",
    message: "Every little bit of practice helps keep your mind strong. Well done!",
    messageVi: "Mỗi chút luyện tập đều giúp trí óc mạnh mẽ. Mẹ làm tốt lắm!"
  }
]

export function DailyComplete() {
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [todayStats, setTodayStats] = useState({ count: 0, score: 0 })
  const theme = getTodayTheme()

  useEffect(() => {
    // Pick a random encouraging message
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
    setMessage(randomMessage)

    // Get today's stats
    const loadStats = async () => {
      const results = await getTodayResults()
      setTodayStats({
        count: results.length,
        score: results.reduce((sum, r) => sum + (r.score || 0), 0)
      })
    }
    loadStats()
  }, [])

  if (!message) return null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="text-center py-12">
        {/* Dancing penguins */}
        <div className="flex justify-center gap-4 mb-6">
          <span className="text-6xl animate-bounce" style={{ animationDuration: '1s' }}>🐧</span>
          <span className="text-7xl animate-bounce" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }}>🐧</span>
          <span className="text-6xl animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.4s' }}>🐧</span>
        </div>

        <h1 className="text-4xl font-bold text-[#5cb85c] mb-2">
          {message.title}
        </h1>
        <p className="text-2xl text-[#4a90a4] mb-8">
          {message.titleVi}
        </p>

        <div className="bg-white/50 rounded-2xl p-8 mb-8 max-w-md mx-auto">
          <p className="text-xl text-[#2c3e50] mb-4">
            {message.message}
          </p>
          <p className="text-lg text-[#4a90a4]">
            {message.messageVi}
          </p>
        </div>

        {todayStats.count > 0 && (
          <div className="mb-8 bg-[#5cb85c]/10 rounded-xl p-4 inline-block">
            <p className="text-xl text-[#5cb85c] font-semibold">
              🎉 Today you played {todayStats.count} game{todayStats.count !== 1 ? 's' : ''}!
            </p>
            <p className="text-lg text-[#4a90a4]">
              Hôm nay mẹ đã chơi {todayStats.count} trò!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-2xl text-[#2c3e50]">
            See you next time! 👋
          </p>
          <p className="text-xl text-[#4a90a4]">
            Hẹn gặp lại mẹ! 🐧💕
          </p>
        </div>

        <div className="mt-8">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Home 🏠
          </Button>
        </div>
      </Card>

      {/* Extra encouragement */}
      <div className="text-center text-gray-500">
        <p className="text-lg">
          {theme.decoration} Every day you practice, your brain says "thank you!" {theme.decoration}
        </p>
      </div>
    </div>
  )
}
