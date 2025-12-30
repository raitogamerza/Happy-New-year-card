import React from 'react'

const count = 120

function random(min, max) {
  return Math.random() * (max - min) + min
}

export default function Snow() {
  const flakes = Array.from({ length: count }).map((_, i) => {
    const size = random(2, 6)
    const left = random(0, 100)
    const duration = random(6, 12)
    const delay = random(0, 6)
    const opacity = random(0.3, 0.9)
    return (
      <span
        key={i}
        className="flake"
        style={{
          left: `${left}%`,
          width: size,
          height: size,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          opacity,
        }}
      />
    )
  })

  return <div className="snow" aria-hidden="true">{flakes}</div>
}
