import React from 'react'

export default function SantaSleigh({ onClick }) {
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick && onClick()
    }
  }
  return (
    <div className="santa-sleigh" role="button" tabIndex={0} aria-label="Santa sleigh" title="Santa" onClick={onClick} onKeyDown={onKey}>
      <svg className="santa-svg" width="360" height="140" viewBox="0 0 360 140" role="img" aria-label="Santa sleigh">
        <g className="santa-bob" transform="translate(0,0)">
          {/* Reindeers */}
          <g className="reindeers" transform="translate(20,70)">
            {Array.from({ length: 3 }).map((_, i) => {
              const dx = i * 80
              const isLead = i === 0
              return (
                <g key={i} transform={`translate(${dx},0)`} className="reindeer">
                  <ellipse cx="0" cy="0" rx="22" ry="9" fill="#8b6f52" className="body" />
                  <circle cx="20" cy="-5" r="7" fill="#8b6f52" className="head" />
                  <circle cx="24" cy="-5" r="2.6" fill="#e63946" className={isLead ? 'rudolph' : ''} />
                  {/* antlers */}
                  <path d="M18 -10 l6 -6 m-4 4 l6 -6" stroke="#ccb89a" strokeWidth="2" fill="none" />
                  {/* legs */}
                  <g className="legs" stroke="#5a4635" strokeWidth="3" strokeLinecap="round">
                    <line x1="-10" y1="8" x2="-14" y2="18" />
                    <line x1="2" y1="8" x2="-2" y2="18" />
                    <line x1="10" y1="8" x2="6" y2="18" />
                    <line x1="-2" y1="8" x2="-6" y2="18" />
                  </g>
                </g>
              )
            })}
          </g>

          {/* Sleigh + Santa */}
          <g className="sleigh" transform="translate(260,82)">
            {/* sled runners */}
            <path d="M-40 22 h70 c10 0 10 10 0 10 h-80" stroke="#7a0c13" strokeWidth="4" fill="none" />
            {/* sleigh body */}
            <path d="M-40 -10 h70 v22 c0 10 -10 12 -22 12 h-38 c-12 0 -20 -8 -20 -18 z" fill="#b3131b" />
            <path d="M20 -10 q18 -6 22 12 l-22 0 z" fill="#b3131b" />
            {/* gold trim */}
            <path d="M-38 -8 h66 v18 c0 6 -8 9 -18 9 h-38 c-10 0 -16 -6 -16 -14 z" stroke="#d4af37" strokeWidth="2" fill="none" />
            {/* Santa */}
            <g transform="translate(0,-6)">
              <circle cx="0" cy="0" r="8" fill="#ffead6" />
              <path d="M-8 -5 h16 v10 h-16 z" fill="#b3131b" />
              {/* hat */}
              <path d="M-6 -10 l12 0 l-8 -10 z" fill="#b3131b" />
              <circle cx="6" cy="-10" r="2.2" fill="#ffffff" />
            </g>
          </g>

          {/* trailing sparkles */}
          <g className="trail" transform="translate(220,82)">
            {Array.from({ length: 10 }).map((_, i) => (
              <circle key={i} cx={-i * 16} cy={(Math.sin(i) * 6).toFixed(1)} r="2.6" fill="#ffd23f" className="spark" style={{ '--d': `${i * 0.12}s` }} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
