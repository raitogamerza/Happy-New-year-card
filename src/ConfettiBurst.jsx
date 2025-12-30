import React, { useMemo } from 'react'

export default function ConfettiBurst({ count = 60, spread = 420, duration = 1600 }) {
  const pieces = useMemo(() => {
    const colors = ['#ff4d4f', '#4da3ff', '#30c463', '#ff80b5', '#ffd23f', '#9b6cff', '#ff9c33']
    return Array.from({ length: count }).map((_, i) => {
      const ang = Math.random() * Math.PI * 2
      const dist = (0.45 + Math.random() * 0.55) * spread
      const x = Math.cos(ang) * dist
      const y = Math.sin(ang) * dist
      const rot = Math.random() * 360
      const size = 6 + Math.random() * 8
      const dur = (duration * (0.8 + Math.random() * 0.6)) / 1000
      const c = colors[i % colors.length]
      const shape = Math.random()
      return { x, y, rot, dur, size, c, shape }
    })
  }, [count, spread, duration])

  return (
    <div className="confetti-burst" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={p.shape > 0.66 ? 'confetti confetti-tri' : p.shape > 0.33 ? 'confetti confetti-round' : 'confetti'}
          style={{
            '--x': `${p.x}`,
            '--y': `${p.y}`,
            '--r': `${p.rot}`,
            '--d': `${p.dur}s`,
            '--c': p.c,
            '--sz': `${p.size}px`,
          }}
        />
      ))}
    </div>
  )
}
